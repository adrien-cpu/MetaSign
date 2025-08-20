/**
     * Crée un système émotionnel configuré pour les tests
     * 
     * @param config - Configuration optionnelle du système/**
 * @file src/ai/services/learning/human/coda/codavirtuel/systems/__tests__/utils/IntegrationTestFactory.ts
 * @description Factory pattern pour créer des instances de test configurées et typées
 * 
 * Ce module implémente le pattern Factory pour créer des instances de systèmes de test
 * avec des configurations prédéfinies et un typage strict.
 * 
 * ## Fonctionnalités :
 * - 🏭 **Factory Pattern** : Création d'instances configurées
 * - ⚙️ **Configurations prédéfinies** : Contextes d'apprentissage standardisés
 * - 🔒 **Typage strict** : Aucun usage de `any`, conformité TypeScript
 * - 🧪 **Mocks intelligents** : Systèmes simulés pour les tests
 * - 🎯 **Configuration adaptative** : Différents niveaux de complexité
 * 
 * @module IntegrationTestFactory
 * @version 3.0.0 - Révolution CODA
 * @since 2025
 * @author MetaSign Team - Testing Division
 * 
 * @requires @ai/services/learning/human/coda/codavirtuel/systems/AIEmotionalSystem
 * @requires ./IntegrationTestTypes
 * 
 * @see {@link ./IntegrationTestTypes} - Types utilisés par la factory
 * @see {@link ./IntegrationTestUtils} - Utilitaires complémentaires
 */

import { AIEmotionalSystem } from '../../AIEmotionalSystem';
import type {
    TestSystemConfig,
    PersonalityTestData,
    MockPersonalitySystem,
    TestableEmotionalSystem,
    MockCODASystem,
    SignExecutionData,
    CODAEvaluation
} from '../types/IntegrationTestTypes';

/**
 * Factory pour créer des instances de test configurées de manière générique
 */
export class IntegrationTestFactory {
    /**
     * Crée un système émotionnel configuré pour les tests
     * 
     * @param config - Configuration optionnelle du système
     * @returns Instance d'AIEmotionalSystem configurée pour les tests
     * 
     * @example
     * ```typescript
     * const system = IntegrationTestFactory.createEmotionalSystem({
     *   enableAdvancedFeatures: true,
     *   testMode: true
     * });
     * ```
     */
    public static createEmotionalSystem(config: TestSystemConfig = {}): TestableEmotionalSystem {
        // Configuration par défaut générique
        const defaultConfig: TestSystemConfig = {
            enableAdvancedFeatures: true,
            testMode: true,
            ...config
        };

        try {
            // Tentative de création avec la configuration fournie
            const systemConfig = this.sanitizeConfig(defaultConfig);
            // Conversion via unknown pour gérer l'incompatibilité de types
            return new AIEmotionalSystem(systemConfig) as unknown as TestableEmotionalSystem;
        } catch {
            // Fallback avec configuration minimale en cas d'erreur
            console.warn('Erreur lors de la création du système émotionnel, fallback utilisé');
            return new AIEmotionalSystem({}) as unknown as TestableEmotionalSystem;
        }
    }

    /**
     * Crée un système de personnalité pour les tests
     * 
     * @returns Mock du système de personnalité ou instance réelle si disponible
     * 
     * @example
     * ```typescript
     * const personalitySystem = IntegrationTestFactory.createPersonalitySystem();
     * const profile = personalitySystem.createInitialProfile('student1', { learningStyle: 'visual' });
     * ```
     */
    public static createPersonalitySystem(): MockPersonalitySystem {
        try {
            // Tentative d'import dynamique du système de personnalité
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { AIPersonalitySystem } = require('../../AIPersonalitySystem') as {
                AIPersonalitySystem: new () => MockPersonalitySystem
            };
            return new AIPersonalitySystem();
        } catch (importError) {
            // Mock si le module n'existe pas ou est inaccessible
            console.warn('Système de personnalité non disponible, utilisation du mock:', importError);
            return this.createMockPersonalitySystem();
        }
    }

