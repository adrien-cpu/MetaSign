import { LoggerFactory } from '@ai/utils/LoggerFactory';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import {
    LearningContext,
    EthicalIssue,
    EthicalValidationResult,
    AdaptationFeedback
} from '../types/learning-interfaces';
import { Adaptation } from '../types/AdaptedContent';

/**
 * Type représentant la structure de requête pour le système d'éthique
 */
type EthicsRequestParams = {
    type: string;
    data: unknown;
    context: Record<string, unknown>;
    id: string;
    metadata: Record<string, unknown>;
};

/**
 * Type représentant la structure de réponse du système d'éthique
 */
type EthicsResponseData = {
    valid: boolean;
    message?: string;
};

/**
 * Interface pour le système de contrôle éthique
 * Permet l'intégration avec le système d'éthique central
 */
interface IEthicsControlSystem {
    /**
     * Valide une action selon les règles éthiques établies
     * 
     * @param request Données de la requête à valider
     * @returns Résultat de la validation avec un statut et un message optionnel
     */
    validateRequest(request: EthicsRequestParams): Promise<EthicsResponseData>;
}

/**
 * Adaptateur pour le SystemeControleEthique
 */
class EthicsControlAdapter implements IEthicsControlSystem {
    private readonly ethicsSystem: SystemeControleEthique;
    private readonly logger = LoggerFactory.getLogger('EthicsControlAdapter');

    constructor() {
        this.ethicsSystem = SystemeControleEthique.getInstance();
    }

    /**
     * Valide une action selon les règles éthiques établies
     * 
     * @param request Données de la requête à valider
     * @returns Résultat de la validation avec un statut et un message optionnel
     */
    public async validateRequest(request: EthicsRequestParams): Promise<EthicsResponseData> {
        try {
            // Nous devons utiliser une approche par proxy pour adapter les types
            // entre notre système et le SystemeControleEthique
            const proxy = new Proxy(request, {
                get: (target, prop) => {
                    // Renvoyer les valeurs du paramètre original
                    return target[prop as keyof typeof target];
                }
            });

            // Appel au système d'éthique avec notre proxy
            const result = await this.ethicsSystem.validateRequest(proxy);

            // Construction d'un résultat normalisé
            const response: EthicsResponseData = {
                valid: false
            };

            // Extraction des propriétés pertinentes avec vérification de type
            if (result && typeof result === 'object') {
                if ('valid' in result && typeof result.valid === 'boolean') {
                    response.valid = result.valid;
                }

                if ('message' in result && result.message !== null && result.message !== undefined) {
                    response.message = String(result.message);
                }
            }

            return response;
        } catch (error) {
            this.logger.error('Error calling ethics system', {
                error: error instanceof Error ? error.message : String(error)
            });

            // En cas d'erreur, être conservateur et ne pas approuver
            return {
                valid: false,
                message: 'Erreur lors de la validation éthique'
            };
        }
    }
}

/**
 * Validateur éthique pour les adaptations d'apprentissage
 * 
 * Vérifie que les adaptations proposées respectent les principes éthiques
 * et suggère des alternatives si nécessaire.
 */
export class EthicalValidator {
    private readonly logger = LoggerFactory.getLogger('EthicalValidator');
    private readonly ethicsSystem: IEthicsControlSystem;

    /**
     * Crée une nouvelle instance du validateur éthique
     * 
     * @param ethicsSystem Système de contrôle éthique à utiliser (optionnel)
     */
    constructor(ethicsSystem?: IEthicsControlSystem) {
        this.ethicsSystem = ethicsSystem || new EthicsControlAdapter();
    }

    /**
     * Valide une adaptation sur le plan éthique
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage actuel 
     * @param adaptation Adaptation à valider
     * @returns Résultat de la validation éthique
     */
    public async validateAdaptation(
        userId: string,
        context: LearningContext,
        adaptation: Adaptation
    ): Promise<EthicalValidationResult> {
        this.logger.debug('Validating adaptation', {
            userId,
            adaptationType: adaptation.type
        });

        // Collecter les problèmes éthiques potentiels
        const issues: EthicalIssue[] = [];
        let needsAdjustment = false;

        // Vérifier les règles éthiques spécifiques
        const ethicalIssues = this.checkEthicalRules(adaptation, context);
        if (ethicalIssues.length > 0) {
            issues.push(...ethicalIssues);
            // Vérifier si des problèmes sévères existent
            if (ethicalIssues.some(issue => issue.severity === 'high')) {
                needsAdjustment = true;
            }
        }

        // Consulter le système d'éthique central
        const ethicsRequest: EthicsRequestParams = {
            type: 'learning_adaptation',
            data: adaptation,
            context: {
                userId,
                contextData: context
            },
            id: `ethics_learning_${Date.now()}`,
            metadata: {}
        };

        const ethicsResult = await this.ethicsSystem.validateRequest(ethicsRequest);

        if (!ethicsResult.valid) {
            issues.push({
                type: 'compliance',
                description: ethicsResult.message || 'Non-conformité avec les règles éthiques',
                severity: 'high',
                affectedAdaptation: adaptation.type
            });
            needsAdjustment = true;
        }

        // Générer des suggestions si nécessaire
        let suggestions: Adaptation[] | undefined = undefined;
        if (needsAdjustment) {
            const suggestedAdaptations = this.generateSuggestions(adaptation, ethicalIssues);
            if (suggestedAdaptations.length > 0) {
                suggestions = suggestedAdaptations;
            }
        }

        // Construire le résultat final en respectant exactOptionalPropertyTypes
        const result: EthicalValidationResult = {
            valid: !needsAdjustment
        };

        // Ajouter les propriétés optionnelles uniquement si nécessaires
        if (issues.length > 0) {
            result.issues = issues;
        }

        if (suggestions && suggestions.length > 0) {
            // Utilisation de génériques pour résoudre le problème de typage sans utiliser 'any'
            (result as EthicalValidationResult & { suggestions: Adaptation[] }).suggestions = suggestions;
        }

        return result;
    }

