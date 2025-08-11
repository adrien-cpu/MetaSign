/**
 * Registre des stratégies de génération de contenu - Version corrigée
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/content/strategies/ContentGeneratorRegistry.ts
 * @module ai/services/learning/human/coda/codavirtuel/exercises/content/strategies
 * @description Gère l'enregistrement et la récupération des stratégies de génération
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import { SupportedExerciseType } from '../../types/ExerciseGeneratorTypes';
import { LoggerFactory } from '@/ai/utils/LoggerFactory';

/**
 * Interface commune pour toutes les stratégies de génération de contenu
 */
export interface IContentGeneratorStrategy {
    generate(theme: string, level: string, difficulty: string, conceptGenerator: unknown): unknown;
    generateExpectedResponse(content: unknown): unknown;
    validateResponse(content: unknown, expectedResponse: unknown, studentResponse: unknown): number;
    readonly name?: string;
    readonly version?: string;
}

/**
 * Implémentation simple d'une stratégie Multiple Choice
 */
class SimpleMultipleChoiceStrategy implements IContentGeneratorStrategy {
    public readonly name = 'SimpleMultipleChoiceStrategy';
    public readonly version = '3.0.0';

    public generate(theme: string, level: string, difficulty: string): unknown {
        return {
            type: 'multiple-choice',
            question: `Question sur ${theme} (niveau ${level}, difficulté ${difficulty})`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 0,
            metadata: {
                theme,
                level,
                difficulty,
                generatedAt: new Date()
            }
        };
    }

    public generateExpectedResponse(): unknown {
        return { correctAnswer: 0 };
    }

    public validateResponse(): number {
        return 1;
    }
}

/**
 * Interface pour les statistiques du registre
 */
interface RegistryStats {
    readonly totalStrategies: number;
    readonly supportedTypes: readonly SupportedExerciseType[];
    readonly defaultStrategy: SupportedExerciseType;
    readonly lastUpdated: Date;
}

/**
 * Gestionnaire centralisé des stratégies de génération de contenu
 */
export class ContentGeneratorRegistry {
    private readonly logger = LoggerFactory.getLogger('ContentGeneratorRegistry');
    private readonly strategies = new Map<SupportedExerciseType, IContentGeneratorStrategy>();
    private readonly creationTimes = new Map<SupportedExerciseType, Date>();
    private lastUpdated = new Date();

    /**
     * Initialise le registre
     */
    constructor() {
        this.logger.debug('ContentGeneratorRegistry initialized');
    }

    /**
     * Enregistre une stratégie pour un type d'exercice
     */
    public registerStrategy(type: SupportedExerciseType, strategy: IContentGeneratorStrategy): void {
        if (!this.isValidStrategy(strategy)) {
            throw new Error(`Invalid strategy provided for type: ${type}`);
        }

        this.strategies.set(type, strategy);
        this.creationTimes.set(type, new Date());
        this.lastUpdated = new Date();

        this.logger.debug('Strategy registered', {
            type,
            strategyName: strategy.name || 'Unknown',
            totalStrategies: this.strategies.size
        });
    }

    /**
     * Récupère une stratégie pour un type d'exercice donné
     */
    public getStrategy(type: SupportedExerciseType): IContentGeneratorStrategy {
        const strategy = this.strategies.get(type);

        if (!strategy) {
            this.logger.warn('Strategy not found, using default', {
                requestedType: type,
                defaultType: 'MultipleChoice'
            });

            return this.getDefaultStrategy();
        }

        return strategy;
    }

    /**
     * Vérifie si une stratégie est enregistrée
     */
    public hasStrategy(type: SupportedExerciseType): boolean {
        return this.strategies.has(type);
    }

    /**
     * Supprime une stratégie du registre
     */
    public removeStrategy(type: SupportedExerciseType): boolean {
        const removed = this.strategies.delete(type);
        if (removed) {
            this.creationTimes.delete(type);
            this.lastUpdated = new Date();
            this.logger.debug('Strategy removed', { type });
        }
        return removed;
    }

    /**
     * Vide le registre de toutes les stratégies
     */
    public clear(): void {
        const previousSize = this.strategies.size;
        this.strategies.clear();
        this.creationTimes.clear();
        this.lastUpdated = new Date();

        this.logger.info('Registry cleared', { previousSize });
    }

    /**
     * Retourne le nombre de stratégies enregistrées
     */
    public getRegisteredStrategiesCount(): number {
        return this.strategies.size;
    }

    /**
     * Retourne la liste des types supportés
     */
    public getSupportedTypes(): readonly SupportedExerciseType[] {
        return Array.from(this.strategies.keys());
    }

    /**
     * Obtient les statistiques du registre
     */
    public getStats(): RegistryStats {
        return {
            totalStrategies: this.strategies.size,
            supportedTypes: this.getSupportedTypes(),
            defaultStrategy: 'MultipleChoice',
            lastUpdated: this.lastUpdated
        };
    }

    /**
     * Valide qu'une stratégie implémente correctement l'interface
     */
    private isValidStrategy(strategy: IContentGeneratorStrategy): boolean {
        return strategy &&
            typeof strategy === 'object' &&
            typeof strategy.generate === 'function' &&
            typeof strategy.generateExpectedResponse === 'function' &&
            typeof strategy.validateResponse === 'function';
    }

    /**
     * Récupère la stratégie par défaut
     */
    private getDefaultStrategy(): IContentGeneratorStrategy {
        const defaultType: SupportedExerciseType = 'MultipleChoice';
        let defaultStrategy = this.strategies.get(defaultType);

        if (!defaultStrategy) {
            // Créer la stratégie par défaut si elle n'existe pas
            defaultStrategy = new SimpleMultipleChoiceStrategy();
            this.registerStrategy(defaultType, defaultStrategy);

            this.logger.warn('Default strategy created automatically', {
                type: defaultType
            });
        }

        return defaultStrategy;
    }
}