// ============================================================================
// FILE: trader.js - Bot principale per trading automatico su Aerodrome
// ============================================================================

const { ethers } = require('ethers');
const AerodromeScraper = require('./scraper');
const fs = require('fs');
const readline = require('readline');

// ABI essenziali
const AERODROME_ROUTER_ABI = [
    "function addLiquidity(address tokenA, address tokenB, bool stable, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
    "function removeLiquidity(address tokenA, address tokenB, bool stable, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
    "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
    "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)"
];

const POOL_ABI = [
    "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function token0() external view returns (address)",
    "function token1() external view returns (address)"
];

const FACTORY_ABI = [
    "function getPool(address tokenA, address tokenB, bool stable) external view returns (address)"
];

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';

class AerodromeManualTrader {
    constructor(config) {
        this.config = {
            rpcUrl: config.rpcUrl || 'https://mainnet.base.org',
            privateKey: config.privateKey,
            routerAddress: '0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43',
            factoryAddress: '0x420DD381b31aEf6683db6B902084cB0FFECe40Da',
            slippageTolerance: config.slippageTolerance || 1,
            rebalanceThreshold: config.rebalanceThreshold || 10,
            checkInterval: config.checkInterval || 300000,
            wethAmount: config.wethAmount || ethers.parseEther('0.1')
        };

        this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
        this.router = new ethers.Contract(this.config.routerAddress, AERODROME_ROUTER_ABI, this.wallet);
        
        this.positions = [];
        this.transactions = [];
        this.scraper = new AerodromeScraper();
        this.availablePools = [];
    }

    async init() {
        console.log('🚀 Inizializzazione Manual Trader...');
        console.log(`📍 Wallet: ${this.wallet.address}`);
        
        const balance = await this.provider.getBalance(this.wallet.address);
        console.log(`💰 Balance ETH: ${ethers.formatEther(balance)} ETH`);
        
        const wethContract = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, this.wallet);
        const wethBalance = await wethContract.balanceOf(this.wallet.address);
        console.log(`💰 Balance WETH: ${ethers.formatEther(wethBalance)} WETH`);
        
