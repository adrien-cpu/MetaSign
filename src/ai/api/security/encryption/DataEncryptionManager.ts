//src/ai/api/security/encryption/DataEncryptionManager.ts

import { createCipheriv, createDecipheriv, randomBytes, createHash, scrypt } from 'crypto';

export interface SecurityAuditor {
    logEncryption(data: { operation: string; keyId: string; context?: string | undefined; timestamp: number }): Promise<void>;
    logError(data: { operation: string; error: string; context?: string | undefined; timestamp: number }): Promise<void>;
    logKeyRotation(data: { oldKeyId: string; newKeyId: string; timestamp: number }): Promise<void>;
    logWarning(data: { type: string; message: string; keyId?: string | undefined; timestamp: number }): Promise<void>;
}


export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    keyRotationPeriod: number; // en jours
    saltLength: number;
    ivLength: number;
}

export interface EncryptedData {
    iv: string;
    encryptedValue: string;
    keyId: string;
    algorithm: string;
    timestamp: number;
}

export interface KeyRotationPolicy {
    enabled: boolean;
    notifyBefore: number; // jours avant rotation
    autoRotate: boolean;
    backupKeys: boolean;
}

export class DataEncryptionManager {
    private currentKeyId: string = '';
    private keyStore: Map<string, Buffer>;
    private lastRotation: number = 0;

    constructor(
        private readonly config: EncryptionConfig,
        private readonly securityAuditor: SecurityAuditor,
        private readonly rotationPolicy: KeyRotationPolicy
    ) {
        this.keyStore = new Map();
        this.initializeEncryption();
    }

