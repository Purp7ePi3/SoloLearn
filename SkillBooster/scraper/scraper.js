const puppeteer = require('puppeteer');
const fs = require('fs');

class AerodromeScraper {
    constructor() {
        this.browser = null;
        this.page = null;
        this.baseUrl = 'https://aerodrome.finance';
    }

    async init() {
        try {
            console.log('Inizializzazione browser...');
            this.browser = await puppeteer.launch({
                headless: "new",
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-blink-features=AutomationControlled'
                ]
            });
            this.page = await this.browser.newPage();

            await this.page.setViewport({ width: 1920, height: 1080 });
            
            console.log('Browser inizializzato con successo');
        } catch (error) {
            console.error('Errore nell\'inizializzazione:', error);
            throw error;
        }
    }

    async scrapePools() {
        let allPools = [];
        let currentPage = 1;
        let hasMorePages = true;
        let foundZeroApr = false;

        try {
            console.log('Inizio scraping di tutte le pagine...');

            while (hasMorePages && !foundZeroApr) {
                console.log(`\n📄 Scraping pagina ${currentPage}...`);
                
              
                const pageUrl = currentPage === 1 
                    ? `${this.baseUrl}/liquidity` 
                    : `${this.baseUrl}/liquidity?sort=apr%3Adesc&page=${currentPage}`;
                
                console.log(`Navigando verso: ${pageUrl}`);
                
                await this.page.goto(pageUrl, {
                    waitUntil: 'networkidle2',
                    timeout: 60000
                });

                // Attendi che i link delle pool si carichino
                try {
                    await this.page.waitForSelector('a[href*="/deposit"]', {
                        timeout: 15000
                    });
                } catch (e) {
                    console.log(`Nessuna pool trovata nella pagina ${currentPage}, fine scraping`);
                    hasMorePages = false;
                    break;
                }

                // Attendi caricamento dinamico
                await new Promise(resolve => setTimeout(resolve, 3000));

                console.log(`Estrazione dati dalla pagina ${currentPage}...`);
                
                const pools = await this.page.evaluate((pageNum) => {
                    const poolData = [];
                    
                    // Seleziona tutti i link delle pool
                    const poolElements = document.querySelectorAll('a[href*="/deposit"][data-testid="liquidity-pool"], a[href*="/deposit"]:not([data-testid])');
                    console.log(`Trovati ${poolElements.length} elementi pool nella pagina ${pageNum}`);
                    
                    poolElements.forEach((poolLink, index) => {
                        try {
                            const pool = {
                                page: pageNum,
                                index: index + 1,
                                globalIndex: 0, // Sarà aggiornato dopo
                                pair: '',
                                poolType: '',
                                fee: '',
                                volume24h: '',
                                fees24h: '',
                                tvl: '',
                                apr: '',
                                aprNumeric: 0,
                                token0: {
                                    symbol: '',
                                    amount: '',
                                    address: '',
                                    volumeAmount: '',
                                    feeAmount: ''
                                },
                                token1: {
                                    symbol: '',
                                    amount: '',
                                    address: '',
                                    volumeAmount: '',
                                    feeAmount: ''
                                },
                                depositUrl: ''
                            };

                            // Estrai URL di deposit
                            pool.depositUrl = poolLink.href || '';
                            
                            // Estrai indirizzi token dall'URL
                            try {
                                const url = new URL(pool.depositUrl);
                                const urlParams = new URLSearchParams(url.search);
                                pool.token0.address = urlParams.get('token0') || '';
                                pool.token1.address = urlParams.get('token1') || '';
                            } catch (urlError) {
                                console.log(`Errore parsing URL per pool ${index}:`, urlError);
                            }

                            // Estrai nome della coppia
                            const pairElement = poolLink.querySelector('.whitespace-nowrap.text-sm.font-semibold');
                            if (pairElement) {
                                pool.pair = pairElement.textContent.trim();
                                
                                // Estrai simboli dei token
                                const tokens = pool.pair.split(' / ');
                                if (tokens.length === 2) {
                                    pool.token0.symbol = tokens[0].trim();
                                    pool.token1.symbol = tokens[1].trim();
                                }
                            }

                            // Estrai tipo di pool
                            const poolTypeElement = poolLink.querySelector('.text-xs.font-semibold.text-primary');
                            if (poolTypeElement) {
                                pool.poolType = poolTypeElement.textContent.trim();
                            }

                            // Estrai fee percentage
                            const feeElement = poolLink.querySelector('.bg-accent-10.text-accent-70');
                            if (feeElement) {
                                pool.fee = feeElement.textContent.trim();
                            }

                            // Estrai Volume
                            const volumeColumns = poolLink.querySelectorAll('.flex.justify-between.gap-4');
                            volumeColumns.forEach((column) => {
                                const label = column.querySelector('.text-accent-50');
                                if (label && label.textContent.trim().toLowerCase() === 'volume') {
                                    // Valore totale del volume
                                    const volumeTotal = column.querySelector('.lg\\:text-sm');
                                    if (volumeTotal) {
                                        pool.volume24h = volumeTotal.textContent.trim();
                                    }
                                    
                                    // Dettagli per token
                                    const tokenAmounts = column.querySelectorAll('span[data-test-amount]');
                                    tokenAmounts.forEach((tokenAmount, idx) => {
                                        const amount = tokenAmount.getAttribute('data-test-amount');
                                        
                                        if (idx === 0) {
                                            pool.token0.volumeAmount = amount;
                                        } else if (idx === 1) {
                                            pool.token1.volumeAmount = amount;
                                        }
                                    });
                                }
                            });

                            // Estrai Fees
                            volumeColumns.forEach((column) => {
                                const label = column.querySelector('.text-accent-50');
                                if (label && label.textContent.trim().toLowerCase() === 'fees') {
                                    // Valore totale delle fees
                                    const feesTotal = column.querySelector('.lg\\:text-sm');
                                    if (feesTotal) {
                                        pool.fees24h = feesTotal.textContent.trim();
                                    }
                                    
                                    // Dettagli per token
                                    const tokenAmounts = column.querySelectorAll('span[data-test-amount]');
                                    tokenAmounts.forEach((tokenAmount, idx) => {
                                        const amount = tokenAmount.getAttribute('data-test-amount');
                                        
                                        if (idx === 0) {
                                            pool.token0.feeAmount = amount;
                                        } else if (idx === 1) {
                                            pool.token1.feeAmount = amount;
                                        }
                                    });
                                }
                            });

                            // Estrai TVL
                            volumeColumns.forEach((column) => {
                                const label = column.querySelector('.text-accent-50');
                                if (label && label.textContent.trim().toLowerCase() === 'tvl') {
                                    // Valore totale TVL
                                    const tvlTotal = column.querySelector('.lg\\:text-sm, .flex.gap-2.lg\\:place-self-end.lg\\:text-sm');
                                    if (tvlTotal) {
                                        pool.tvl = tvlTotal.textContent.trim();
                                    }
                                    
                                    // Saldi dei token dalla TVL
                                    if (pool.token0.address) {
                                        const token0Balance = column.querySelector(`[data-testid="pool-balance-${pool.token0.address.toLowerCase()}"] span[data-test-amount]`);
                                        if (token0Balance) {
                                            pool.token0.amount = token0Balance.getAttribute('data-test-amount');
                                        }
                                    }
                                    
                                    if (pool.token1.address) {
                                        const token1Balance = column.querySelector(`[data-testid="pool-balance-${pool.token1.address.toLowerCase()}"] span[data-test-amount]`);
                                        if (token1Balance) {
                                            pool.token1.amount = token1Balance.getAttribute('data-test-amount');
                                        }
                                    }
                                }
                            });

                            // Estrai APR e convertilo in numero
                            const aprContainer = poolLink.querySelector('.flex.items-start.justify-between.gap-4');
                            if (aprContainer) {
                                const aprElement = aprContainer.querySelector('span[data-test-amount]');
                                if (aprElement) {
                                    const aprValue = aprElement.getAttribute('data-test-amount');
                                    if (aprValue) {
                                        pool.apr = `${aprValue}%`;
                                        pool.aprNumeric = parseFloat(aprValue);
                                    }
                                }
                            }

                            // Fallback per APR se non trovato
                            if (!pool.apr) {
                                const allPercentages = Array.from(poolLink.querySelectorAll('*')).map(el => el.textContent.trim());
                                for (const text of allPercentages) {
                                    const percentMatch = text.match(/^([0-9.]+)%$/);
                                    if (percentMatch && !text.includes('0.04') && !text.includes('0.3')) {
                                        pool.apr = text;
                                        pool.aprNumeric = parseFloat(percentMatch[1]);
                                        break;
                                    }
                                }
                            }

                            // Fallback generale per valori mancanti
                            if (!pool.volume24h || !pool.fees24h || !pool.tvl) {
                                const allValues = Array.from(poolLink.querySelectorAll('.lg\\:text-sm, .flex.gap-2')).map(el => el.textContent.trim());
                                
                                allValues.forEach(value => {
                                    if (value.startsWith('~$') && value.includes(',') && !pool.volume24h) {
                                        pool.volume24h = value;
                                    } else if (value.startsWith('~$') && (value.includes('M') || value.includes('K')) && !pool.tvl) {
                                        pool.tvl = value;
                                    } else if (value.startsWith('~$') && !pool.fees24h && pool.volume24h && pool.tvl) {
                                        pool.fees24h = value;
                                    }
                                });
                            }

                            poolData.push(pool);

                        } catch (error) {
                            console.error(`Errore nell'elaborazione pool ${index}:`, error);
                        }
                    });
                    
                    return poolData;
                }, currentPage);

                console.log(`✅ Estratte ${pools.length} pool dalla pagina ${currentPage}`);
                
                // Aggiungi indice globale
                pools.forEach((pool, idx) => {
                    pool.globalIndex = allPools.length + idx + 1;
                });

                // Aggiungi le pool alla lista totale
                allPools.push(...pools);

                // Verifica se ci sono pool con APR 0
                const zeroAprPools = pools.filter(pool => pool.aprNumeric === 0);
                if (zeroAprPools.length > 0) {
                    console.log(`🛑 Trovate ${zeroAprPools.length} pool con APR 0 nella pagina ${currentPage}`);
                    foundZeroApr = true;
                }

                // Verifica se ci sono più pagine
                if (pools.length === 0) {
                    console.log(`📄 Pagina ${currentPage} vuota, fine scraping`);
                    hasMorePages = false;
                } else if (pools.length < 10) { // Assumendo che normalmente ci sono ~20 pool per pagina
                    console.log(`📄 Poche pool nella pagina ${currentPage}, probabilmente ultima pagina`);
                    hasMorePages = false;
                } else {
                    if (currentPage == 3 ) {
                        hasMorePages = false;
                    }
                    currentPage++;
                    // Pausa tra le pagine per evitare rate limiting
                    console.log(`⏳ Pausa di 2 secondi prima della prossima pagina...`);
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                console.log(`📊 Totale pool raccolte finora: ${allPools.length}`);
            }

            // Ordina tutte le pool per APR decrescente
            allPools.sort((a, b) => b.aprNumeric - a.aprNumeric);

            // Aggiorna l'indice basato sul ranking APR
            allPools.forEach((pool, idx) => {
                pool.aprRank = idx + 1;
            });

            console.log(`\n🏁 SCRAPING COMPLETATO!`);
            console.log(`📄 Pagine scansionate: ${currentPage - 1}`);
            console.log(`🏊 Pool totali trovate: ${allPools.length}`);
            console.log(`🛑 Fermato per APR 0: ${foundZeroApr ? 'SI' : 'NO'}`);

            return allPools;

        } catch (error) {
            console.error('Errore nello scraping delle pool:', error);
            
            // Salva screenshot per debug
            try {
                await this.page.screenshot({ 
                    path: 'aerodrome_debug.png',
                    fullPage: true 
                });
                console.log('Screenshot salvato come aerodrome_debug.png');
            } catch (screenshotError) {
                console.error('Errore nel salvare screenshot:', screenshotError);
            }
            
            // Salva HTML per debug
            try {
                const html = await this.page.content();
                fs.writeFileSync('aerodrome_debug.html', html);
                console.log('HTML salvato come aerodrome_debug.html');
            } catch (htmlError) {
                console.error('Errore nel salvare HTML:', htmlError);
            }
            
            throw error;
        }
    }

    async saveToFile(data, filename = 'aerodrome_pools.json') {
        try {
            const jsonData = JSON.stringify(data, null, 2);
            fs.writeFileSync(filename, jsonData);
            console.log(`Dati salvati in ${filename}`);
        } catch (error) {
            console.error('Errore nel salvare file:', error);
            throw error;
        }
    }

    async saveToCsv(data, filename = 'aerodrome_pools.csv') {
        try {
            if (data.length === 0) {
                console.log('Nessun dato da salvare in CSV');
                return;
            }

            // Header CSV aggiornato
            const csvHeaders = [
                'APR Rank', 'Page', 'Index', 'Global Index', 'Pair', 'Pool Type', 'Fee', 'APR', 'APR Numeric',
                'Volume 24h', 'Fees 24h', 'TVL',
                'Token0 Symbol', 'Token0 Balance', 'Token0 Volume', 'Token0 Fees', 'Token0 Address',
                'Token1 Symbol', 'Token1 Balance', 'Token1 Volume', 'Token1 Fees', 'Token1 Address',
                'Deposit URL'
            ];

            // Dati CSV aggiornati
            const csvRows = data.map(pool => [
                pool.aprRank || pool.index,
                pool.page || 1,
                pool.index,
                pool.globalIndex || pool.index,
                pool.pair,
                pool.poolType,
                pool.fee,
                pool.apr,
                pool.aprNumeric || 0,
                pool.volume24h,
                pool.fees24h,
                pool.tvl,
                pool.token0.symbol,
                pool.token0.amount,
                pool.token0.volumeAmount,
                pool.token0.feeAmount,
                pool.token0.address,
                pool.token1.symbol,
                pool.token1.amount,
                pool.token1.volumeAmount,
                pool.token1.feeAmount,
                pool.token1.address,
                pool.depositUrl
            ]);

            // Combina header e righe
            const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
                .join('\n');

            fs.writeFileSync(filename, csvContent);
            console.log(`Dati CSV salvati in ${filename}`);
        } catch (error) {
            console.error('Errore nel salvare CSV:', error);
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('Browser chiuso');
        }
    }
}

