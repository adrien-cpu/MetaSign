/**
 * Service de chiffrement et de déchiffrement sécurisé des données
 */
import { Logger } from '@api/common/monitoring/LogService';
import { EncryptionResult } from '@security/types/SecurityTypes';

export interface EncryptionOptions {
    /**
     * Algorithme de chiffrement à utiliser
     */
    algorithm: 'aes-256-gcm' | 'aes-256-cbc' | 'chacha20-poly1305';

    /**
     * Taille de la clé en bits
     */
    keySize: 128 | 192 | 256;

    /**
     * Taille du vecteur d'initialisation en octets
     */
    ivSize?: number;

    /**
     * Méthode d'encodage de sortie
     */
    outputEncoding?: 'base64' | 'hex';

    /**
     * Données d'authentification supplémentaires pour les modes AEAD
     */
    aad?: Buffer;
}

/**
 * Résultat de l'opération de chiffrement
 */
export interface EncryptionServiceResult {
    /**
     * Données chiffrées encodées selon outputEncoding
     */
    ciphertext: string;

    /**
     * Vecteur d'initialisation encodé selon outputEncoding
     */
    iv: string;

    /**
     * Tag d'authentification pour les modes AEAD (si applicable)
     */
    authTag?: string;
}

/**
 * Options pour les opérations de déchiffrement
 */
export interface DecryptOptions {
    /**
     * Vecteur d'initialisation (IV)
     */
    iv: string;

    /**
     * Tag d'authentification pour les modes AEAD
     */
    authTag?: string;

    /**
     * Données d'authentification supplémentaires
     */
    aad?: Buffer;

    /**
     * Encodage des entrées
     */
    encoding?: 'base64' | 'hex';
}

/**
 * Service de chiffrement pour sécuriser les données sensibles
 */
export class EncryptionService {
    private readonly logger: Logger;
    private readonly options: Required<EncryptionOptions>;

    /**
     * Crée un nouveau service de chiffrement
     * @param options Options de configuration
     */
    constructor(options: EncryptionOptions) {
        this.logger = new Logger('EncryptionService');

        // Valeurs par défaut pour les options manquantes
        const defaultOptions: Required<EncryptionOptions> = {
            algorithm: 'aes-256-gcm',
            keySize: 256,
            ivSize: 16, // 16 octets (128 bits)
            outputEncoding: 'base64',
            aad: Buffer.from('')
        };

        this.options = { ...defaultOptions, ...options };

        // Valider les options
        this.validateOptions();

        this.logger.info('EncryptionService initialized', { algorithm: this.options.algorithm });
    }

