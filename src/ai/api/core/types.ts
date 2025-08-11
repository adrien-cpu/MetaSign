// src/ai/api/core/types.ts
/**
 * Énumération des types de requêtes API
 */
export enum RequestType {
    LSF = 'LSF',
    ETHICS = 'ETHICS',
    EMOTION = 'EMOTION',
    CULTURAL = 'CULTURAL'
}

/**
 * Type pour les valeurs de métadonnées
 */
export type MetadataValue = string | number | boolean | object | null | undefined;

/**
 * Type générique pour les données de requête
 */
export type RequestBody = Record<string, unknown> | string | number | boolean | null;

/**
 * Type générique pour les données de réponse
 */
export type ResponseBody = Record<string, unknown> | string | number | boolean | null | unknown[];

/**
 * Type pour les types de gestionnaires API (basé sur RequestType)
 */
export type APIHandlerType = keyof typeof RequestType | RequestType;

/**
 * Interface pour les requêtes API
 */
export interface APIRequest<T extends RequestBody = RequestBody> {
    /** Identifiant de la requête */
    id?: string;
    /** Méthode HTTP de la requête */
    method?: string;
    /** Chemin de la requête */
    path?: string;
    /** Type de requête */
    type?: APIHandlerType | RequestType;
    /** Paramètres de route */
    params?: Record<string, string>;
    /** Paramètres de requête */
    query?: Record<string, string>;
    /** En-têtes HTTP */
    headers?: Record<string, string>;
    /** Adresse IP du client */
    ip?: string;
    /** Indique si le cache doit être ignoré pour cette requête */
    noCache?: boolean;
    /** Corps de la requête */
    body?: T;
    /** Données de la requête (alias de body pour compatibilité) */
    data?: unknown;
    /** Identifiant de l'utilisateur (optionnel) */
    userId?: string;
    /** Métadonnées optionnelles */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour la réponse API standardisée
 */
export interface APIResponse<T extends ResponseBody = ResponseBody> {
    /** Identifiant de la réponse (typiquement correspond à l'ID de la requête) */
    id?: string;
    /** Code de statut HTTP ou statut de succès/erreur */
    status: number | 'success' | 'error';
    /** Code de statut HTTP (alias pour compatibilité) */
    statusCode?: number;
    /** En-têtes de réponse */
    headers: Record<string, string>;
    /** Corps de la réponse */
    body: T;
    /** Données de la réponse (alias de body pour compatibilité) */
    data?: unknown;
    /** Horodatage de la réponse */
    timestamp?: number;
    /** Durée de traitement de la requête */
    duration?: number;
    /** Informations d'erreur (si status est 'error') */
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
    /** Métadonnées supplémentaires */
    metadata?: Record<string, unknown>;
}

/**
 * Interface pour le contexte de sécurité
 */
export interface SecurityContext {
    /** Informations sur le token validé */
    tokenInfo?: TokenValidationResult;
    /** Résultats de la détection d'intrusion */
    intrusionDetection?: IntrusionDetectionResult;
    /** Résultats de l'analyse comportementale */
    behaviorAnalysis?: BehaviorAnalysisResult;
    /** Résultats de validation de conformité */
    compliance?: ComplianceValidationResult;
    /** Indique si le chiffrement est requis */
    requireEncryption?: boolean;
}

/**
 * Interface pour le contexte API
 */
export interface IAPIContext<REQ extends RequestBody = RequestBody, RES extends ResponseBody = ResponseBody> {
    /** Identifiant unique de la requête */
    requestId: string;
    /** Horodatage de début de la requête */
    startTime: number;
    /** Requête entrante */
    request: APIRequest<REQ>;
    /** Réponse sortante */
    response: APIResponse<RES> | null;
    /** Contexte de sécurité */
    security?: SecurityContext;
    /** Erreurs survenues pendant le traitement */
    errors: Error[];
    /** Métadonnées supplémentaires */
    metadata: Map<string, MetadataValue>;
    /** Indique si la réponse provient du cache */
    fromCache?: boolean;
    /** Durée de vie en cache (ms) */
    cacheTTL?: number;
    /** Priorité de mise en cache */
    cachePriority?: 'high' | 'medium' | 'low';
    /** Tags de mise en cache */
    cacheTags?: string[];
    /** Indique si la réponse ne doit pas être mise en cache */
    doNotCache?: boolean;

    /** Retourne la durée d'exécution de la requête */
    readonly duration: number;
    /** Temps de réponse calculé à partir du début de la requête */
    readonly responseTime: number;
    /** Ajoute une erreur au contexte */
    addError(error: Error): void;
    /** Définit une valeur de métadonnée */
    setMetadata(key: string, value: MetadataValue): void;
    /** Récupère une valeur de métadonnée */
    getMetadata(key: string): MetadataValue | undefined;
    /** Convertit le contexte en objet JSON */
    toJSON(): Record<string, unknown>;
    /** Définit la réponse pour ce contexte */
    setResponse(response: APIResponse<RES>): void;
    /** Crée une réponse de succès */
    createSuccessResponse(body: RES, statusCode?: number): APIResponse<RES>;
    /** Crée une réponse d'erreur */
    createErrorResponse(statusCode: number, message: string, code?: string, details?: Record<string, unknown>): APIResponse<RES>;
}

/**
 * Type pour la fonction middleware suivante
 */
export type NextFunction = () => Promise<void>;

/**
 * Interface pour les middlewares API
 */
export interface IMiddleware {
    /**
     * Traite une requête API
     * @param context Contexte de la requête
     * @param next Fonction middleware suivante
     */
    process(context: IAPIContext, next: NextFunction): Promise<void>;
}

/**
 * Interface pour la gestion des erreurs API
 */
export interface APIError {
    /** Code d'erreur unique */
    code: string;
    /** Message d'erreur lisible */
    message: string;
    /** Détails supplémentaires sur l'erreur */
    details?: Record<string, unknown>;
    /** Niveau de gravité de l'erreur */
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Types de sécurité
 */
export interface TokenValidationResult {
    valid: boolean;
    userId: string;
    roles: string[];
    permissions: string[];
    issuedAt: Date;
    expiresAt: Date;
    encryptionKey: string;
    clearanceLevel: string;
}

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AnomalyType = 'UNUSUAL_PATTERN' | 'FREQUENCY_ANOMALY' | 'TIMING_ANOMALY' | 'CONTENT_ANOMALY';

export interface IntrusionDetectionResult {
    threatDetected: boolean;
    threatLevel: ThreatLevel;
    details: string;
    confidence: number;
    signatures: string[];
    mitigationSuggested: boolean;
}

export interface BehaviorAnalysisResult {
    anomalyDetected: boolean;
    anomalyType?: AnomalyType;
    anomalyConfidence: number;
    details: string;
    riskScore: number;
    baseline: Record<string, unknown>;
}

export interface ComplianceValidationResult {
    compliant: boolean;
    issues: string[];
    regulations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Interface pour les gestionnaires API
 */
export interface APIHandler {
    /**
     * Traite une requête et retourne une réponse
     * @param request La requête à traiter
     * @returns Promise résolvant vers une réponse
     */
    processRequest(request: unknown): Promise<unknown>;

    /**
     * Obtenir le type de gestionnaire
     * @returns Le type de gestionnaire
     */
    getType(): APIHandlerType;
}