    /**
     * Crée une configuration de test basée sur un contexte d'apprentissage
     * 
     * @param context - Type de contexte d'apprentissage
     * @returns Configuration adaptée au contexte
     * 
     * @example
     * ```typescript
     * const config = IntegrationTestFactory.createContextConfig('beginner');
     * const system = IntegrationTestFactory.createEmotionalSystem(config);
     * ```
     */
    public static createContextConfig(context: string): TestSystemConfig {
        const configs: Record<string, TestSystemConfig> = {
            'beginner': {
                complexity: 'low',
                supportLevel: 'high',
                adaptationEnabled: true,
                debugMode: false
            },
            'intermediate': {
                complexity: 'medium',
                supportLevel: 'medium',
                adaptationEnabled: true,
                debugMode: false
            },
            'advanced': {
                complexity: 'high',
                supportLevel: 'low',
                adaptationEnabled: true,
                debugMode: false
            },
            'therapy': {
                complexity: 'adaptive',
                supportLevel: 'specialized',
                adaptationEnabled: true,
                debugMode: true
            }
        };

        return configs[context] ?? configs['intermediate'];
    }

    /**
     * Crée un système CODA mocké pour les tests d'intégration
     * 
     * @returns Instance mockée du système CODA
     * 
     * @example
     * ```typescript
     * const codaSystem = IntegrationTestFactory.createMockCODASystem();
     * const evaluation = await codaSystem.evaluateSignExecution('student1', { sign: 'bonjour', complexity: 'easy' });
     * ```
     */
    public static createMockCODASystem(): MockCODASystem {
        return new MockCODASystemImpl();
    }

    /**
     * Crée un mock du système de personnalité
     * 
     * @returns Mock basique du système de personnalité
     * @private
     */
    private static createMockPersonalitySystem(): MockPersonalitySystem {
        return {
            createInitialProfile: (studentId: string, data: PersonalityTestData): PersonalityTestData => {
                console.log(`Mock: Création du profil pour ${studentId}`);
                return { ...data };
            }
        };
    }

    /**
     * Nettoie et valide la configuration fournie
     * 
     * @param config - Configuration à nettoyer
     * @returns Configuration nettoyée et validée
     * @private
     */
    private static sanitizeConfig(config: TestSystemConfig): Record<string, unknown> {
        const sanitized: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(config)) {
            if (value !== undefined && value !== null) {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }
}

/**
 * Implémentation mockée du système CODA pour les tests
 * @private
 */
class MockCODASystemImpl implements MockCODASystem {
    /**
     * Simule l'évaluation d'exécution d'un signe
     * 
     * @param studentId - Identifiant de l'étudiant
     * @param signData - Données du signe à évaluer
     * @returns Évaluation simulée
     */
    public async evaluateSignExecution(studentId: string, signData: SignExecutionData): Promise<CODAEvaluation> {
        // Simulation d'un délai d'évaluation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        // Logique de simulation basée sur la complexité
        const baseAccuracy = this.calculateBaseAccuracy(signData.complexity);
        const randomVariation = (Math.random() - 0.5) * 0.2; // ±10%
        const accuracy = Math.max(0.2, Math.min(1.0, baseAccuracy + randomVariation));

        return {
            accuracy,
            feedback: this.generateFeedback(accuracy, signData.complexity),
            difficulty: signData.complexity
        };
    }

    /**
     * Calcule l'exactitude de base selon la complexité
     * @private
     */
    private calculateBaseAccuracy(complexity: string): number {
        const accuracyMap: Record<string, number> = {
            'easy': 0.85,
            'medium': 0.75,
            'hard': 0.65
        };
        return accuracyMap[complexity] ?? 0.75;
    }

    /**
     * Génère un feedback réaliste selon l'exactitude
     * @private
     */
    private generateFeedback(accuracy: number, complexity: string): string {
        if (accuracy > 0.9) {
            return 'Excellente exécution du signe !';
        } else if (accuracy > 0.8) {
            return 'Bonne exécution, petites améliorations possibles sur la forme de la main.';
        } else if (accuracy > 0.7) {
            return 'Exécution correcte, travaillez la fluidité du mouvement.';
        } else if (accuracy > 0.6) {
            return 'Exécution acceptable, attention à la position spatiale.';
        } else {
            return `Signe ${complexity} : améliorez la configuration et le mouvement.`;
        }
    }
}