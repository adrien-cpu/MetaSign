// src/ai/learning/adapters/realtime/AssistanceProvider.ts

import { LoggerFactory } from '@ai/utils/LoggerFactory';
import { LearningContext, UserProfile } from '../../types/learning-interfaces';

/**
 * Type d'assistance fournie à l'utilisateur
 */
export enum AssistanceType {
    HINT = 'hint',
    EXPLANATION = 'explanation',
    DEMONSTRATION = 'demonstration',
    FEEDBACK = 'feedback',
    GUIDANCE = 'guidance'
}

/**
 * Résultat de l'assistance fournie
 */
export interface AssistanceResult {
    /** Type d'assistance fournie */
    type: AssistanceType;

    /** Contenu de l'assistance */
    content: string;

    /** Priorité d'affichage (1-10) */
    priority: number;

    /** Indique si l'utilisateur peut ignorer l'assistance */
    dismissible: boolean;

    /** Durée d'affichage recommandée (en millisecondes) */
    duration: number;
}

/**
 * Fournit une assistance contextuelle à l'utilisateur basée sur son
 * comportement et ses besoins détectés.
 */
export class AssistanceProvider {
    private readonly logger = LoggerFactory.getLogger('AssistanceProvider');

    /**
     * Fournit une assistance adaptée au contexte d'apprentissage
     * 
     * @param context - Contexte d'apprentissage actuel
     * @param profile - Profil de l'utilisateur
     * @returns Résultat d'assistance avec contenu et métadonnées
     */
    public provideAssistance(
        context: LearningContext,
        profile: UserProfile
    ): AssistanceResult {
        this.logger.debug('Providing assistance', { userId: context.userId });

        try {
            // Déterminer le type d'assistance approprié
            const assistanceType = this.determineAssistanceType(context, profile);

            // Générer le contenu de l'assistance
            const content = this.generateContent(assistanceType, context, profile);

            // Calculer la priorité de l'assistance
            const priority = this.calculatePriority(context);

            // Déterminer si l'assistance doit être ignorable
            const dismissible = this.shouldBeDismissible(assistanceType, context);

            // Calculer la durée d'affichage recommandée
            const duration = this.calculateDuration(assistanceType, content);

            return {
                type: assistanceType,
                content,
                priority,
                dismissible,
                duration
            };
        } catch (error) {
            this.logger.error('Error providing assistance', {
                userId: context.userId,
                error: error instanceof Error ? error.message : String(error)
            });

            // Fournir une assistance de secours en cas d'erreur
            return {
                type: AssistanceType.HINT,
                content: 'Un conseil pourrait être utile ici',
                priority: 1,
                dismissible: true,
                duration: 5000
            };
        }
    }

    /**
     * Détermine le type d'assistance le plus approprié au contexte
     */
    private determineAssistanceType(
        context: LearningContext,
        profile: UserProfile
    ): AssistanceType {
        // Utilisation du profile pour personnaliser le type d'assistance
        const skillLevel = profile.skillLevel || 'beginner';

        // Si l'utilisateur a commis plusieurs erreurs, fournir une explication
        if (context.errorRate && context.errorRate > 0.3) {
            // Pour les utilisateurs avancés, on peut privilégier des démonstrations plutôt que des explications
            if (skillLevel === 'advanced' && context.errorRate < 0.4) {
                return AssistanceType.DEMONSTRATION;
            }
            return AssistanceType.EXPLANATION;
        }

        // Si l'utilisateur est bloqué, fournir une démonstration
        if (context.timePerTaskTrend && context.timePerTaskTrend > 0.5) {
            return AssistanceType.DEMONSTRATION;
        }

        // Si l'utilisateur progresse bien mais pourrait être plus efficace
        if (context.completionRate && context.completionRate > 0.7 && context.averageScore && context.averageScore < 80) {
            return AssistanceType.FEEDBACK;
        }

        // Si l'utilisateur semble perdu dans la navigation
        if (context.navigationConsistency && context.navigationConsistency < 0.5) {
            return AssistanceType.GUIDANCE;
        }

        // Par défaut, fournir un indice
        return AssistanceType.HINT;
    }

