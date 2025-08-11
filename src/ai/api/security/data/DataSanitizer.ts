/**
 * Service de nettoyage et de validation des données pour éviter les injections
 * et les problèmes de sécurité liés aux données d'entrée.
 */
import { Logger } from '@api/common/monitoring/LogService';

// Types internes
export type SensitivitySeverity = 'low' | 'medium' | 'high';

export interface SanitizationOptions {
    sanitizeHtml: boolean;
    preventSqlInjection: boolean;
    preventScriptInjection: boolean;
    preventCommandInjection: boolean;
    maxDepth: number;
    maxLength: number;
}

export interface SensitiveDataType {
    type: string;
    severity: SensitivitySeverity;
    field?: string;
    pattern?: string;
}

export interface SensitiveDataCheckResult {
    containsSensitiveData: boolean;
    dataTypes: SensitiveDataType[];
    redactionSuggested?: boolean;
}

export type ClearanceLevel = 'public' | 'internal' | 'confidential' | 'restricted' | 'secret';

export class DataSanitizer {
    private readonly logger: Logger;
    private sensitivePatterns: Map<string, RegExp>;

    constructor() {
        this.logger = new Logger('DataSanitizer');
        this.sensitivePatterns = new Map<string, RegExp>();
        this.initializeSensitivePatterns();
    }

