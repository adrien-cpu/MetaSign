// src/ai/api/security/core/EncryptionManager.ts
import { Logger } from '@/ai/utils/Logger';
import { EncryptionResult } from '@ai/api/security/types/SecurityTypes';

/**
 * Gestionnaire de chiffrement pour les données sensibles
 * Compatible avec SystemeSecuriteRenforcee du diagramme d'état
 */
export class EncryptionManager {
    private static instance: EncryptionManager;
    private logger: Logger;

    /**
     * Constructeur
     */
    constructor() {
        this.logger = new Logger('EncryptionManager');
        this.logger.info('EncryptionManager initialized');
    }

    /**
     * Obtient l'instance unique du gestionnaire de chiffrement
     */
    public static getInstance(): EncryptionManager {
        if (!EncryptionManager.instance) {
            EncryptionManager.instance = new EncryptionManager();
        }
        return EncryptionManager.instance;
    }

    /**
     * Chiffre des données avec une clé spécifiée
     * @param data Données à chiffrer
     * @param key Clé de chiffrement
     * @returns Résultat du chiffrement
     */
    public async encrypt(data: ArrayBuffer, key: string): Promise<EncryptionResult> {
        try {
            // Générer un vecteur d'initialisation aléatoire
            const iv = crypto.getRandomValues(new Uint8Array(12));

            // Dériver une clé à partir de la clé fournie
            const cryptoKey = await this.deriveKey(key);

            // Chiffrer les données
            const encryptedBuffer = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv
                },
                cryptoKey,
                data
            );

            this.logger.debug('Data encrypted successfully');

            return {
                data: encryptedBuffer,
                iv
            };
        } catch (error) {
            this.logger.error('Encryption failed', error instanceof Error ? error.message : String(error));
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Déchiffre des données avec une clé spécifiée
     * @param encryptedData Données chiffrées
     * @param key Clé de chiffrement
     * @param iv Vecteur d'initialisation (optionnel, peut être intégré aux données)
     * @returns Données déchiffrées
     */
    public async decrypt(encryptedData: ArrayBuffer | Buffer, key: string, iv?: Uint8Array): Promise<ArrayBuffer> {
        try {
            // Convertir en Uint8Array d'abord pour garantir la compatibilité
            const dataAsUint8Array = this.toUint8Array(encryptedData);

            // Si iv n'est pas fourni, on suppose que les 12 premiers octets des données sont l'iv
            let actualIv: Uint8Array;
            let actualData: Uint8Array;

            if (!iv) {
                // Extraire l'IV des données
                actualIv = dataAsUint8Array.slice(0, 12);
                actualData = dataAsUint8Array.slice(12);
            } else {
                actualIv = iv;
                actualData = dataAsUint8Array;
            }

            // Dériver une clé à partir de la clé fournie
            const cryptoKey = await this.deriveKey(key);

            // Déchiffrer les données - utiliser explicitement ArrayBuffer
            const decryptedBuffer = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: actualIv
                },
                cryptoKey,
                actualData
            );

            this.logger.debug('Data decrypted successfully');

            return decryptedBuffer;
        } catch (error) {
            this.logger.error('Decryption failed', error instanceof Error ? error.message : String(error));
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Convertit diverses formes de données en Uint8Array
     * @param data Données à convertir
     * @returns Données sous forme de Uint8Array
     * @private
     */
    private toUint8Array(data: ArrayBuffer | Buffer): Uint8Array {
        if (data instanceof Buffer) {
            return new Uint8Array(data);
        } else if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        } else if (ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        // Fallback pour d'autres ArrayBufferLike
        return new Uint8Array(data);
    }

    /**
     * Dérive une clé cryptographique à partir d'une chaîne
     * @param key Clé sous forme de chaîne
     * @returns Clé cryptographique
     * @private
     */
    private async deriveKey(key: string): Promise<CryptoKey> {
        // Convertir la clé en buffer
        const encoder = new TextEncoder();
        const keyBuffer = encoder.encode(key);

        // Importer la clé brute
        const importedKey = await crypto.subtle.importKey(
            'raw',
            keyBuffer,
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Dériver une clé AES-GCM
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: encoder.encode('security-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            importedKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Génère un hachage SHA-256 d'une chaîne
     * @param data Données à hacher
     * @returns Hachage hexadécimal
     */
    public async hash(data: string): Promise<string> {
        try {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(data);

            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

            // Convertir le buffer en chaîne hexadécimale
            return Array.from(new Uint8Array(hashBuffer))
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch (error) {
            this.logger.error('Hashing failed', error instanceof Error ? error.message : String(error));
            throw new Error(`Hashing failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Compare un texte en clair avec un hachage de manière sécurisée
     * @param plaintext Texte en clair
     * @param hash Hachage à comparer
     * @returns true si le texte correspond au hachage
     */
    public async compareHash(plaintext: string, hash: string): Promise<boolean> {
        try {
            const computedHash = await this.hash(plaintext);

            // Comparaison à temps constant pour éviter les attaques temporelles
            let result = 0;
            for (let i = 0; i < hash.length; i++) {
                result |= hash.charCodeAt(i) ^ computedHash.charCodeAt(i);
            }

            return result === 0;
        } catch (error) {
            this.logger.error('Hash comparison failed', error instanceof Error ? error.message : String(error));
            return false;
        }
    }
}