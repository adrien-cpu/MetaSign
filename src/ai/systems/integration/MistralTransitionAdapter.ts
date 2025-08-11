// src/ai/systems/integration/mistral/MistralTransitionAdapter.ts
import { LSFTransitionSystem } from '../../expressions/grammar/LSFTransitionSystem';
import { LSFExpression } from '../../expressions/lsf/types';
import { TransitionContext } from '../../expressions/grammar/types/transition-types';
import { MistralProcessingOptions } from './types';
import { PerformanceMonitoringSystem } from '@ai/performance/PerformanceMonitoringSystem';

/**
 * Adaptateur pour intégrer le système Mistral avec le système de transition LSF
 * Optimise les transitions selon les capacités du modèle Mistral
 */
export class MistralTransitionAdapter {
    private readonly performanceMonitor: PerformanceMonitoringSystem;
    private readonly transitionCache: Map<string, {
        result: Promise<LSFExpression[]>;
        timestamp: number;
    }>;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    constructor(
        private readonly transitionSystem: LSFTransitionSystem,
        private readonly options: MistralProcessingOptions = {}
    ) {
        this.performanceMonitor = PerformanceMonitoringSystem.getInstance();
        this.transitionCache = new Map();
    }

    /**
     * Génère une séquence de transitions adaptée à Mistral
     * @param fromExpression Expression de départ
     * @param toExpression Expression cible
     * @param context Contexte de la transition
     * @returns Liste d'expressions formant la transition
     */
    public async generateTransitionSequence(
        fromExpression: LSFExpression,
        toExpression: LSFExpression,
        context: TransitionContext
    ): Promise<LSFExpression[]> {
        const startTime = performance.now();

        // Générer une clé de cache unique
        const cacheKey = this.generateCacheKey(fromExpression, toExpression, context);

        // Vérifier si le résultat est en cache
        const cachedItem = this.transitionCache.get(cacheKey);
        if (cachedItem && (Date.now() - cachedItem.timestamp < this.CACHE_TTL)) {
            this.performanceMonitor.recordMetric(
                'mistral.adapter',
                'cache_hit',
                1,
                { type: 'transition' }
            );
            return cachedItem.result;
        }

        // Appliquer les optimisations Mistral
        const optimizedContext = this.optimizeContextForMistral(context);

        // Générer la transition
        const resultPromise = this.processTransition(
            fromExpression,
            toExpression,
            optimizedContext
        );

        // Mettre en cache
        this.transitionCache.set(cacheKey, {
            result: resultPromise,
            timestamp: Date.now()
        });

        // Mesurer la performance
        const result = await resultPromise;
        const duration = performance.now() - startTime;

        this.performanceMonitor.recordMetric(
            'mistral.adapter',
            'processing_time',
            duration,
            {
                type: 'transition',
                expression_count: result.length,
                cached: false
            }
        );

        return result;
    }

    /**
     * Optimise le contexte de transition pour Mistral
     * @param context Contexte original
     * @returns Contexte optimisé
     */
    private optimizeContextForMistral(context: TransitionContext): TransitionContext {
        const optimizedContext: TransitionContext = { ...context };

        // Appliquer les ajustements de pruning si activés
        if (this.options.enablePruning) {
            // Réduire la complexité pour les transitions rapides
            if (context.speed === 'fast') {
                optimizedContext.importance = 'low';
            }
        }

        // Optimiser pour la quantification si activée
        if (this.options.enableQuantization) {
            // Réduire précision si nécessaire
            optimizedContext.quantizationLevel = this.options.quantizationLevel || 'medium';
        }

        return optimizedContext;
    }

    /**
     * Traite la transition et convertit en séquence d'expressions
     * @param fromExpression Expression de départ
     * @param toExpression Expression cible
     * @param context Contexte optimisé
     * @returns Liste d'expressions formant la transition
     */
    private async processTransition(
        fromExpression: LSFExpression,
        toExpression: LSFExpression,
        context: TransitionContext
    ): Promise<LSFExpression[]> {
        // Utiliser le système de transition existant
        const sequence = await this.transitionSystem.calculateTransition(
            fromExpression,
            toExpression,
            context
        );

        // Convertir les étapes en expressions
        const expressions: LSFExpression[] = [];

        // Ajouter l'expression de départ
        expressions.push(fromExpression);

        // Ajouter les expressions intermédiaires
        for (const step of sequence.steps) {
            // Appliquer optimisations Mistral aux expressions
            const optimizedExpression = this.applyMistralOptimizations(step.expression);
            expressions.push(optimizedExpression);

            // Appliquer la quantification si nécessaire
            if (this.options.enableQuantization && context.quantizationLevel) {
                this.quantizeExpression(expressions[expressions.length - 1], context.quantizationLevel);
            }
        }

        // Ajouter l'expression finale
        expressions.push(toExpression);

        return expressions;
    }