    /**
     * Vérifie les règles éthiques pour une adaptation donnée
     * 
     * @param adaptation Adaptation à vérifier
     * @param context Contexte d'apprentissage
     * @returns Liste des problèmes éthiques détectés
     */
    private checkEthicalRules(adaptation: Adaptation, context: LearningContext): EthicalIssue[] {
        const issues: EthicalIssue[] = [];

        const intensity = adaptation.intensity ?? 0.5;

        // Règle 1: Éviter d'augmenter excessivement la difficulté
        if (
            adaptation.type === 'difficulty' &&
            adaptation.action === 'increase' &&
            intensity > 0.5 &&
            (context.errorRate || 0) > 0.3
        ) {
            issues.push({
                type: 'excessive_difficulty',
                description: 'Augmentation de difficulté trop importante avec un taux d\'erreur élevé',
                severity: 'high',
                affectedAdaptation: adaptation.type
            });
        }

        // Règle 2: Protection des utilisateurs en difficulté
        const helpRequests = context.helpRequests || 0;
        const errorRate = context.errorRate || 0;
        const frustrationLevel = context.currentFrustration || 0;

        if (helpRequests > 3 && errorRate > 0.4 && frustrationLevel > 0.6) {
            if (
                (adaptation.type === 'difficulty' && adaptation.action !== 'decrease') ||
                (adaptation.type === 'pace' && adaptation.action === 'increase')
            ) {
                issues.push({
                    type: 'vulnerable_user_protection',
                    description: 'Adaptation inappropriée pour un utilisateur en difficulté',
                    severity: 'high',
                    affectedAdaptation: adaptation.type
                });
            }
        }

        // Règle 3: Maintien de l'autonomie de l'utilisateur
        if (!adaptation.overridable && intensity > 0.7) {
            issues.push({
                type: 'autonomy_violation',
                description: 'Adaptation obligatoire à forte intensité limitant l\'autonomie',
                severity: 'medium',
                affectedAdaptation: adaptation.type
            });
        }

        // Règle 4: Transparence des explications
        if (!adaptation.explanation || adaptation.explanation.length < 10) {
            issues.push({
                type: 'insufficient_transparency',
                description: 'Explication insuffisante pour l\'adaptation',
                severity: 'low',
                affectedAdaptation: adaptation.type
            });
        }

        return issues;
    }

    /**
     * Génère des suggestions d'adaptation alternatives
     * 
     * @param adaptation Adaptation originale
     * @param issues Problèmes éthiques détectés
     * @returns Liste des adaptations alternatives suggérées
     */
    private generateSuggestions(adaptation: Adaptation, issues: EthicalIssue[]): Adaptation[] {
        const suggestions: Adaptation[] = [];

        const intensity = adaptation.intensity ?? 0.5;

        // Traiter chaque problème et générer une suggestion adaptée
        for (const issue of issues) {
            if (issue.severity !== 'high') continue;

            switch (issue.type) {
                case 'excessive_difficulty':
                    suggestions.push({
                        ...adaptation,
                        action: 'increase',
                        intensity: Math.min(0.2, intensity / 2),
                        explanation: 'Légère augmentation de la difficulté pour maintenir l\'engagement sans frustration'
                    });
                    break;

                case 'vulnerable_user_protection':
                    if (adaptation.type === 'difficulty') {
                        suggestions.push({
                            ...adaptation,
                            action: 'decrease',
                            intensity: 0.3,
                            explanation: 'Réduction temporaire de la difficulté pour vous aider à progresser'
                        });
                    } else if (adaptation.type === 'pace') {
                        suggestions.push({
                            ...adaptation,
                            action: 'decrease',
                            intensity: 0.3,
                            explanation: 'Ralentissement du rythme pour permettre une meilleure assimilation'
                        });
                    }
                    break;

                case 'autonomy_violation':
                    suggestions.push({
                        ...adaptation,
                        overridable: true,
                        explanation: (adaptation.explanation || '') + ' (vous pouvez ajuster ce paramètre selon vos préférences)'
                    });
                    break;

                case 'insufficient_transparency':
                    const defaultExplanations: Record<string, string> = {
                        difficulty: 'Ajustement de la difficulté pour optimiser votre apprentissage',
                        pace: 'Modification du rythme pour s\'adapter à vos besoins',
                        content: 'Personnalisation du contenu selon vos préférences',
                        assistance: 'Aide adaptée à votre progression actuelle',
                        structure: 'Organisation du contenu pour faciliter la compréhension',
                        feedback: 'Retour personnalisé pour soutenir votre apprentissage'
                    };

                    suggestions.push({
                        ...adaptation,
                        explanation: defaultExplanations[adaptation.type] || 'Adaptation personnalisée pour améliorer votre expérience'
                    });
                    break;
            }
        }

        // Si aucune suggestion spécifique n'a été trouvée mais des ajustements sont nécessaires
        if (suggestions.length === 0 && issues.some(issue => issue.severity === 'high')) {
            // Créer une suggestion générique plus sûre
            suggestions.push({
                ...adaptation,
                intensity: Math.max(0.3, intensity * 0.7),
                overridable: true,
                explanation: 'Version ajustée pour respecter les principes éthiques'
            });
        }

        return suggestions;
    }

