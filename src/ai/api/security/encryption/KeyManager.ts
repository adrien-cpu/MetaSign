// src/ai/api/security/encryption/KeyManager.ts

interface SecurityContext {
    permissions: string[];
    encryptionLevel: 'standard' | 'high' | 'military';
    // Autres propriétés potentiellement nécessaires
}

interface CryptoKey {
    id: string;
    key: string;
    version: number;
    algorithm: string;
    createdAt: number;
    expiresAt: number;
    status: 'active' | 'rotating' | 'revoked' | 'archived';
    metadata: {
        purpose: string[];
        origin: string;
        lastRotation?: number;
        rotationCount: number;
    };
}

interface KeyRotationPolicy {
    automaticRotation: boolean;
    rotationInterval: number; // en millisecondes
    keyValidityPeriod: number; // en millisecondes
    minimumKeyAge: number; // en millisecondes
    retainArchivedKeys: boolean;
    archivalPeriod: number; // en millisecondes
}

interface KeyOperationResult {
    success: boolean;
    keyId?: string;
    error?: string;
    timestamp: number;
}

export class KeyManager {
    private readonly activeKeys = new Map<string, CryptoKey>();
    private readonly archivedKeys = new Map<string, CryptoKey>();
    private readonly DEFAULT_ROTATION_POLICY: KeyRotationPolicy = {
        automaticRotation: true,
        rotationInterval: 30 * 24 * 60 * 60 * 1000, // 30 jours
        keyValidityPeriod: 90 * 24 * 60 * 60 * 1000, // 90 jours
        minimumKeyAge: 1 * 24 * 60 * 60 * 1000, // 1 jour
        retainArchivedKeys: true,
        archivalPeriod: 365 * 24 * 60 * 60 * 1000 // 1 an
    };

    constructor(
        private rotationPolicy: KeyRotationPolicy = { ...this.DEFAULT_ROTATION_POLICY }
    ) {
        if (this.rotationPolicy.automaticRotation) {
            this.startAutomaticRotation();
        }
    }

    async getCurrentKey(): Promise<string> {
        const currentKey = await this.getOrCreateCurrentKey();
        return currentKey.key;
    }

    async getKey(context: SecurityContext): Promise<string> {
        await this.validateKeyAccess(context);
        return this.getCurrentKey();
    }

    async rotateKeys(): Promise<KeyOperationResult> {
        try {
            // Vérifier si la rotation est nécessaire
            const currentKey = await this.getOrCreateCurrentKey();
            if (!this.shouldRotateKey(currentKey)) {
                return {
                    success: true,
                    keyId: currentKey.id,
                    timestamp: Date.now()
                };
            }

            // Créer une nouvelle clé
            const newKey = await this.generateNewKey();

            // Archiver l'ancienne clé
            await this.archiveKey(currentKey);

            // Activer la nouvelle clé
            this.activeKeys.set(newKey.id, newKey);

            return {
                success: true,
                keyId: newKey.id,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error during key rotation',
                timestamp: Date.now()
            };
        }
    }

    private async getOrCreateCurrentKey(): Promise<CryptoKey> {
        // Trouver la clé active la plus récente
        let currentKey: CryptoKey | undefined;
        let latestTimestamp = 0;

        for (const key of this.activeKeys.values()) {
            if (key.status === 'active' && key.createdAt > latestTimestamp) {
                currentKey = key;
                latestTimestamp = key.createdAt;
            }
        }

        if (!currentKey || this.isKeyExpired(currentKey)) {
            currentKey = await this.generateNewKey();
            this.activeKeys.set(currentKey.id, currentKey);
        }

        return currentKey;
    }

    private async generateNewKey(): Promise<CryptoKey> {
        const keyBytes = new Uint8Array(32); // 256 bits
        crypto.getRandomValues(keyBytes);

        const key: CryptoKey = {
            id: this.generateKeyId(),
            key: Buffer.from(keyBytes).toString('base64'),
            version: this.getCurrentKeyVersion() + 1,
            algorithm: 'AES-256-GCM',
            createdAt: Date.now(),
            expiresAt: Date.now() + this.rotationPolicy.keyValidityPeriod,
            status: 'active',
            metadata: {
                purpose: ['encryption', 'decryption'],
                origin: 'system-generated',
                rotationCount: 0
            }
        };

        return key;
    }

