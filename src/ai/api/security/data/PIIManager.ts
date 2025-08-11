// src/ai/api/security/data/PIIManager.ts

// Types de données personnelles identifiables
export enum PIIType {
    EMAIL = 'email',
    PHONE = 'phone',
    NAME = 'name',
    ADDRESS = 'address',
    ID_NUMBER = 'id_number',
    CREDIT_CARD = 'credit_card',
    IP_ADDRESS = 'ip_address',
    HEALTH_INFO = 'health_info',
    BIOMETRIC = 'biometric',
    LOCATION = 'location'
}

// Options de base pour la gestion des PII
export interface PIIBaseOptions {
    anonymizeMode: 'mask' | 'hash' | 'truncate' | 'remove';
    keepLength: boolean;
    sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
    logAccess: boolean;
}

// Options complètes incluant les mappings de champs PII
export interface PIIOptions extends PIIBaseOptions {
    fieldMappings: Record<string, PIIType>;
    customPatterns?: Record<string, RegExp>;
    sensitiveFields?: string[];
    exclusions?: string[];
}

/**
 * Gestionnaire des informations personnelles identifiables (PII)
 * Fournit des méthodes pour détecter et protéger les données sensibles
 */
export class PIIManager {
    private options: PIIOptions;
    private readonly PII_PATTERNS: Record<PIIType, RegExp>;

    /**
     * Construit un nouveau gestionnaire PII
     * @param baseOptions Options de base pour la configuration
     * @param fieldMappings Mappings des champs aux types de PII
     * @param customPatterns Patterns personnalisés pour la détection
     * @param sensitiveFields Champs sensibles additionnels
     */
    constructor(
        baseOptions: PIIBaseOptions = {
            anonymizeMode: 'mask',
            keepLength: true,
            sensitivityLevel: 'medium',
            logAccess: true
        },
        fieldMappings: Record<string, PIIType> = {},
        customPatterns: Record<string, RegExp> = {},
        sensitiveFields: string[] = []
    ) {
        // Définir les patterns d'expressions régulières pour les différents types de PII
        this.PII_PATTERNS = {
            [PIIType.EMAIL]: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
            [PIIType.PHONE]: /(\+\d{1,3}\s?)?(\(\d{1,4}\)\s?)?[\d\s-]{7,}/,
            [PIIType.NAME]: /\b([A-Z][a-z]+\s+){1,2}[A-Z][a-z]+\b/,
            [PIIType.ADDRESS]: /\d+\s+[A-Za-z\s,]+\s+(?:Road|Street|Avenue|Boulevard|Lane|Drive)/i,
            [PIIType.ID_NUMBER]: /\b\d{2,3}[-\s]?\d{2,3}[-\s]?\d{2,3}[-\s]?\d{2,3}\b/,
            [PIIType.CREDIT_CARD]: /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
            [PIIType.IP_ADDRESS]: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
            [PIIType.HEALTH_INFO]: /(?:medical|health|patient)\s+(?:record|information|data|history)/i,
            [PIIType.BIOMETRIC]: /(?:fingerprint|iris|face|voice)\s+(?:scan|recognition|id|data)/i,
            [PIIType.LOCATION]: /\b-?\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+\b/ // Coordonnées géographiques
        };

        // Construire les options complètes
        this.options = {
            ...baseOptions,
            fieldMappings,
            customPatterns,
            sensitiveFields
        };
    }