    /**
     * Applique les optimisations spécifiques à Mistral sur une expression
     * @param expression Expression à optimiser
     * @returns Expression optimisée
     */
    private applyMistralOptimizations(expression: LSFExpression): LSFExpression {
        // Créer une copie pour ne pas modifier l'original
        const optimized: LSFExpression = JSON.parse(JSON.stringify(expression));

        // Appliquer l'attention sparse si activée
        if (this.options.enableSparseAttention) {
            // Identifier les composants les plus importants et renforcer leur intensité
            // tout en réduisant l'impact des composants secondaires
            this.applySparseAttention(optimized);
        }

        return optimized;
    }

    /**
     * Applique l'attention sparse à une expression
     * @param expression Expression à modifier (modifiée sur place)
     */
    private applySparseAttention(expression: LSFExpression): void {
        // Exemple simple: on identifie le composant le plus significatif
        const components = [
            { name: 'eyebrows', value: expression.eyebrows.intensity || 0 },
            { name: 'head', value: expression.head.intensity || 0 },
            { name: 'mouth', value: expression.mouth.intensity || 0 }
        ];

        // Trouver le composant avec l'intensité la plus élevée
        const primaryComponent = components.reduce(
            (max, current) => current.value > max.value ? current : max,
            components[0]
        );

        // Amplifier le composant principal et réduire les autres
        if (primaryComponent.name === 'eyebrows' && expression.eyebrows.intensity !== undefined) {
            expression.eyebrows.intensity *= 1.2;
            if (expression.head.intensity !== undefined) expression.head.intensity *= 0.9;
            if (expression.mouth.intensity !== undefined) expression.mouth.intensity *= 0.9;
        } else if (primaryComponent.name === 'head' && expression.head.intensity !== undefined) {
            expression.head.intensity *= 1.2;
            if (expression.eyebrows.intensity !== undefined) expression.eyebrows.intensity *= 0.9;
            if (expression.mouth.intensity !== undefined) expression.mouth.intensity *= 0.9;
        } else if (primaryComponent.name === 'mouth' && expression.mouth.intensity !== undefined) {
            expression.mouth.intensity *= 1.2;
            if (expression.eyebrows.intensity !== undefined) expression.eyebrows.intensity *= 0.9;
            if (expression.head.intensity !== undefined) expression.head.intensity *= 0.9;
        }
    }

    /**
     * Quantifie une expression pour réduire la précision des valeurs
     * @param expression Expression à quantifier (modifiée sur place)
     * @param level Niveau de quantification
     */
    private quantizeExpression(expression: LSFExpression, level: string): void {
        // Déterminer la précision selon le niveau
        let precision = 2;
        if (level === 'low') {
            precision = 1;
        } else if (level === 'high') {
            precision = 3;
        }

        // Appliquer la quantification aux composants numériques
        this.quantizeComponent(expression.eyebrows, precision);
        this.quantizeComponent(expression.head, precision);
        this.quantizeComponent(expression.mouth, precision);
    }

    /**
     * Quantifie un composant d'expression
     * @param component Composant à quantifier
     * @param precision Précision décimale
     */
    private quantizeComponent(component: Record<string, unknown>, precision: number): void {
        for (const [key, value] of Object.entries(component)) {
            if (typeof value === 'number') {
                // Arrondir à la précision spécifiée
                component[key] = Number(value.toFixed(precision));
            } else if (value && typeof value === 'object') {
                // Récursion pour les objets imbriqués
                this.quantizeComponent(value as Record<string, unknown>, precision);
            }
        }
    }

    /**
     * Génère une clé de cache unique pour une combinaison d'expressions et contexte
     * @param from Expression de départ
     * @param to Expression cible
     * @param context Contexte de la transition
     * @returns Clé de cache
     */
    private generateCacheKey(
        from: LSFExpression,
        to: LSFExpression,
        context: TransitionContext
    ): string {
        // Simplifier les expressions pour la clé de cache
        const simplifiedFrom = this.simplifyForCacheKey(from);
        const simplifiedTo = this.simplifyForCacheKey(to);

        return `${JSON.stringify(simplifiedFrom)}_${JSON.stringify(simplifiedTo)}_${JSON.stringify(context)}`;
    }

    /**
     * Simplifie une expression pour l'utilisation comme clé de cache
     * @param expression Expression à simplifier
     * @returns Version simplifiée
     */
    private simplifyForCacheKey(expression: LSFExpression): Record<string, unknown> {
        return {
            type: expression.expressionType,
            eyebrows: this.roundComponentValues(expression.eyebrows),
            head: this.roundComponentValues(expression.head),
            mouth: this.roundComponentValues(expression.mouth)
        };
    }

    /**
     * Arrondit les valeurs numériques d'un composant pour la clé de cache
     * @param component Composant à simplifier
     * @returns Composant avec valeurs arrondies
     */
    private roundComponentValues(component: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(component)) {
            if (typeof value === 'number') {
                // Arrondir à 1 décimale pour la clé de cache
                result[key] = Number(value.toFixed(1));
            } else if (value && typeof value === 'object') {
                // Récursion pour les objets imbriqués
                result[key] = this.roundComponentValues(value as Record<string, unknown>);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    /**
     * Efface le cache des transitions
     */
    public clearCache(): void {
        this.transitionCache.clear();
        this.performanceMonitor.recordMetric(
            'mistral.adapter',
            'cache_clear',
            1,
            { type: 'transition' }
        );
    }
}