//src/ai/api/core/middleware/middlewares/DataSanitizationMiddleware.ts
import { IAPIContext } from '../../types';
import { IMiddleware, NextFunction } from '../middleware-interfaces';
// Mock Logger
class Logger {
    constructor(private name: string) {}
    debug(msg: string, data?: any) { console.log(`[DEBUG] ${this.name}: ${msg}`, data); }
    error(msg: string, data?: any) { console.error(`[ERROR] ${this.name}: ${msg}`, data); }
    info(msg: string, data?: any) { console.info(`[INFO] ${this.name}: ${msg}`, data); }
    warn(msg: string, data?: any) { console.warn(`[WARN] ${this.name}: ${msg}`, data); }
}
import { IDataSanitizer } from '../interfaces';
import { SecurityServiceProvider } from '../di/SecurityServiceProvider';
import { SecurityServiceKeys } from '../di/types';

export interface DataSanitizationConfig {
    enableHtmlSanitization: boolean;
    enableSqlSanitization: boolean;
    allowedHtmlTags?: string[];
    strictMode: boolean;
}

export class DataSanitizationMiddleware implements IMiddleware {
    public readonly name: string = 'DataSanitizationMiddleware';
    public readonly isEnabled: boolean;

    private readonly logger: Logger;
    private readonly config: DataSanitizationConfig;
    private readonly serviceProvider?: SecurityServiceProvider;

    constructor(
        config: Partial<DataSanitizationConfig> = {}
    ) {
        this.logger = new Logger(this.name);
        this.isEnabled = true;

        // Default configuration
        this.config = {
            enableHtmlSanitization: true,
            enableSqlSanitization: true,
            strictMode: false,
            ...config
        };
    }

    public async process(context: IAPIContext, next: NextFunction): Promise<void> {
        try {
            if (!context.request || !context.request.body) {
                // Nothing to sanitize
                await next();
                return;
            }

            // Sanitize request body
            if (typeof context.request.body === 'object') {
                await this.sanitizeObject(context.request.body);
            } else if (typeof context.request.body === 'string') {
                context.request.body = await this.sanitizeString(context.request.body);
            }

            // Sanitize URL query parameters
            if (context.request.query) {
                await this.sanitizeObject(context.request.query);
            }

            await next();
        } catch (error) {
            this.logger.error('Error in data sanitization middleware', error);
            throw error;
        }
    }

    private async sanitizeObject(obj: Record<string, unknown>): Promise<void> {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];

                if (typeof value === 'string') {
                    obj[key] = await this.sanitizeString(value);
                } else if (typeof value === 'object' && value !== null) {
                    await this.sanitizeObject(value as Record<string, unknown>);
                }
            }
        }
    }

    private async sanitizeString(value: string): Promise<string> {
        let result = value;

        try {
            let dataSanitizer: IDataSanitizer | undefined;

            if (this.serviceProvider) {
                dataSanitizer = await this.serviceProvider.get<IDataSanitizer>(
                    SecurityServiceKeys.DATA_SANITIZER
                );
            }

            if (dataSanitizer) {
                // Use the provided sanitizer service
                result = await dataSanitizer.sanitize(result, {
                    htmlSanitization: this.config.enableHtmlSanitization,
                    sqlSanitization: this.config.enableSqlSanitization,
                    allowedHtmlTags: this.config.allowedHtmlTags,
                    strictMode: this.config.strictMode
                });
            } else {
                // Basic sanitization if no service is available
                if (this.config.enableHtmlSanitization) {
                    result = this.sanitizeHtml(result);
                }

                if (this.config.enableSqlSanitization) {
                    result = this.sanitizeSql(result);
                }
            }

            return result;
        } catch (error) {
            this.logger.error('Error during string sanitization', error);
            return this.config.strictMode ? '' : value;
        }
    }

    private sanitizeHtml(value: string): string {
        // Basic HTML sanitization (a more comprehensive implementation would use a library)
        return value
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    private sanitizeSql(value: string): string {
        // Basic SQL injection protection (a more comprehensive implementation would use a library)
        return value
            .replace(/'/g, "''")
            .replace(/;/g, '');
    }
}