    /**
     * Génère le contenu d'assistance approprié
     */
    private generateContent(
        type: AssistanceType,
        context: LearningContext,
        profile: UserProfile
    ): string {
        // Obtenir le niveau de compétence de l'utilisateur
        const skillLevel = profile.skillLevel || 'beginner';

        // Extraire le sujet courant depuis les métadonnées contextuelles ou utiliser une valeur par défaut
        const currentTopic = this.getCurrentTopic(context);

        switch (type) {
            case AssistanceType.HINT:
                return this.generateHint(skillLevel, currentTopic);
            case AssistanceType.EXPLANATION:
                return this.generateExplanation(skillLevel, currentTopic);
            case AssistanceType.DEMONSTRATION:
                return this.generateDemonstration(skillLevel, currentTopic);
            case AssistanceType.FEEDBACK:
                return this.generateFeedback(context, skillLevel);
            case AssistanceType.GUIDANCE:
                return this.generateGuidance(context, skillLevel);
            default:
                return "Besoin d'aide avec cette section ?";
        }
    }

    /**
     * Calcule la priorité de l'assistance (1-10)
     */
    private calculatePriority(context: LearningContext): number {
        let priority = 5; // Priorité moyenne par défaut

        // Augmenter la priorité si l'utilisateur est bloqué
        if (context.timePerTaskTrend && context.timePerTaskTrend > 0.7) {
            priority += 3;
        }

        // Augmenter la priorité si l'utilisateur commet beaucoup d'erreurs
        if (context.errorRate && context.errorRate > 0.4) {
            priority += 2;
        }

        // Augmenter la priorité si l'utilisateur a explicitement demandé de l'aide
        if (context.helpRequests && context.helpRequests > 0) {
            priority += 4;
        }

        // Diminuer la priorité si l'utilisateur progresse bien
        if (context.performanceTrend && context.performanceTrend > 0.2) {
            priority -= 2;
        }

        // Limiter la priorité entre 1 et 10
        return Math.min(10, Math.max(1, priority));
    }

    /**
     * Détermine si l'assistance doit être ignorable
     */
    private shouldBeDismissible(type: AssistanceType, context: LearningContext): boolean {
        // Les assistances critiques (erreurs graves, blocages) ne devraient pas être ignorables
        if (
            type === AssistanceType.DEMONSTRATION &&
            context.timePerTaskTrend &&
            context.timePerTaskTrend > 0.8
        ) {
            return false;
        }

        if (
            type === AssistanceType.GUIDANCE &&
            context.navigationConsistency &&
            context.navigationConsistency < 0.3
        ) {
            return false;
        }

        // Par défaut, l'assistance est ignorable
        return true;
    }

    /**
     * Calcule la durée d'affichage recommandée en ms
     */
    private calculateDuration(type: AssistanceType, content: string): number {
        // Durée de base selon le type
        let baseDuration: number;
        switch (type) {
            case AssistanceType.HINT:
                baseDuration = 5000; // 5 secondes
                break;
            case AssistanceType.EXPLANATION:
                baseDuration = 15000; // 15 secondes
                break;
            case AssistanceType.DEMONSTRATION:
                baseDuration = 30000; // 30 secondes
                break;
            case AssistanceType.FEEDBACK:
                baseDuration = 8000; // 8 secondes
                break;
            case AssistanceType.GUIDANCE:
                baseDuration = 12000; // 12 secondes
                break;
            default:
                baseDuration = 10000; // 10 secondes par défaut
        }

        // Ajuster en fonction de la longueur du contenu
        // Environ 1 seconde par 15 caractères (vitesse de lecture moyenne)
        const contentLengthFactor = Math.max(content.length / 15, 1);

        return Math.round(baseDuration * Math.sqrt(contentLengthFactor));
    }