    /**
     * Vérifie si un nom de champ correspond à une information personnelle
     * @param fieldName Nom du champ à vérifier
     * @returns True si le champ est une information personnelle
     */
    public async isPII(fieldName: string): Promise<boolean> {
        // Vérifier d'abord les mappings explicites
        if (fieldName in this.options.fieldMappings) {
            return true;
        }

        // Vérifier les champs sensibles explicites
        if (this.options.sensitiveFields?.includes(fieldName)) {
            return true;
        }

        // Vérifier si le nom correspond à des patterns de PII communs
        const commonPIIFieldNames = [
            'email', 'mail', 'phone', 'mobile', 'tel', 'telephone',
            'address', 'location', 'name', 'firstname', 'lastname',
            'ssn', 'social', 'security', 'creditcard', 'card', 'password',
            'pin', 'passport', 'license', 'id', 'identifier', 'birthdate',
            'dob', 'birth', 'gender', 'sex', 'age', 'race', 'ethnicity'
        ];

        // Recherche de correspondance avec les noms de champs communs
        for (const piiField of commonPIIFieldNames) {
            if (fieldName.toLowerCase().includes(piiField)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Traite une information personnelle pour la protéger
     * @param data Donnée à traiter
     * @returns Donnée anonymisée ou protégée
     */
    public async processPII(data: string | number): Promise<string> {
        const stringData = String(data);

        switch (this.options.anonymizeMode) {
            case 'mask':
                return this.maskPII(stringData);
            case 'hash':
                return this.hashPII(stringData);
            case 'truncate':
                return this.truncatePII(stringData);
            case 'remove':
                return '[REMOVED]';
            default:
                return this.maskPII(stringData);
        }
    }

    /**
     * Masque une information personnelle avec des astérisques
     * @param data Donnée à masquer
     * @returns Donnée masquée
     */
    private maskPII(data: string): string {
        if (data.length <= 4) {
            return '*'.repeat(data.length);
        }

        const visibleStart = data.substring(0, 2);
        const visibleEnd = data.substring(data.length - 2);
        const maskedLength = this.options.keepLength ? data.length - 4 : 3;
        const maskedPart = '*'.repeat(maskedLength);

        return `${visibleStart}${maskedPart}${visibleEnd}`;
    }

    /**
     * Hache une information personnelle
     * @param data Donnée à hacher
     * @returns Représentation hachée de la donnée
     */
    private hashPII(data: string): string {
        // Simple hashing pour exemple, utiliser crypto en production
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Conversion en 32bit integer
        }
        return `HASH-${Math.abs(hash).toString(16).padStart(8, '0')}`;
    }

    /**
     * Tronque une information personnelle
     * @param data Donnée à tronquer
     * @returns Donnée tronquée
     */
    private truncatePII(data: string): string {
        if (data.length <= 4) {
            return data;
        }
        return data.substring(0, 2) + '...';
    }

    /**
     * Détecte les informations personnelles dans un texte
     * @param text Texte à analyser
     * @returns Types de PII détectés et leurs positions
     */
    public detectPII(text: string): Array<{ type: PIIType; position: number; value: string }> {
        const results: Array<{ type: PIIType; position: number; value: string }> = [];

        // Vérifier chaque type de PII
        for (const [type, pattern] of Object.entries(this.PII_PATTERNS)) {
            const matches = text.matchAll(pattern);
            for (const match of matches) {
                if (match.index !== undefined && match[0]) {
                    results.push({
                        type: type as PIIType,
                        position: match.index,
                        value: match[0]
                    });
                }
            }
        }

        // Vérifier les patterns personnalisés
        if (this.options.customPatterns) {
            for (const [_, pattern] of Object.entries(this.options.customPatterns)) {
                const matches = text.matchAll(pattern);
                for (const match of matches) {
                    if (match.index !== undefined && match[0]) {
                        results.push({
                            type: PIIType.NAME, // Fallback type
                            position: match.index,
                            value: match[0]
                        });
                    }
                }
            }
        }

        return results;
    }

    /**
     * Anonymise toutes les informations personnelles détectées dans un texte
     * @param text Texte à anonymiser
     * @returns Texte avec les PII anonymisées
     */
    public anonymizeText(text: string): string {
        const detectedPII = this.detectPII(text);

        // Trier par position décroissante pour ne pas affecter les index lors des remplacements
        detectedPII.sort((a, b) => b.position - a.position);

        let anonymizedText = text;
        for (const pii of detectedPII) {
            const anonymized = this.processPII(pii.value);
            anonymizedText =
                anonymizedText.substring(0, pii.position) +
                anonymized +
                anonymizedText.substring(pii.position + pii.value.length);
        }

        return anonymizedText;
    }
}