    /**
     * Chiffre des données et renvoie le résultat encodé
     * @param data Données à chiffrer (chaîne)
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Données chiffrées avec métadonnées
     */
    public async encrypt(data: string, keyIdentifier?: string): Promise<string> {
        try {
            // Valider les entrées
            if (!data) {
                throw new Error('No data provided for encryption');
            }

            // Utiliser l'API de crypto du navigateur
            const key = await this.getKeyForEncryption(keyIdentifier);
            const iv = crypto.getRandomValues(new Uint8Array(this.options.ivSize));

            // Encoder les données
            const encodedData = new TextEncoder().encode(data);

            // Configurer l'algorithme selon les options
            let algorithm: AesGcmParams | AesCbcParams;

            if (this.options.algorithm === 'aes-256-gcm') {
                algorithm = {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: this.options.aad
                };
            } else {
                algorithm = {
                    name: 'AES-CBC',
                    iv: iv
                };
            }

            // Chiffrer les données
            const encryptedBuffer = await crypto.subtle.encrypt(
                algorithm,
                key,
                encodedData
            );

            // Concaténer l'IV et les données chiffrées dans un format facile à stocker
            const encryptedArray = new Uint8Array(encryptedBuffer);
            const result = new Uint8Array(iv.length + encryptedArray.length);
            result.set(iv);
            result.set(encryptedArray, iv.length);

            // Encoder en base64 ou hex selon les options
            const encoded = this.encodeBuffer(result, this.options.outputEncoding);

            this.logger.debug('Data encrypted successfully', {
                keyIdentifier,
                algorithm: this.options.algorithm,
                outputLength: encoded.length
            });

            return encoded;
        } catch (error) {
            this.logger.error('Encryption failed', error);
            throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Déchiffre des données chiffrées
     * @param encryptedData Données chiffrées encodées
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Données déchiffrées
     */
    public async decrypt(encryptedData: string, keyIdentifier?: string): Promise<string> {
        try {
            // Valider les entrées
            if (!encryptedData) {
                throw new Error('No encrypted data provided for decryption');
            }

            // Décoder les données
            const decodedData = this.decodeToBuffer(encryptedData, this.options.outputEncoding);

            // Extraire l'IV et les données chiffrées
            const iv = decodedData.slice(0, this.options.ivSize);
            const ciphertext = decodedData.slice(this.options.ivSize);

            // Utiliser l'API de crypto du navigateur
            const key = await this.getKeyForDecryption(keyIdentifier);

            // Configurer l'algorithme selon les options
            let algorithm: AesGcmParams | AesCbcParams;

            if (this.options.algorithm === 'aes-256-gcm') {
                algorithm = {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: this.options.aad
                };
            } else {
                algorithm = {
                    name: 'AES-CBC',
                    iv: iv
                };
            }

            // Déchiffrer les données
            const decryptedBuffer = await crypto.subtle.decrypt(
                algorithm,
                key,
                ciphertext
            );

            // Décoder le résultat en texte
            const decryptedText = new TextDecoder().decode(decryptedBuffer);

            this.logger.debug('Data decrypted successfully', {
                keyIdentifier,
                algorithm: this.options.algorithm,
                outputLength: decryptedText.length
            });

            return decryptedText;
        } catch (error) {
            this.logger.error('Decryption failed', error);
            throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Chiffre des données binaires
     * @param data Données binaires à chiffrer
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Données chiffrées avec métadonnées
     */
    public async encryptBinary(data: ArrayBuffer, keyIdentifier?: string): Promise<EncryptionResult> {
        try {
            // Valider les entrées
            if (!data) {
                throw new Error('No data provided for encryption');
            }

            // Utiliser l'API de crypto du navigateur
            const key = await this.getKeyForEncryption(keyIdentifier);
            const iv = crypto.getRandomValues(new Uint8Array(this.options.ivSize));

            // Configurer l'algorithme selon les options
            let algorithm: AesGcmParams | AesCbcParams;

            if (this.options.algorithm === 'aes-256-gcm') {
                algorithm = {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: this.options.aad
                };
            } else {
                algorithm = {
                    name: 'AES-CBC',
                    iv: iv
                };
            }

            // Chiffrer les données
            const encryptedBuffer = await crypto.subtle.encrypt(
                algorithm,
                key,
                data
            );

            this.logger.debug('Binary data encrypted successfully', {
                keyIdentifier,
                algorithm: this.options.algorithm,
                inputSize: data.byteLength,
                outputSize: encryptedBuffer.byteLength
            });

            return {
                data: encryptedBuffer,
                iv: iv
            };
        } catch (error) {
            this.logger.error('Binary encryption failed', error);
            throw new Error(`Binary encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Déchiffre des données binaires
     * @param encryptedData Données binaires chiffrées
     * @param iv Vecteur d'initialisation
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Données déchiffrées
     */
    public async decryptBinary(encryptedData: ArrayBuffer, iv: Uint8Array, keyIdentifier?: string): Promise<ArrayBuffer> {
        try {
            // Valider les entrées
            if (!encryptedData) {
                throw new Error('No encrypted data provided for decryption');
            }

            if (!iv || iv.length !== this.options.ivSize) {
                throw new Error(`Invalid IV provided. Expected ${this.options.ivSize} bytes.`);
            }

            // Utiliser l'API de crypto du navigateur
            const key = await this.getKeyForDecryption(keyIdentifier);

            // Configurer l'algorithme selon les options
            let algorithm: AesGcmParams | AesCbcParams;

            if (this.options.algorithm === 'aes-256-gcm') {
                algorithm = {
                    name: 'AES-GCM',
                    iv: iv,
                    additionalData: this.options.aad
                };
            } else {
                algorithm = {
                    name: 'AES-CBC',
                    iv: iv
                };
            }

            // Déchiffrer les données
            const decryptedBuffer = await crypto.subtle.decrypt(
                algorithm,
                key,
                encryptedData
            );

            this.logger.debug('Binary data decrypted successfully', {
                keyIdentifier,
                algorithm: this.options.algorithm,
                inputSize: encryptedData.byteLength,
                outputSize: decryptedBuffer.byteLength
            });

            return decryptedBuffer;
        } catch (error) {
            this.logger.error('Binary decryption failed', error);
            throw new Error(`Binary decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Génère une nouvelle clé de chiffrement
     * @returns Clé de chiffrement formatée en Base64
     */
    public async generateKey(): Promise<string> {
        try {
            // Déterminer l'algorithme
            let algorithm: AesKeyGenParams;

            if (this.options.algorithm.startsWith('aes-')) {
                algorithm = {
                    name: this.options.algorithm.includes('gcm') ? 'AES-GCM' : 'AES-CBC',
                    length: this.options.keySize
                };
            } else {
                throw new Error(`Unsupported algorithm: ${this.options.algorithm}`);
            }

            // Générer la clé
            const key = await crypto.subtle.generateKey(
                algorithm,
                true,
                ['encrypt', 'decrypt']
            );

            // Exporter la clé
            const exportedKey = await crypto.subtle.exportKey('raw', key);

            // Encoder la clé
            const encodedKey = this.encodeBuffer(new Uint8Array(exportedKey), 'base64');

            this.logger.info('New encryption key generated', { algorithm: this.options.algorithm });

            return encodedKey;
        } catch (error) {
            this.logger.error('Key generation failed', error);
            throw new Error(`Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Valide les options de configuration
     */
    private validateOptions(): void {
        // Vérifier l'algorithme
        if (!['aes-256-gcm', 'aes-256-cbc', 'chacha20-poly1305'].includes(this.options.algorithm)) {
            throw new Error(`Unsupported algorithm: ${this.options.algorithm}`);
        }

        // Vérifier la taille de la clé
        if (![128, 192, 256].includes(this.options.keySize)) {
            throw new Error(`Invalid key size: ${this.options.keySize}. Must be 128, 192, or 256.`);
        }

        // Vérifier la taille de l'IV
        if (this.options.ivSize < 12 || this.options.ivSize > 16) {
            throw new Error(`Invalid IV size: ${this.options.ivSize}. Must be between 12 and 16.`);
        }

        // Vérifier l'encodage de sortie
        if (!['base64', 'hex'].includes(this.options.outputEncoding)) {
            throw new Error(`Invalid output encoding: ${this.options.outputEncoding}. Must be 'base64' or 'hex'.`);
        }
    }

    /**
     * Obtient la clé pour le chiffrement
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Clé CryptoKey
     */
    private async getKeyForEncryption(keyIdentifier?: string): Promise<CryptoKey> {
        // Pour simplifier, utiliser une clé par défaut si aucun identifiant n'est fourni
        // Dans une implémentation réelle, utiliser un gestionnaire de clés
        const key = keyIdentifier || 'default-encryption-key';

        // Générer une clé dérivée d'un mot de passe
        const keyMaterial = await this.getKeyMaterial(key);

        // Dériver une clé AES à partir du matériel de clé
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new TextEncoder().encode('encrypted-api-salt'),
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            {
                name: this.options.algorithm.includes('gcm') ? 'AES-GCM' : 'AES-CBC',
                length: this.options.keySize
            },
            false,
            ['encrypt']
        );
    }

    /**
     * Obtient la clé pour le déchiffrement
     * @param keyIdentifier Identifiant de la clé à utiliser
     * @returns Clé CryptoKey
     */
    private async getKeyForDecryption(keyIdentifier?: string): Promise<CryptoKey> {
        // Dans une implémentation réelle, les clés de chiffrement et déchiffrement seraient différentes
        // Mais pour simplifier, réutiliser la même méthode
        return this.getKeyForEncryption(keyIdentifier);
    }

    /**
     * Obtient le matériel de clé à partir d'un mot de passe
     * @param password Mot de passe ou clé
     * @returns Matériel de clé
     */
    private async getKeyMaterial(password: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const encodedPassword = encoder.encode(password);

        return crypto.subtle.importKey(
            'raw',
            encodedPassword,
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );
    }

    /**
     * Encode un tableau d'octets en chaîne base64 ou hex
     * @param buffer Tableau d'octets à encoder
     * @param encoding Type d'encodage ('base64' ou 'hex')
     * @returns Chaîne encodée
     */
    private encodeBuffer(buffer: Uint8Array, encoding: 'base64' | 'hex'): string {
        if (encoding === 'base64') {
            // Utiliser l'API de conversion en base64
            return btoa(String.fromCharCode(...buffer));
        } else {
            // Convertir en hexadécimal
            return Array.from(buffer)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        }
    }

    /**
     * Décode une chaîne base64 ou hex en tableau d'octets
     * @param data Chaîne à décoder
     * @param encoding Type d'encodage ('base64' ou 'hex')
     * @returns Tableau d'octets
     */
    private decodeToBuffer(data: string, encoding: 'base64' | 'hex'): Uint8Array {
        if (encoding === 'base64') {
            // Décoder de base64
            const binaryString = atob(data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } else {
            // Décoder de l'hexadécimal
            const bytes = new Uint8Array(data.length / 2);
            for (let i = 0; i < data.length; i += 2) {
                bytes[i / 2] = parseInt(data.substring(i, i + 2), 16);
            }
            return bytes;
        }
    }
}