// Funzione principale
async function main() {
    const scraper = new AerodromeScraper();
    
    try {
        await scraper.init();
        
        // Scraping di tutte le pool
        console.log('Inizio scraping delle pool...');
        const pools = await scraper.scrapePools();
        
        // Salva i dati in JSON e CSV
        await scraper.saveToFile(pools);
        await scraper.saveToCsv(pools);
        
        // Mostra risultati dettagliati
        console.log('\n=== RISULTATI SCRAPING AERODROME FINANCE ===');
        console.log(`Totale pool trovate: ${pools.length}`);
        
        if (pools.length > 0) {
            console.log('\n🏆 TOP 20 POOL PER APR (ORDINATE DAL PIÙ ALTO):');
            
            // Prendi le prime 20 pool ordinate per APR
            const topAprPools = pools.slice(0, 20);

            topAprPools.forEach((pool, index) => {
                console.log(`${index + 1}. 🥇 ${pool.pair || 'N/A'}`);
                console.log(`   📈 APR: ${pool.apr || 'N/A'} (${pool.aprNumeric || 0})`);
                console.log(`   💰 TVL: ${pool.tvl || 'N/A'}`);
                console.log(`   💱 Volume 24h: ${pool.volume24h || 'N/A'}`);
                console.log(`   💸 Fees 24h: ${pool.fees24h || 'N/A'}`);
                console.log(`   🏷️  Fee: ${pool.fee || 'N/A'}`);
                console.log(`   🔗 Type: ${pool.poolType || 'N/A'}`);
                console.log(`   📄 Pagina: ${pool.page || 1}`);
                console.log('   ---');
            });

            // Mostra le pool con APR 0 se trovate
            const zeroAprPools = pools.filter(pool => pool.aprNumeric === 0);
            if (zeroAprPools.length > 0) {
                console.log(`\n❌ POOL CON APR 0 (${zeroAprPools.length} trovate):`);
                zeroAprPools.slice(0, 5).forEach((pool, index) => {
                    console.log(`${index + 1}. ${pool.pair || 'N/A'} - Pagina: ${pool.page || 1}`);
                });
                if (zeroAprPools.length > 5) {
                    console.log(`... e altre ${zeroAprPools.length - 5} pool con APR 0`);
                }
            }

            // Statistiche avanzate per APR
            const poolsWithApr = pools.filter(p => p.aprNumeric > 0);
            const poolsWithTvl = pools.filter(p => p.tvl && p.tvl.includes('$'));
            const poolsWithVolume = pools.filter(p => p.volume24h && p.volume24h.includes('$'));
            
            console.log('\n📊 STATISTICHE DETTAGLIATE (ORDINATE PER APR):');
            console.log(`🏊 Pool totali: ${pools.length}`);
            console.log(`📈 Pool con APR > 0: ${poolsWithApr.length}`);
            console.log(`💰 Pool con TVL: ${poolsWithTvl.length}`);
            console.log(`💱 Pool con Volume: ${poolsWithVolume.length}`);
            console.log(`❌ Pool con APR = 0: ${zeroAprPools.length}`);
            
            if (poolsWithApr.length > 0) {
                const maxApr = Math.max(...poolsWithApr.map(pool => pool.aprNumeric));
                const minApr = Math.min(...poolsWithApr.filter(pool => pool.aprNumeric > 0).map(pool => pool.aprNumeric));
                const avgApr = poolsWithApr.reduce((sum, pool) => sum + pool.aprNumeric, 0) / poolsWithApr.length;
                
                console.log(`\n📈 ANALISI APR:`);
                console.log(`🔥 APR Massimo: ${maxApr.toFixed(2)}%`);
                console.log(`🧊 APR Minimo (>0): ${minApr.toFixed(2)}%`);
                console.log(`📊 APR Medio: ${avgApr.toFixed(2)}%`);
                
                // Trova la pool con l'APR più alto
                const topPool = pools.find(pool => pool.aprNumeric === maxApr);
                if (topPool) {
                    console.log(`🏆 Pool con APR più alto: ${topPool.pair} (${maxApr}%)`);
                }
            }

            // Mostra distribuzione per range di APR
            const aprRanges = [
                { min: 100, max: Infinity, label: '100%+' },
                { min: 50, max: 99.99, label: '50-99%' },
                { min: 20, max: 49.99, label: '20-49%' },
                { min: 10, max: 19.99, label: '10-19%' },
                { min: 5, max: 9.99, label: '5-9%' },
                { min: 1, max: 4.99, label: '1-4%' },
                { min: 0.01, max: 0.99, label: '0-1%' },
                { min: 0, max: 0, label: '0%' }
            ];

            console.log(`\n📊 DISTRIBUZIONE APR:`);
            aprRanges.forEach(range => {
                const count = pools.filter(pool => {
                    if (range.max === Infinity) {
                        return pool.aprNumeric >= range.min;
                    } else if (range.min === 0 && range.max === 0) {
                        return pool.aprNumeric === 0;
                    } else {
                        return pool.aprNumeric >= range.min && pool.aprNumeric <= range.max;
                    }
                }).length;
                
                if (count > 0) {
                    console.log(`${range.label}: ${count} pool`);
                }
            });

            // Mostra tipi di pool
            const poolTypes = [...new Set(pools.filter(p => p.poolType).map(p => p.poolType))];
            console.log(`\n🏊 Tipi di pool trovati: ${poolTypes.join(', ')}`);
        }
        
    } catch (error) {
        console.error('❌ Errore durante l\'esecuzione:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        await scraper.close();
    }
}

// Esporta la classe per uso modulare
module.exports = AerodromeScraper;

// Esegui se chiamato direttamente
if (require.main === module) {
    main().catch(console.error);
}