    public async encrypt(data: string | Record<string, unknown>, context?: string): Promise<EncryptedData> {
        try {
            // Générer un IV unique
            const iv = randomBytes(this.config.ivLength);

            // Chiffrer les données
            const cipher = createCipheriv(
                this.config.algorithm,
                this.keyStore.get(this.currentKeyId)!,
                iv
            );

            const encryptedData = Buffer.concat([
                cipher.update(typeof data === 'string' ? data : JSON.stringify(data), 'utf8'),
                cipher.final()
            ]);

            const result = {
                iv: iv.toString('hex'),
                encryptedValue: encryptedData.toString('hex'),
                keyId: this.currentKeyId,
                algorithm: this.config.algorithm,
                timestamp: Date.now()
            };

            // Audit du chiffrement
            await this.securityAuditor.logEncryption({
                operation: 'encrypt',
                keyId: this.currentKeyId,
                context,
                timestamp: Date.now()
            });

            return result;
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'encryption',
                error: error instanceof Error ? error.message : 'Unknown error',
                context,
                timestamp: Date.now()
            });
            throw new Error('Encryption failed');
        }
    }

    public async decrypt(encryptedData: EncryptedData, context?: string): Promise<string | Record<string, unknown>> {
        try {
            // Vérifier si la clé existe
            if (!this.keyStore.has(encryptedData.keyId)) {
                throw new Error('Decryption key not found');
            }

            const key = this.keyStore.get(encryptedData.keyId)!;
            const iv = Buffer.from(encryptedData.iv, 'hex');
            const encryptedValue = Buffer.from(encryptedData.encryptedValue, 'hex');

            // Déchiffrer les données
            const decipher = createDecipheriv(encryptedData.algorithm, key, iv);
            const decrypted = Buffer.concat([
                decipher.update(encryptedValue),
                decipher.final()
            ]);

            // Audit du déchiffrement
            await this.securityAuditor.logEncryption({
                operation: 'decrypt',
                keyId: encryptedData.keyId,
                context,
                timestamp: Date.now()
            });

            try {
                return JSON.parse(decrypted.toString('utf8'));
            } catch {
                return decrypted.toString('utf8');
            }
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'decryption',
                error: error instanceof Error ? error.message : 'Unknown error',
                context,
                timestamp: Date.now()
            });
            throw new Error('Decryption failed');
        }
    }

    public async rotateKey(): Promise<void> {
        try {
            const oldKeyId = this.currentKeyId;
            // Générer une nouvelle clé
            const { keyId, key } = await this.generateKey();
            this.currentKeyId = keyId;
            this.keyStore.set(keyId, key);

            if (this.rotationPolicy.backupKeys) {
                // Garder l'ancienne clé pour le déchiffrement de données existantes
                this.keyStore.set(oldKeyId, this.keyStore.get(oldKeyId)!);
            } else {
                // Supprimer l'ancienne clé si la politique ne requiert pas de backup
                this.keyStore.delete(oldKeyId);
            }

            this.lastRotation = Date.now();

            // Audit de la rotation
            await this.securityAuditor.logKeyRotation({
                oldKeyId,
                newKeyId: keyId,
                timestamp: Date.now()
            });
        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'key_rotation',
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
            });
            throw new Error('Key rotation failed');
        }
    }

    public async reEncryptData(data: EncryptedData): Promise<EncryptedData> {
        // Déchiffrer avec l'ancienne clé
        const decrypted = await this.decrypt(data, 'reencryption');
        // Chiffrer avec la nouvelle clé
        return this.encrypt(decrypted, 'reencryption');
    }

    private async initializeEncryption(): Promise<void> {
        const { keyId, key } = await this.generateKey();
        this.currentKeyId = keyId;
        this.keyStore.set(keyId, key);
        this.lastRotation = Date.now();

        // Démarrer la vérification périodique de rotation des clés
        if (this.rotationPolicy.enabled) {
            setInterval(() => this.checkKeyRotation(), 24 * 60 * 60 * 1000); // Vérifier chaque jour
        }
    }

    private async generateKey(): Promise<{ keyId: string; key: Buffer }> {
        const salt = randomBytes(this.config.saltLength);
        return new Promise((resolve, reject) => {
            scrypt(
                randomBytes(32), // Mot de passe aléatoire
                salt,
                this.config.keySize,
                {
                    N: 16384,  // Coût CPU/mémoire
                    r: 8,      // Paramètre de blocage
                    p: 1       // Parallélisation
                },
                (err, key) => {
                    if (err) reject(err);
                    const keyId = createHash('sha256')
                        .update(key)
                        .digest('hex')
                        .slice(0, 8);
                    resolve({ keyId, key });
                }
            );
        });
    }

    private async checkKeyRotation(): Promise<void> {
        const daysSinceRotation = (Date.now() - this.lastRotation) / (24 * 60 * 60 * 1000);

        if (daysSinceRotation >= this.config.keyRotationPeriod) {
            if (this.rotationPolicy.autoRotate) {
                await this.rotateKey();
            } else if (daysSinceRotation >= this.config.keyRotationPeriod - this.rotationPolicy.notifyBefore) {
                // Notifier qu'une rotation est nécessaire
                await this.securityAuditor.logWarning({
                    type: 'key_rotation_needed',
                    message: 'Encryption key rotation is needed',
                    timestamp: Date.now()
                });
            }
        }
    }

    public getKeyAge(keyId: string): number {
        return keyId === this.currentKeyId
            ? (Date.now() - this.lastRotation) / (24 * 60 * 60 * 1000)
            : Infinity;
    }

    public async validateEncryptedData(data: EncryptedData): Promise<boolean> {
        // Vérifier que la clé existe
        if (!this.keyStore.has(data.keyId)) return false;

        // Vérifier l'algorithme
        if (data.algorithm !== this.config.algorithm) return false;

        // Vérifier la structure des données
        if (!data.iv || !data.encryptedValue) return false;

        // Vérifier l'âge des données
        const ageInDays = (Date.now() - data.timestamp) / (24 * 60 * 60 * 1000);
        if (ageInDays > this.config.keyRotationPeriod * 2) {
            // Données trop anciennes, nécessitent un re-chiffrement
            await this.securityAuditor.logWarning({
                type: 'old_encrypted_data',
                message: 'Encrypted data needs re-encryption',
                keyId: data.keyId,
                timestamp: Date.now()
            });
            return false;
        }

        return true;
    }
}