    private async archiveKey(key: CryptoKey): Promise<void> {
        key.status = 'archived';
        key.metadata.lastRotation = Date.now();
        key.metadata.rotationCount++;

        this.activeKeys.delete(key.id);
        this.archivedKeys.set(key.id, key);

        // Nettoyer les clés archivées expirées
        await this.cleanupArchivedKeys();
    }

    private async validateKeyAccess(context: SecurityContext): Promise<void> {
        // Vérifier les permissions nécessaires
        const hasKeyAccess = context.permissions.includes('key_access');
        if (!hasKeyAccess) {
            throw new Error('Insufficient permissions for key access');
        }

        // Vérifier le niveau de chiffrement requis
        if (context.encryptionLevel !== 'high' && context.encryptionLevel !== 'military') {
            throw new Error('Insufficient encryption level for key access');
        }
    }

    private async cleanupArchivedKeys(): Promise<void> {
        const cutoffTime = Date.now() - this.rotationPolicy.archivalPeriod;

        for (const [id, key] of this.archivedKeys.entries()) {
            if (key.createdAt < cutoffTime) {
                this.archivedKeys.delete(id);
            }
        }
    }

    private isKeyExpired(key: CryptoKey): boolean {
        return Date.now() > key.expiresAt;
    }

    private shouldRotateKey(key: CryptoKey): boolean {
        const now = Date.now();
        const keyAge = now - key.createdAt;

        return keyAge > this.rotationPolicy.minimumKeyAge &&
            (keyAge > this.rotationPolicy.rotationInterval || this.isKeyExpired(key));
    }

    private getCurrentKeyVersion(): number {
        let maxVersion = 0;
        for (const key of this.activeKeys.values()) {
            maxVersion = Math.max(maxVersion, key.version);
        }
        return maxVersion;
    }

    private generateKeyId(): string {
        return `key-${Date.now()}-${crypto.randomUUID()}`;
    }

    private startAutomaticRotation(): void {
        setInterval(async () => {
            try {
                const currentKey = await this.getOrCreateCurrentKey();
                if (this.shouldRotateKey(currentKey)) {
                    await this.rotateKeys();
                }
            } catch (error) {
                console.error('Error during automatic key rotation:', error);
            }
        }, Math.min(
            this.rotationPolicy.rotationInterval,
            this.rotationPolicy.keyValidityPeriod
        ) / 10); // Vérifier 10 fois plus souvent que l'intervalle de rotation
    }

    // Méthodes publiques utilitaires
    public async getKeyInfo(keyId: string): Promise<Omit<CryptoKey, 'key'> | undefined> {
        const key = this.activeKeys.get(keyId) || this.archivedKeys.get(keyId);
        if (!key) return undefined;

        // Utiliser la déstructuration pour omettre la propriété 'key'
        const { key: _keyValue, ...keyInfoWithoutKey } = key;
        return keyInfoWithoutKey;
    }

    public async getActiveKeysInfo(): Promise<Array<Omit<CryptoKey, 'key'>>> {
        return Array.from(this.activeKeys.values()).map(key => {
            // Utiliser la déstructuration pour omettre la propriété 'key'
            const { key: _keyValue, ...keyInfoWithoutKey } = key;
            return keyInfoWithoutKey;
        });
    }

    public async revokeKey(keyId: string): Promise<KeyOperationResult> {
        const key = this.activeKeys.get(keyId);
        if (!key) {
            return {
                success: false,
                error: 'Key not found',
                timestamp: Date.now()
            };
        }

        try {
            key.status = 'revoked';
            await this.archiveKey(key);
            await this.rotateKeys(); // Générer une nouvelle clé si nécessaire

            return {
                success: true,
                keyId,
                timestamp: Date.now()
            };
        } catch (error) {
            return {
                success: false,
                keyId,
                error: error instanceof Error ? error.message : 'Unknown error during key revocation',
                timestamp: Date.now()
            };
        }
    }

    public getRotationPolicy(): KeyRotationPolicy {
        return { ...this.rotationPolicy };
    }

    public updateRotationPolicy(newPolicy: Partial<KeyRotationPolicy>): void {
        this.rotationPolicy = {
            ...this.rotationPolicy,
            ...newPolicy
        };
    }
}