// encryption/CipherManager.ts
export class CipherManager {
    createCipher(key: CryptoKey, iv: Buffer): Cipher {
        return crypto.createCipheriv('aes-256-gcm', key, iv);
    }

    createDecipher(key: CryptoKey, iv: Buffer): Decipher {
        return crypto.createDecipheriv('aes-256-gcm', key, iv);
    }
}