    /**
     * Génère un indice basé sur le contexte
     */
    private generateHint(skillLevel: string, topic: string): string {
        // Logique de génération d'indice adaptée au niveau et au sujet
        if (skillLevel === 'beginner') {
            return `Conseil pour débutant sur ${topic}: essayez d'aborder le problème étape par étape.`;
        }
        return `Conseil sur ${topic}: essayez d'appliquer les concepts avancés que vous avez appris précédemment.`;
    }

    /**
     * Génère une explication détaillée
     */
    private generateExplanation(skillLevel: string, topic: string): string {
        // Logique de génération d'explication adaptée au niveau et au sujet
        return `Explication de ${topic} (niveau ${skillLevel}): cette technique fonctionne ainsi : premièrement, identifiez les éléments clés. Ensuite, analysez leurs relations.`;
    }

    /**
     * Génère une démonstration pas à pas
     */
    private generateDemonstration(skillLevel: string, topic: string): string {
        // Logique de génération de démonstration adaptée au niveau et au sujet
        return `Démonstration de ${topic} (niveau ${skillLevel}):\n1. Commencez par...\n2. Ensuite...\n3. Finalement...`;
    }

    /**
     * Génère un retour personnalisé sur la performance
     */
    private generateFeedback(context: LearningContext, skillLevel: string): string {
        // Utiliser les informations du contexte pour personnaliser le feedback
        const performance = context.averageScore ? `${context.averageScore}%` : "bonne";

        return `Pour un niveau ${skillLevel}, votre performance est à ${performance}. Votre approche est bonne, mais vous pourriez améliorer votre efficacité en utilisant cette technique alternative.`;
    }

    /**
     * Génère un guidage pour aider l'orientation
     */
    private generateGuidance(context: LearningContext, skillLevel: string): string {
        // Utiliser les informations du contexte pour personnaliser le guidage
        const currentModule = this.getCurrentModule(context);
        const recommendedModule = this.getRecommendedModule(context, skillLevel);

        return `Pour progresser depuis le module ${currentModule}, dirigez-vous vers ${recommendedModule} et complétez d'abord les exercices fondamentaux adaptés à votre niveau ${skillLevel}.`;
    }

    /**
     * Obtient le sujet courant depuis le contexte
     */
    private getCurrentTopic(context: LearningContext): string {
        // Rechercher le sujet actuel dans les métadonnées du contexte
        if (typeof context.situationalFactors === 'object' &&
            context.situationalFactors !== null &&
            'currentTopic' in context.situationalFactors) {
            const currentTopic = context.situationalFactors.currentTopic;
            if (typeof currentTopic === 'string') {
                return currentTopic;
            }
        }

        // Si on a des contentTags, on peut utiliser le premier comme un indicateur approximatif du sujet
        if (context.contentTags && context.contentTags.length > 0) {
            return context.contentTags[0];
        }

        return 'général';
    }

    /**
     * Obtient le module courant depuis le contexte
     */
    private getCurrentModule(context: LearningContext): string {
        // Rechercher le module actuel dans les métadonnées du contexte
        if (typeof context.situationalFactors === 'object' &&
            context.situationalFactors !== null &&
            'currentModule' in context.situationalFactors) {
            const currentModule = context.situationalFactors.currentModule;
            if (typeof currentModule === 'string') {
                return currentModule;
            }
        }

        return 'actuel';
    }

    /**
     * Détermine le module recommandé en fonction du contexte et du niveau de compétence
     */
    private getRecommendedModule(context: LearningContext, skillLevel: string): string {
        // Obtenir le module actuel
        const currentModule = this.getCurrentModule(context);

        // Implémentation basique - dans une vraie application, cela pourrait
        // être basé sur un algorithme plus complexe ou des données externes
        if (skillLevel === 'beginner') {
            return `${currentModule}-basics`;
        } else if (skillLevel === 'intermediate') {
            return `${currentModule}-advanced`;
        } else {
            return `${currentModule}-expert`;
        }
    }
}