    /**
     * Nettoie les données d'entrée pour éviter les injections et autres problèmes de sécurité
     * @param data Données à nettoyer
     * @param options Options de nettoyage
     * @returns Données nettoyées
     */
    public async sanitize<T>(data: T, options: SanitizationOptions): Promise<T> {
        try {
            // Vérifier la profondeur maximale
            this.checkDepth(data, options.maxDepth);

            // Convertir en chaîne pour vérifier la taille
            const jsonString = JSON.stringify(data);
            if (jsonString.length > options.maxLength) {
                throw new Error(`Data exceeds maximum length (${jsonString.length} > ${options.maxLength})`);
            }

            // Nettoyer selon le type de données
            const result = this.sanitizeData(data, options) as T;

            // Journaliser l'opération
            this.logger.debug('Data sanitized successfully', { dataType: typeof data });

            return result;
        } catch (error) {
            this.logger.error('Data sanitization failed', error);
            throw new Error(`Sanitization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Vérifie si les données contiennent des informations sensibles
     * @param data Données à vérifier
     * @param clearanceLevel Niveau d'habilitation de l'utilisateur
     * @returns Résultat de la vérification
     */
    public async checkForSensitiveData(data: unknown, clearanceLevel: ClearanceLevel): Promise<SensitiveDataCheckResult> {
        try {
            const result: SensitiveDataCheckResult = {
                containsSensitiveData: false,
                dataTypes: [],
                redactionSuggested: false
            };

            // Convertir en chaîne pour analyse
            const jsonString = JSON.stringify(data);

            // Vérifier chaque pattern sensible
            for (const [type, pattern] of this.sensitivePatterns.entries()) {
                if (pattern.test(jsonString)) {
                    const dataType = this.getSensitiveDataType(type);
                    result.dataTypes.push(dataType);
                    result.containsSensitiveData = true;

                    // Suggérer une rédaction si le niveau d'habilitation n'est pas suffisant
                    if (this.shouldRedact(dataType, clearanceLevel)) {
                        result.redactionSuggested = true;
                    }
                }
            }

            // Journaliser le résultat
            if (result.containsSensitiveData) {
                this.logger.warn('Sensitive data detected', {
                    types: result.dataTypes.map(t => t.type),
                    redactionSuggested: result.redactionSuggested
                });
            }

            return result;
        } catch (error) {
            this.logger.error('Error checking for sensitive data', error);
            throw new Error(`Sensitive data check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Redige les données sensibles en fonction du niveau d'habilitation
     * @param data Données à rédiger
     * @param clearanceLevel Niveau d'habilitation de l'utilisateur
     * @returns Données rédigées
     */
    public async redactSensitiveData<T>(data: T, clearanceLevel: ClearanceLevel): Promise<T> {
        try {
            // Convertir en chaîne pour le traitement
            let jsonString = JSON.stringify(data);

            // Vérifier chaque pattern sensible
            for (const [type, pattern] of this.sensitivePatterns.entries()) {
                const dataType = this.getSensitiveDataType(type);

                // Rédiger uniquement si le niveau d'habilitation n'est pas suffisant
                if (this.shouldRedact(dataType, clearanceLevel)) {
                    jsonString = jsonString.replace(pattern, (match) => {
                        // Garder le début et la fin, remplacer le milieu par des astérisques
                        if (match.length <= 4) {
                            return '****';
                        }
                        const start = match.slice(0, 2);
                        const end = match.slice(-2);
                        const middle = '*'.repeat(match.length - 4);
                        return `${start}${middle}${end}`;
                    });
                }
            }

            // Restaurer l'objet
            const result = JSON.parse(jsonString) as T;

            // Journaliser l'opération
            this.logger.debug('Sensitive data redacted', { clearanceLevel });

            return result;
        } catch (error) {
            this.logger.error('Error redacting sensitive data', error);
            throw new Error(`Redaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Valide les données selon des contraintes spécifiques
     * @param data Données à valider
     * @param schema Schéma de validation
     * @returns true si les données sont valides
     */
    public async validate<T>(data: T, schema: Record<string, unknown>): Promise<boolean> {
        try {
            // Implémentation simplifiée
            // Dans une implémentation réelle, utiliser une bibliothèque comme Joi, Yup, Zod, etc.

            // Convertir en chaîne pour la validation
            const jsonString = JSON.stringify(data);

            // Vérifier la présence de caractères dangereux
            const hasDangerousChars = /[<>'"&]/.test(jsonString);
            if (hasDangerousChars) {
                this.logger.warn('Data contains potentially dangerous characters');
                return false;
            }

            // Journaliser l'opération
            this.logger.debug('Data validation passed');

            return true;
        } catch (error) {
            this.logger.error('Data validation failed', error);
            return false;
        }
    }

    /**
     * Nettoie les données récursivement selon leur type
     * @param data Données à nettoyer
     * @param options Options de nettoyage
     * @returns Données nettoyées
     */
    private sanitizeData(data: unknown, options: SanitizationOptions): unknown {
        if (data === null || data === undefined) {
            return data;
        }

        // Traiter les différents types de données
        if (typeof data === 'string') {
            return this.sanitizeString(data, options);
        } else if (typeof data === 'object') {
            if (Array.isArray(data)) {
                return data.map(item => this.sanitizeData(item, options));
            } else {
                // Objet standard
                const result: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(data)) {
                    // Nettoyer la clé et la valeur
                    const sanitizedKey = this.sanitizeString(key, options);
                    const sanitizedValue = this.sanitizeData(value, options);
                    result[sanitizedKey] = sanitizedValue;
                }
                return result;
            }
        } else {
            // Nombres, booléens, etc.
            return data;
        }
    }

    /**
     * Nettoie une chaîne de caractères
     * @param str Chaîne à nettoyer
     * @param options Options de nettoyage
     * @returns Chaîne nettoyée
     */
    private sanitizeString(str: string, options: SanitizationOptions): string {
        let result = str;

        // Nettoyer le HTML si demandé
        if (options.sanitizeHtml) {
            result = this.sanitizeHtml(result);
        }

        // Prévenir les injections SQL si demandé
        if (options.preventSqlInjection) {
            result = this.preventSqlInjection(result);
        }

        // Prévenir les injections de script si demandé
        if (options.preventScriptInjection) {
            result = this.preventScriptInjection(result);
        }

        // Prévenir les injections de commande si demandé
        if (options.preventCommandInjection) {
            result = this.preventCommandInjection(result);
        }

        return result;
    }

    /**
     * Nettoie le HTML d'une chaîne
     * @param str Chaîne à nettoyer
     * @returns Chaîne nettoyée
     */
    private sanitizeHtml(str: string): string {
        // Remplacer les caractères spéciaux HTML
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Prévient les injections SQL dans une chaîne
     * @param str Chaîne à nettoyer
     * @returns Chaîne nettoyée
     */
    private preventSqlInjection(str: string): string {
        // Échapper les caractères utilisés dans les injections SQL
        return str
            .replace(/'/g, "''")
            .replace(/\\/g, "\\\\")
            .replace(/;/g, "\\;");
    }

    /**
     * Prévient les injections de script dans une chaîne
     * @param str Chaîne à nettoyer
     * @returns Chaîne nettoyée
     */
    private preventScriptInjection(str: string): string {
        // Remplacer les balises script et autres vecteurs XSS
        return str
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, 'removed:')
            .replace(/on\w+=/gi, 'data-removed=');
    }

    /**
     * Prévient les injections de commande dans une chaîne
     * @param str Chaîne à nettoyer
     * @returns Chaîne nettoyée
     */
    private preventCommandInjection(str: string): string {
        // Échapper les caractères utilisés dans les injections de commande
        return str
            .replace(/&/g, '&amp;')
            .replace(/;/g, '&#59;')
            .replace(/\|/g, '&#124;')
            .replace(/\$/g, '&#36;')
            .replace(/`/g, '&#96;')
            .replace(/\(/g, '&#40;')
            .replace(/\)/g, '&#41;');
    }

    /**
     * Vérifie la profondeur d'un objet
     * @param data Données à vérifier
     * @param maxDepth Profondeur maximale autorisée
     * @param currentDepth Profondeur actuelle
     */
    private checkDepth(data: unknown, maxDepth: number, currentDepth = 0): void {
        if (currentDepth > maxDepth) {
            throw new Error(`Maximum depth exceeded (${currentDepth} > ${maxDepth})`);
        }

        if (typeof data === 'object' && data !== null) {
            for (const value of Object.values(data)) {
                this.checkDepth(value, maxDepth, currentDepth + 1);
            }
        }
    }

    /**
     * Initialise les modèles de détection de données sensibles
     */
    private initializeSensitivePatterns(): void {
        this.sensitivePatterns = new Map<string, RegExp>([
            ['credit_card', /\b(?:\d[ -]*?){13,16}\b/],
            ['ssn', /\b\d{3}[-]?\d{2}[-]?\d{4}\b/],
            ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/],
            ['phone', /\b(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/],
            ['password', /\b(?:password|pwd|pass)\s*[=:]\s*\S+\b/i],
            ['api_key', /\b[A-Za-z0-9]{32,}\b/],
            ['ip_address', /\b(?:\d{1,3}\.){3}\d{1,3}\b/],
            ['address', /\b\d+\s+[A-Za-z0-9\s,.-]+(?:avenue|lane|road|boulevard|drive|street|ave|dr|rd|blvd|ln|st)\.?\b/i],
            ['date_of_birth', /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{2,4})\b/i]
        ]);
    }

    /**
     * Obtient le type de données sensibles à partir du nom
     * @param typeName Nom du type de données sensibles
     * @returns Type de données sensibles
     */
    private getSensitiveDataType(typeName: string): SensitiveDataType {
        const typeMap: Record<string, SensitiveDataType> = {
            'credit_card': { type: 'CREDIT_CARD', severity: 'high' },
            'ssn': { type: 'SSN', severity: 'high' },
            'email': { type: 'EMAIL', severity: 'medium' },
            'phone': { type: 'PHONE', severity: 'medium' },
            'password': { type: 'PASSWORD', severity: 'high' },
            'api_key': { type: 'API_KEY', severity: 'high' },
            'ip_address': { type: 'IP_ADDRESS', severity: 'low' },
            'address': { type: 'ADDRESS', severity: 'medium' },
            'date_of_birth': { type: 'DATE_OF_BIRTH', severity: 'medium' }
        };

        return typeMap[typeName] || { type: typeName, severity: 'medium' };
    }

    /**
     * Détermine si des données sensibles doivent être masquées selon le niveau d'habilitation
     * @param dataType Type de données sensibles
     * @param clearanceLevel Niveau d'habilitation
     * @returns true si les données doivent être masquées
     */
    private shouldRedact(dataType: SensitiveDataType, clearanceLevel: ClearanceLevel): boolean {
        // Mapping des niveaux d'habilitation aux sévérités autorisées
        const clearanceLevels: Record<ClearanceLevel, SensitivitySeverity[]> = {
            'public': ['low'],
            'internal': ['low', 'medium'],
            'confidential': ['low', 'medium'],
            'restricted': ['low', 'medium', 'high'],
            'secret': ['low', 'medium', 'high']
        };

        const allowedSeverities = clearanceLevels[clearanceLevel] || ['low'];

        return !allowedSeverities.includes(dataType.severity);
    }
}