    /**
     * Valide un ensemble d'adaptations sur le plan éthique
     * 
     * @param userId Identifiant de l'utilisateur
     * @param context Contexte d'apprentissage
     * @param adaptations Liste d'adaptations à valider
     * @returns Adaptations validées ou modifiées
     */
    public async validateAdaptations(
        userId: string,
        context: LearningContext,
        adaptations: Adaptation[]
    ): Promise<Adaptation[]> {
        const validatedAdaptations: Adaptation[] = [];

        for (const adaptation of adaptations) {
            const result = await this.validateAdaptation(userId, context, adaptation);

            if (result.valid) {
                validatedAdaptations.push(adaptation);
            } else {
                // Utilisation de la vérification de type stricte sans 'any'
                const resultWithSuggestions = result as EthicalValidationResult & { suggestions?: Adaptation[] };

                if (resultWithSuggestions.suggestions && resultWithSuggestions.suggestions.length > 0) {
                    // Utiliser la première suggestion comme alternative
                    validatedAdaptations.push(resultWithSuggestions.suggestions[0]);
                }
            }
        }

        return validatedAdaptations;
    }

    /**
     * Valide un type d'adaptation pour assurer sa conformité avec les types acceptés
     * 
     * @param type Type d'adaptation à valider
     * @returns Type d'adaptation validé
     */
    private validateAdaptationType(type: string): string {
        // Liste des types d'adaptation valides
        const validTypes = [
            'difficulty',
            'pace',
            'content',
            'assistance',
            'structure',
            'feedback'
        ];

        // Vérifier si le type est valide
        if (validTypes.includes(type)) {
            return type;
        }

        // Log l'erreur et retourne un type par défaut pour éviter les plantages
        this.logger.warn('Type d\'adaptation invalide détecté', {
            invalidType: type,
            fallbackTo: 'content'
        });

        return 'content';
    }

    /**
     * Méthode simplifiée pour la validation d'une adaptation 
     * Utilisée pour une intégration plus facile avec d'autres composants
     * 
     * @param adaptationData Données d'adaptation simplifiées à valider
     * @returns True si l'adaptation est éthiquement valide
     */
    public async validateAdaptationSimple(adaptationData: {
        type: string;
        description: string;
        elements: string[];
    }): Promise<boolean> {
        try {
            // Convertir les données d'entrée simplifiées en structure Adaptation
            const typeSafeType = this.validateAdaptationType(adaptationData.type);

            const adaptation: Adaptation = {
                type: typeSafeType,
                description: adaptationData.description,
                appliedElements: adaptationData.elements,
                action: 'maintain', // Valeur par défaut
                intensity: 0.5,     // Valeur par défaut
                reason: 'Validation simple',
                explanation: adaptationData.description,
                overridable: true,
                metadata: {}
            };

            // Utiliser un contexte minimal
            const minimalContext: LearningContext = {
                userId: 'anonymous',
                timestamp: new Date()
            };

            // Effectuer la validation complète
            const result = await this.validateAdaptation('anonymous', minimalContext, adaptation);

            return result.valid;
        } catch (error) {
            this.logger.error('Error in simplified validation', {
                error: error instanceof Error ? error.message : String(error),
                adaptationType: adaptationData.type
            });

            // Par défaut, on valide en cas d'erreur pour ne pas bloquer le système
            return true;
        }
    }

    /**
     * Enregistre le feedback sur les adaptations pour amélioration future
     * 
     * @param feedback Données de feedback sur les adaptations
     */
    public logFeedback(feedback: AdaptationFeedback): void {
        try {
            this.logger.info('Received adaptation feedback', {
                userId: feedback.userId,
                adaptationCount: feedback.adaptationCount,
                positiveCount: feedback.positiveCount,
                acceptanceRate: feedback.adaptationCount > 0
                    ? (feedback.positiveCount / feedback.adaptationCount)
                    : 0,
                timestamp: feedback.timestamp || new Date()
            });

            // Implémentation future pour l'apprentissage basé sur le feedback
            // TODO: Intégrer avec un système d'apprentissage
        } catch (error) {
            this.logger.error('Error logging feedback', {
                userId: feedback.userId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}