        await this.scraper.init();
        console.log('✅ Manual Trader pronto\n');
    }

    async loadAvailablePools() {
        console.log('🔍 Caricamento pool disponibili...');
        this.availablePools = await this.scraper.scrapePools();
        console.log(`✅ ${this.availablePools.length} pool caricate\n`);
        return this.availablePools;
    }

    async showPoolSelection() {
        const pools = await this.loadAvailablePools();
        
        console.log('═'.repeat(80));
        console.log('🏊 POOL DISPONIBILI (Top 30 per APR)');
        console.log('═'.repeat(80));
        
        const topPools = pools.slice(0, 30);
        
        topPools.forEach((pool, idx) => {
            const hasWeth = pool.token0.symbol.includes('WETH') || 
                           pool.token1.symbol.includes('WETH') ||
                           pool.token0.address.toLowerCase() === WETH_ADDRESS.toLowerCase() ||
                           pool.token1.address.toLowerCase() === WETH_ADDRESS.toLowerCase();
            
            const wethIndicator = hasWeth ? '💧 ' : '   ';
            
            console.log(`${wethIndicator}${idx + 1}. ${pool.pair}`);
            console.log(`     📈 APR: ${pool.apr} | 💰 TVL: ${pool.tvl} | 📊 Volume: ${pool.volume24h}`);
            console.log(`     🔗 Type: ${pool.poolType} | Fee: ${pool.fee}`);
            console.log(`     Token0: ${pool.token0.address}`);
            console.log(`     Token1: ${pool.token1.address}`);
            console.log('');
        });
        
        console.log('💧 = Pool contiene WETH\n');
    }

    async selectPoolsInteractive() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        await this.showPoolSelection();

        return new Promise((resolve) => {
            rl.question('Inserisci i numeri delle pool da monitorare (separati da virgola, es: 1,3,5): ', (answer) => {
                rl.close();
                
                const indices = answer.split(',').map(n => parseInt(n.trim()) - 1);
                const selectedPools = indices
                    .filter(i => i >= 0 && i < 30)
                    .map(i => this.availablePools[i]);
                
                console.log(`\n✅ Selezionate ${selectedPools.length} pool:\n`);
                selectedPools.forEach((pool, idx) => {
                    console.log(`${idx + 1}. ${pool.pair} - APR: ${pool.apr}`);
                });
                console.log('');
                
                resolve(selectedPools);
            });
        });
    }

    async getTokenDecimals(address) {
        const token = new ethers.Contract(address, ERC20_ABI, this.wallet);
        return await token.decimals();
    }

    async approveToken(tokenAddress, amount) {
        const token = new ethers.Contract(tokenAddress, ERC20_ABI, this.wallet);
        const allowance = await token.allowance(this.wallet.address, this.config.routerAddress);
        
        if (allowance < amount) {
            console.log(`✅ Approvazione token ${tokenAddress.slice(0, 8)}...`);
            const tx = await token.approve(this.config.routerAddress, ethers.MaxUint256);
            const receipt = await tx.wait();
            console.log(`✅ Token approvato. Gas: ${ethers.formatEther(receipt.gasUsed * receipt.gasPrice)} ETH`);
            return Number(ethers.formatEther(receipt.gasUsed * receipt.gasPrice));
        }
        return 0;
    }

    async swapWethForToken(tokenAddress, wethAmount) {
        console.log(`\n🔄 Swap WETH → Token...`);
        
        try {
            await this.approveToken(WETH_ADDRESS, wethAmount);
            
            const path = [WETH_ADDRESS, tokenAddress];
            const amounts = await this.router.getAmountsOut(wethAmount, path);
            const amountOutMin = amounts[1] * BigInt(100 - this.config.slippageTolerance * 100) / 100n;
            
            const deadline = Math.floor(Date.now() / 1000) + 1200;
            
            console.log(`   WETH in: ${ethers.formatEther(wethAmount)}`);
            console.log(`   Token out (min): ${ethers.formatUnits(amountOutMin, await this.getTokenDecimals(tokenAddress))}`);
            
            const tx = await this.router.swapExactTokensForTokens(
                wethAmount,
                amountOutMin,
                path,
                this.wallet.address,
                deadline
            );
            
            console.log(`⏳ Swap tx: ${tx.hash}`);
            const receipt = await tx.wait();
            
            const gasUsed = Number(ethers.formatEther(receipt.gasUsed * receipt.gasPrice));
            console.log(`✅ Swap completato! Gas: ${gasUsed.toFixed(6)} ETH`);
            
            return { txHash: tx.hash, gasUsed, amountOut: amounts[1] };
            
        } catch (error) {
            console.error('❌ Errore nello swap:', error.message);
            throw error;
        }
    }

    async enterPoolWithWeth(pool) {
        console.log(`\n💰 ENTRATA IN POOL: ${pool.pair}`);
        console.log(`📊 APR: ${pool.apr} | TVL: ${pool.tvl}`);
        
        const startTime = Date.now();
        const fees = { approval: 0, swap: 0, liquidity: 0, total: 0 };

        try {
            const isToken0Weth = pool.token0.address.toLowerCase() === WETH_ADDRESS.toLowerCase();
            const isToken1Weth = pool.token1.address.toLowerCase() === WETH_ADDRESS.toLowerCase();
            
            if (!isToken0Weth && !isToken1Weth) {
                throw new Error('❌ Questa pool non contiene WETH!');
            }

            const wethToken = isToken0Weth ? pool.token0 : pool.token1;
            const otherToken = isToken0Weth ? pool.token1 : pool.token0;
            
            console.log(`💧 WETH token: ${wethToken.symbol}`);
            console.log(`🪙 Other token: ${otherToken.symbol}`);
            
            const wethForPool = this.config.wethAmount / 2n;
            const wethForSwap = this.config.wethAmount / 2n;
            
            console.log(`\n📊 Strategia:`);
            console.log(`   WETH per pool: ${ethers.formatEther(wethForPool)}`);
            console.log(`   WETH per swap: ${ethers.formatEther(wethForSwap)}`);
            
            const swapResult = await this.swapWethForToken(otherToken.address, wethForSwap);
            fees.swap = swapResult.gasUsed;
            
            const token0Amount = isToken0Weth ? wethForPool : swapResult.amountOut;
            const token1Amount = isToken0Weth ? swapResult.amountOut : wethForPool;
            
            fees.approval += await this.approveToken(pool.token0.address, token0Amount);
            fees.approval += await this.approveToken(pool.token1.address, token1Amount);
            
            const amount0Min = token0Amount * BigInt(100 - this.config.slippageTolerance * 100) / 100n;
            const amount1Min = token1Amount * BigInt(100 - this.config.slippageTolerance * 100) / 100n;
            
            const isStable = pool.poolType.toLowerCase().includes('stable');
            const deadline = Math.floor(Date.now() / 1000) + 1200;

            console.log(`\n🔄 Aggiunta liquidità...`);
            const tx = await this.router.addLiquidity(
                pool.token0.address,
                pool.token1.address,
                isStable,
                token0Amount,
                token1Amount,
                amount0Min,
                amount1Min,
                this.wallet.address,
                deadline
            );

            console.log(`⏳ Tx: ${tx.hash}`);
            const receipt = await tx.wait();
            
            fees.liquidity = Number(ethers.formatEther(receipt.gasUsed * receipt.gasPrice));
            fees.total = fees.approval + fees.swap + fees.liquidity;

            console.log(`✅ Liquidità aggiunta!`);
            console.log(`⛽ Fees breakdown:`);
            console.log(`   Approval: ${fees.approval.toFixed(6)} ETH`);
            console.log(`   Swap: ${fees.swap.toFixed(6)} ETH`);
            console.log(`   Liquidity: ${fees.liquidity.toFixed(6)} ETH`);
            console.log(`   TOTALE: ${fees.total.toFixed(6)} ETH`);

            const position = {
                pool: pool,
                entryTime: new Date().toISOString(),
                entryBlock: receipt.blockNumber,
                wethUsed: this.config.wethAmount.toString(),
                token0Amount: token0Amount.toString(),
                token1Amount: token1Amount.toString(),
                txHash: tx.hash,
                swapTxHash: swapResult.txHash,
                fees: fees,
                active: true,
                isToken0Weth: isToken0Weth
            };

            this.positions.push(position);
            this.saveData();

            this.transactions.push({
                type: 'ENTER',
                pool: pool.pair,
                timestamp: new Date().toISOString(),
                txHash: tx.hash,
                fees: fees.total,
                duration: Date.now() - startTime
            });

            return position;

        } catch (error) {
            console.error('❌ Errore nell\'entrare in pool:', error.message);
            throw error;
        }
    }

    async exitPoolToWeth(position) {
        console.log(`\n🚪 USCITA DA POOL: ${position.pool.pair}`);
        
        const startTime = Date.now();
        const fees = { removal: 0, swap: 0, total: 0 };

        try {
            const poolAddress = await this.getPoolAddress(position.pool);
            const poolContract = new ethers.Contract(poolAddress, POOL_ABI, this.wallet);
            const lpBalance = await poolContract.balanceOf(this.wallet.address);

            if (lpBalance === 0n) {
                console.log('⚠️ Nessun LP token da rimuovere');
                return null;
            }

            console.log(`💎 LP Balance: ${ethers.formatEther(lpBalance)}`);

            await this.approveToken(poolAddress, lpBalance);

            const isStable = position.pool.poolType.toLowerCase().includes('stable');
            const deadline = Math.floor(Date.now() / 1000) + 1200;

            console.log('🔄 Rimozione liquidità...');
            const tx = await this.router.removeLiquidity(
                position.pool.token0.address,
                position.pool.token1.address,
                isStable,
                lpBalance,
                0,
                0,
                this.wallet.address,
                deadline
            );

            console.log(`⏳ Tx: ${tx.hash}`);
            const receipt = await tx.wait();
            fees.removal = Number(ethers.formatEther(receipt.gasUsed * receipt.gasPrice));

            const token0 = new ethers.Contract(position.pool.token0.address, ERC20_ABI, this.wallet);
            const token1 = new ethers.Contract(position.pool.token1.address, ERC20_ABI, this.wallet);
            
            const balance0 = await token0.balanceOf(this.wallet.address);
            const balance1 = await token1.balanceOf(this.wallet.address);

            console.log(`✅ Liquidità rimossa!`);
            console.log(`   Token0 ricevuti: ${ethers.formatUnits(balance0, await this.getTokenDecimals(position.pool.token0.address))}`);
            console.log(`   Token1 ricevuti: ${ethers.formatUnits(balance1, await this.getTokenDecimals(position.pool.token1.address))}`);

            const nonWethToken = position.isToken0Weth ? position.pool.token1 : position.pool.token0;
            const nonWethBalance = position.isToken0Weth ? balance1 : balance0;
            
            if (nonWethBalance > 0) {
                console.log(`\n🔄 Swap ${nonWethToken.symbol} → WETH...`);
                
                await this.approveToken(nonWethToken.address, nonWethBalance);
                
                const path = [nonWethToken.address, WETH_ADDRESS];
                const amounts = await this.router.getAmountsOut(nonWethBalance, path);
                const amountOutMin = amounts[1] * BigInt(100 - this.config.slippageTolerance * 100) / 100n;
                
                const swapTx = await this.router.swapExactTokensForTokens(
                    nonWethBalance,
                    amountOutMin,
                    path,
                    this.wallet.address,
                    deadline
                );
                
                const swapReceipt = await swapTx.wait();
                fees.swap = Number(ethers.formatEther(swapReceipt.gasUsed * swapReceipt.gasPrice));
                
                console.log(`✅ Swap completato! WETH ricevuti: ${ethers.formatEther(amounts[1])}`);
            }

            const wethContract = new ethers.Contract(WETH_ADDRESS, ERC20_ABI, this.wallet);
            const finalWethBalance = await wethContract.balanceOf(this.wallet.address);

            fees.total = fees.removal + fees.swap;
            const totalFees = position.fees.total + fees.total;
            const timeInPool = (new Date() - new Date(position.entryTime)) / 1000 / 60;

            const wethProfit = finalWethBalance - BigInt(position.wethUsed);
            const profitPercentage = Number(wethProfit) / Number(position.wethUsed) * 100;

            console.log(`\n💰 RISULTATI:`);
            console.log(`   WETH iniziale: ${ethers.formatEther(position.wethUsed)}`);
            console.log(`   WETH finale: ${ethers.formatEther(finalWethBalance)}`);
            console.log(`   Profitto: ${ethers.formatEther(wethProfit)} WETH (${profitPercentage.toFixed(2)}%)`);
            console.log(`   Fees totali: ${totalFees.toFixed(6)} ETH`);
            console.log(`   Tempo: ${(timeInPool / 60).toFixed(2)} ore`);

            position.active = false;
            position.exitTime = new Date().toISOString();
            position.exitBlock = receipt.blockNumber;
            position.exitTxHash = tx.hash;
            position.exitFees = fees;
            position.totalFees = totalFees;
            position.duration = timeInPool;
            position.finalWeth = finalWethBalance.toString();
            position.profit = wethProfit.toString();
            position.profitPercentage = profitPercentage;

            this.saveData();

            this.transactions.push({
                type: 'EXIT',
                pool: position.pool.pair,
                timestamp: new Date().toISOString(),
                txHash: tx.hash,
                fees: fees.total,
                profit: ethers.formatEther(wethProfit),
                profitPercentage: profitPercentage,
                duration: Date.now() - startTime
            });

            return position;

        } catch (error) {
            console.error('❌ Errore nell\'uscire da pool:', error.message);
            throw error;
        }
    }

    async getPoolAddress(pool) {
        const factory = new ethers.Contract(this.config.factoryAddress, FACTORY_ABI, this.provider);
        const isStable = pool.poolType.toLowerCase().includes('stable');
        const poolAddress = await factory.getPool(pool.token0.address, pool.token1.address, isStable);
        return poolAddress;
    }

    async monitorPositions(selectedPools) {
        console.log('\n🔍 Avvio monitoraggio posizioni...');
        console.log(`⏰ Check ogni ${this.config.checkInterval / 1000}s`);
        console.log(`📉 Soglia ribilanciamento: ${this.config.rebalanceThreshold}%\n`);

        const checkPositions = async () => {
            try {
                const activePositions = this.positions.filter(p => p.active);
                
                if (activePositions.length === 0) {
                    console.log('📭 Nessuna posizione attiva');
                    return;
                }

                console.log(`\n🔄 Check posizioni attive: ${activePositions.length}`);
                
                const currentPools = await this.scraper.scrapePools();

                for (const position of activePositions) {
                    const currentPoolData = currentPools.find(p => 
                        p.token0.address.toLowerCase() === position.pool.token0.address.toLowerCase() &&
                        p.token1.address.toLowerCase() === position.pool.token1.address.toLowerCase()
                    );

                    if (currentPoolData) {
                        const aprDrop = position.pool.aprNumeric - currentPoolData.aprNumeric;
                        const dropPercentage = (aprDrop / position.pool.aprNumeric) * 100;

                        console.log(`\n📊 ${position.pool.pair}:`);
                        console.log(`   APR entry: ${position.pool.apr}`);
                        console.log(`   APR current: ${currentPoolData.apr}`);
                        console.log(`   Variazione: ${dropPercentage.toFixed(2)}%`);

                        if (dropPercentage > this.config.rebalanceThreshold) {
                            console.log(`\n⚠️ REBALANCE NECESSARIO! APR sceso oltre ${this.config.rebalanceThreshold}%`);
                            
                            await this.exitPoolToWeth(position);
                            
                            const bestSelectedPool = selectedPools
                                .map(p => {
                                    const updated = currentPools.find(cp => 
                                        cp.token0.address === p.token0.address && 
                                        cp.token1.address === p.token1.address
                                    );
                                    return updated || p;
                                })
                                .sort((a, b) => b.aprNumeric - a.aprNumeric)[0];
                            
                            if (bestSelectedPool && bestSelectedPool.aprNumeric > currentPoolData.aprNumeric) {
                                console.log(`\n🎯 Nuova pool migliore: ${bestSelectedPool.pair} (${bestSelectedPool.apr})`);
                                await this.enterPoolWithWeth(bestSelectedPool);
                            } else {
                                console.log(`\n⏸️ Nessuna pool migliore disponibile, rimango in WETH`);
                            }
                        }
                    }
                }
                
            } catch (error) {
                console.error('❌ Errore nel monitoraggio:', error.message);
            }
        };

        for (const pool of selectedPools) {
            await this.enterPoolWithWeth(pool);
        }

        setInterval(checkPositions, this.config.checkInterval);
    }

    saveData() {
        fs.writeFileSync('positions.json', JSON.stringify(this.positions, null, 2));
        fs.writeFileSync('transactions.json', JSON.stringify(this.transactions, null, 2));
    }

    generateReport() {
        console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
        console.log('║                        📊 TRADING REPORT                               ║');
        console.log('╚════════════════════════════════════════════════════════════════════════╝');
        
        const activePos = this.positions.filter(p => p.active).length;
        const closedPos = this.positions.filter(p => !p.active).length;
        const totalFees = this.positions.reduce((sum, p) => sum + (p.totalFees || p.fees.total), 0);
        
        const closedPositions = this.positions.filter(p => !p.active && p.profit);
        const totalProfit = closedPositions.reduce((sum, p) => sum + Number(ethers.formatEther(p.profit)), 0);
        const avgProfitPercentage = closedPositions.length > 0 
            ? closedPositions.reduce((sum, p) => sum + p.profitPercentage, 0) / closedPositions.length 
            : 0;

        console.log(`\n💼 Posizioni:`);
        console.log(`   🟢 Attive: ${activePos}`);
        console.log(`   ✅ Chiuse: ${closedPos}`);
        console.log(`\n💰 Finanziari:`);
        console.log(`   Profitto totale: ${totalProfit.toFixed(6)} WETH`);
        console.log(`   Profitto medio: ${avgProfitPercentage.toFixed(2)}%`);
        console.log(`   Fees totali: ${totalFees.toFixed(6)} ETH`);
        console.log(`   Transazioni: ${this.transactions.length}`);

        if (this.positions.length > 0) {
            console.log('\n📋 DETTAGLIO POSIZIONI:');
            console.log('─'.repeat(76));
            
            this.positions.forEach((pos, idx) => {
                const status = pos.active ? '🟢 ATTIVA' : '🔴 CHIUSA';
                console.log(`\n${idx + 1}. ${pos.pool.pair} - ${status}`);
                console.log(`   APR: ${pos.pool.apr} | TVL: ${pos.pool.tvl}`);
                console.log(`   Entry: ${new Date(pos.entryTime).toLocaleString()}`);
                console.log(`   WETH investito: ${ethers.formatEther(pos.wethUsed)}`);
                
                if (!pos.active && pos.profit) {
                    console.log(`   Exit: ${new Date(pos.exitTime).toLocaleString()}`);
                    console.log(`   Durata: ${(pos.duration / 60).toFixed(2)} ore`);
                    console.log(`   Profitto: ${ethers.formatEther(pos.profit)} WETH (${pos.profitPercentage.toFixed(2)}%)`);
                    console.log(`   Fees: ${pos.totalFees.toFixed(6)} ETH`);
                }
            });
        }

        console.log('\n' + '═'.repeat(76) + '\n');
    }

    async cleanup() {
        console.log('\n🧹 Chiusura di tutte le posizioni...');
        
        const activePositions = this.positions.filter(p => p.active);
        for (const pos of activePositions) {
            await this.exitPoolToWeth(pos);
        }

        await this.scraper.close();
        this.generateReport();
        console.log('✅ Cleanup completato');
    }
}

// Main
async function main() {
    require('dotenv').config();
    
    const config = {
        privateKey: process.env.PRIVATE_KEY,
        rpcUrl: process.env.RPC_URL || 'https://mainnet.base.org',
        slippageTolerance: 1,
        rebalanceThreshold: 10,
        checkInterval: 300000,
        wethAmount: ethers.parseEther(process.env.WETH_AMOUNT || '0.1')
    };

    const trader = new AerodromeManualTrader(config);
    
    try {
        await trader.init();
        
        const selectedPools = await trader.selectPoolsInteractive();
        
        if (selectedPools.length === 0) {
            console.log('❌ Nessuna pool selezionata. Uscita.');
            process.exit(0);
        }

        await trader.monitorPositions(selectedPools);

        process.on('SIGINT', async () => {
            console.log('\n⚠️ Interruzione richiesta...');
            await trader.cleanup();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Errore fatale:', error);
        await trader.cleanup();
        process.exit(1);
    }
}

module.exports = AerodromeManualTrader;

if (require.main === module) {
    main().catch(console.error);
}