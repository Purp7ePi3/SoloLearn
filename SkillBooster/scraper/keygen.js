// Node.js - raw secp256k1 private key + public key
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

// Generate a valid 32-byte secp256k1 private key (1 <= priv < n)
function genPrivateKeyHex() {
  while (true) {
    const priv = crypto.randomBytes(32);         // secure RNG
    try {
      const key = ec.keyFromPrivate(priv);      // will throw for invalid priv
      const bn = key.getPrivate();              // BN instance
      // ensure 0 < priv < curve.n
      if (bn.cmpn(0) > 0 && bn.cmp(ec.curve.n) < 0) {
        return priv.toString("hex");
      }
    } catch (e) {
      // loop again if invalid
    }
  }
}

const privHex = genPrivateKeyHex();
const keypair = ec.keyFromPrivate(privHex, "hex");
const pubCompressedHex = keypair.getPublic(true, "hex");  // compressed pubkey
const pubUncompressedHex = keypair.getPublic(false, "hex"); // uncompressed

console.log("private key (hex): 0x" + privHex);
console.log("pub compressed    : 0x" + pubCompressedHex);
console.log("pub uncompressed  : 0x" + pubUncompressedHex);
