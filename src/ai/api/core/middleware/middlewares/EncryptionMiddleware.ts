//src/ai/api/core/middleware/middlewares/EncryptionMiddleware.ts
import { IAPIContext } from '@api/core/types';
import { IMiddleware, NextFunction } from '@api/core/middleware/middleware-interfaces';
import { Logger } from '@api/common/monitoring/LogService';
import { IEncryptionService } from '@api/core/middleware/interfaces';
import { SecurityServiceProvider } from '@api/core/middleware/di/SecurityServiceProvider';
import { SecurityServiceKeys } from '@api/core/middleware/di/types';

export interface EncryptionConfig {
    algorithm: string;
    keySize: number;
    encryptRequestBody: boolean;
    encryptResponseBody: boolean;
    encryptHeaders: string[];
}

export class EncryptionMiddleware implements IMiddleware {
    public readonly name: string = 'EncryptionMiddleware';
    public readonly isEnabled: boolean;

    private readonly logger: Logger;
    private readonly config: EncryptionConfig;
    private readonly serviceProvider: SecurityServiceProvider;

    constructor(
        serviceProvider: SecurityServiceProvider,
        config: Partial<EncryptionConfig> = {}
    ) {
        this.logger = new Logger(this.name);
        this.serviceProvider = serviceProvider;
        this.isEnabled = true;

        // Default configuration
        this.config = {
            algorithm: 'aes-256-gcm',
            keySize: 256,
            encryptRequestBody: false,
            encryptResponseBody: true,
            encryptHeaders: [],
            ...config
        };
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            // Decrypt request if needed
            if (this.shouldDecryptRequest(context)) {
                await this.decryptRequest(context);
            }

            // Process the request
            await next();

            // Encrypt response if needed
            if (context.response && this.config.encryptResponseBody) {
                await this.encryptResponse(context);
            }
        } catch (error) {
            this.logger.error('Error in encryption middleware', error);
            throw error;
        }
    }

    private shouldDecryptRequest(context: IAPIContext): boolean {
        // Check if the request contains encrypted content with null safety
        const headers = context.request.headers || {};
        return headers['x-encrypted-content'] === 'true';
    }

    private async decryptRequest(context: IAPIContext): Promise<void> {
        try {
            const encryptionService = await this.serviceProvider.get<IEncryptionService>(
                SecurityServiceKeys.ENCRYPTION_SERVICE
            );

            if (!encryptionService) {
                this.logger.error('Encryption service not available for decryption');
                return;
            }

            const headers = context.request.headers || {};

            if (context.request.body && typeof context.request.body === 'string') {
                // Get the encryption key from a secure location or header
                const key = headers['x-encryption-key'] as string;

                // Decrypt the body
                const decryptedBody = await encryptionService.decrypt(context.request.body, key);

                // Parse the decrypted body if it's JSON
                // Parse the decrypted body if it's JSON
                try {
                    context.request.body = JSON.parse(decryptedBody);
                } catch {
                    // Si le parsing échoue, utiliser le texte brut
                    context.request.body = decryptedBody;
                }

                // Remove encryption headers
                if (context.request.headers) {
                    delete context.request.headers['x-encrypted-content'];
                    delete context.request.headers['x-encryption-key'];
                }
            }

            // Decrypt headers if needed
            for (const header of this.config.encryptHeaders) {
                const encryptedHeader = `x-encrypted-${header}`;
                if (headers[encryptedHeader]) {
                    const encryptedValue = headers[encryptedHeader] as string;
                    const key = headers['x-encryption-key'] as string;
                    const decryptedValue = await encryptionService.decrypt(encryptedValue, key);

                    if (context.request.headers) {
                        context.request.headers[header] = decryptedValue;
                        delete context.request.headers[encryptedHeader];
                    }
                }
            }
        } catch (error) {
            this.logger.error('Error decrypting request', error);
            throw new Error('Failed to decrypt request data');
        }
    }

    private async encryptResponse(context: IAPIContext): Promise<void> {
        if (!context.response) return; // Retour immédiat si aucune réponse

        try {
            const encryptionService = await this.serviceProvider.get<IEncryptionService>(
                SecurityServiceKeys.ENCRYPTION_SERVICE
            );

            if (!encryptionService) {
                this.logger.error('Encryption service not available for encryption');
                return;
            }

            // Generate a new encryption key
            const key = await encryptionService.generateKey();

            // Encrypt the response body
            if (context.response.body) {
                let bodyToEncrypt: string;

                if (typeof context.response.body === 'string') {
                    bodyToEncrypt = context.response.body;
                } else {
                    bodyToEncrypt = JSON.stringify(context.response.body);
                }

                context.response.body = await encryptionService.encrypt(bodyToEncrypt, key);

                // Add encryption headers
                if (!context.response.headers) {
                    context.response.headers = {};
                }

                context.response.headers['x-encrypted-content'] = 'true';
                context.response.headers['x-encryption-key'] = key;
                context.response.headers['x-encryption-algorithm'] = this.config.algorithm;
            }
        } catch (error) {
            this.logger.error('Error encrypting response', error);
            // Don't throw here, just log the error and continue with unencrypted response
        }
    }
}