/**
 * @file: src/ai/coordinators/errors/component.errors.ts
 * 
 * Erreurs spécifiques aux composants externes.
 * Fournit des classes d'erreur dédiées pour les composants externes utilisés
 * par l'orchestrateur, facilitant la gestion et le diagnostic des erreurs.
 */

/**
 * Erreur liée à un composant externe
 * Utilisée pour signaler une erreur dans un composant externe
 */
export class ExternalComponentError extends Error {
    /** Composant concerné */
    public readonly component: string;
    /** Opération concernée */
    public readonly operation: string;
    /** Détails de l'erreur */
    public readonly details?: unknown;

    /**
     * Crée une nouvelle erreur de composant externe
     * @param component Nom du composant
     * @param operation Nom de l'opération
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, operation: string, details?: unknown) {
        const message = `Error in external component ${component} during operation ${operation}`;
        super(message);

        this.name = 'ExternalComponentError';
        this.component = component;
        this.operation = operation;
        this.details = details;
    }

    /**
     * Convertit l'erreur en chaîne de caractères
     * @returns Représentation de l'erreur sous forme de chaîne
     */
    public toString(): string {
        let result = `${this.name}: ${this.message}`;

        if (this.details) {
            if (this.details instanceof Error) {
                result += `\nCaused by: ${this.details.message}`;
                if (this.details.stack) {
                    result += `\n${this.details.stack}`;
                }
            } else {
                result += `\nDetails: ${JSON.stringify(this.details)}`;
            }
        }

        return result;
    }

    /**
     * Crée une erreur de composant externe à partir d'une erreur existante
     * @param component Nom du composant
     * @param operation Nom de l'opération
     * @param error Erreur existante
     * @returns Nouvelle erreur de composant externe
     */
    public static fromError(component: string, operation: string, error: unknown): ExternalComponentError {
        return new ExternalComponentError(component, operation, error);
    }
}

/**
 * Erreur d'initialisation de composant
 * Utilisée pour signaler une erreur lors de l'initialisation d'un composant
 */
export class ComponentInitializationError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur d'initialisation de composant
     * @param component Nom du composant
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, details?: unknown) {
        super(component, 'initialization', details);
        this.name = 'ComponentInitializationError';
    }
}

/**
 * Erreur de récupération de composant
 * Utilisée pour signaler une erreur lors de la récupération d'un composant après défaillance
 */
export class ComponentRecoveryError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur de récupération de composant
     * @param component Nom du composant
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, details?: unknown) {
        super(component, 'recovery', details);
        this.name = 'ComponentRecoveryError';
    }
}

/**
 * Erreur d'arrêt de composant
 * Utilisée pour signaler une erreur lors de l'arrêt d'un composant
 */
export class ComponentShutdownError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur d'arrêt de composant
     * @param component Nom du composant
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, details?: unknown) {
        super(component, 'shutdown', details);
        this.name = 'ComponentShutdownError';
    }
}

/**
 * Erreur de communication avec un composant
 * Utilisée pour signaler une erreur de communication avec un composant
 */
export class ComponentCommunicationError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur de communication avec un composant
     * @param component Nom du composant
     * @param operation Nom de l'opération
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, operation: string, details?: unknown) {
        super(component, operation, details);
        this.name = 'ComponentCommunicationError';
    }
}

/**
 * Erreur de comportement de composant
 * Utilisée pour signaler un comportement inattendu d'un composant
 */
export class ComponentBehaviorError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur de comportement de composant
     * @param component Nom du composant
     * @param behavior Description du comportement inattendu
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, behavior: string, details?: unknown) {
        super(component, behavior, details);
        this.name = 'ComponentBehaviorError';
    }
}

/**
 * Erreur de configuration de composant
 * Utilisée pour signaler une erreur de configuration d'un composant
 */
export class ComponentConfigurationError extends ExternalComponentError {
    /**
     * Crée une nouvelle erreur de configuration de composant
     * @param component Nom du composant
     * @param configItem Élément de configuration concerné
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, configItem: string, details?: unknown) {
        super(component, `configuration of ${configItem}`, details);
        this.name = 'ComponentConfigurationError';
    }
}

/**
 * Erreur de dépendance de composant
 * Utilisée pour signaler qu'une dépendance requise par un composant est manquante ou incompatible
 */
export class ComponentDependencyError extends ExternalComponentError {
    /** Dépendance concernée */
    public readonly dependency: string;

    /**
     * Crée une nouvelle erreur de dépendance de composant
     * @param component Nom du composant
     * @param dependency Nom de la dépendance
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, dependency: string, details?: unknown) {
        super(component, `dependency ${dependency}`, details);
        this.name = 'ComponentDependencyError';
        this.dependency = dependency;
    }
}

/**
 * Erreur de timeout de composant
 * Utilisée pour signaler qu'une opération sur un composant a dépassé le délai imparti
 */
export class ComponentTimeoutError extends ExternalComponentError {
    /** Délai imparti en millisecondes */
    public readonly timeout: number;

    /**
     * Crée une nouvelle erreur de timeout de composant
     * @param component Nom du composant
     * @param operation Nom de l'opération
     * @param timeout Délai imparti en millisecondes
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, operation: string, timeout: number, details?: unknown) {
        super(component, operation, details);
        this.name = 'ComponentTimeoutError';
        this.timeout = timeout;
        this.message = `Operation ${operation} on component ${component} timed out after ${timeout}ms`;
    }
}

/**
 * Erreur de ressource de composant
 * Utilisée pour signaler qu'un composant a épuisé ses ressources
 */
export class ComponentResourceError extends ExternalComponentError {
    /** Ressource concernée */
    public readonly resource: string;

    /**
     * Crée une nouvelle erreur de ressource de composant
     * @param component Nom du composant
     * @param resource Nom de la ressource
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, resource: string, details?: unknown) {
        super(component, `resource ${resource}`, details);
        this.name = 'ComponentResourceError';
        this.resource = resource;
        this.message = `Component ${component} has exhausted resource ${resource}`;
    }
}

/**
 * Erreur de version de composant
 * Utilisée pour signaler une incompatibilité de version d'un composant
 */
export class ComponentVersionError extends ExternalComponentError {
    /** Version requise */
    public readonly requiredVersion: string;
    /** Version actuelle */
    public readonly actualVersion: string;

    /**
     * Crée une nouvelle erreur de version de composant
     * @param component Nom du composant
     * @param requiredVersion Version requise
     * @param actualVersion Version actuelle
     * @param details Détails de l'erreur (optionnel)
     */
    constructor(component: string, requiredVersion: string, actualVersion: string, details?: unknown) {
        super(component, 'version incompatibility', details);
        this.name = 'ComponentVersionError';
        this.requiredVersion = requiredVersion;
        this.actualVersion = actualVersion;
        this.message = `Component ${component} version mismatch: required ${requiredVersion}, got ${actualVersion}`;
    }
}

/**
 * Fonction utilitaire pour créer une erreur de composant appropriée selon le contexte
 * @param component Nom du composant
 * @param operation Nom de l'opération
 * @param error Erreur d'origine
 * @returns Erreur de composant appropriée
 */
export function createComponentError(component: string, operation: string, error: unknown): ExternalComponentError {
    if (operation === 'initialization') {
        return new ComponentInitializationError(component, error);
    }

    if (operation === 'recovery') {
        return new ComponentRecoveryError(component, error);
    }

    if (operation === 'shutdown') {
        return new ComponentShutdownError(component, error);
    }

    // Par défaut, retourner une erreur de composant externe générique
    return new ExternalComponentError(component, operation, error);
}