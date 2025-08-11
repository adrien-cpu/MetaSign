// src/ai/systems/expressions/situations/educational/special_needs/adaptations/examples/BasicUsageExample.ts
import { PredictionOptions } from '../AdapterTypes';
import { AdaptationExecutionSystem } from '../AdaptationExecutionSystem';
import { SessionData } from '../types';

/**
 * Exemple d'utilisation du système d'adaptation amélioré
 */
export class AdaptationExample {
    /**
     * Démontre l'utilisation de base du système d'adaptation
     */
    static async demonstrateBasicUsage(): Promise<void> {
        console.log('Starting basic adaptation example...');

        // 1. Créer des options de prédiction
        const predictionOptions: PredictionOptions = {
            feature_type: 'PREDICTIVE',
            prediction_focus: 'FATIGUE_MANAGEMENT'
        };

        // 2. Préparer les données de session
        const sessionData: SessionData = {
            sessionId: `session-${Date.now()}`,
            userId: 'user-123',
            duration: 45, // minutes
            intensity: 'MODERATE',
            challenges: ['visual_processing', 'attention_span'],
            realTimeData: true,
            learner: {
                visual_needs: 'high_contrast',
                attention_needs: 'frequent_breaks',
                cognitive_needs: 'simplified_content'
            },
            environment: {
                lighting: 'bright',
                noise_level: 'moderate',
                layout: 'open_space'
            },
            student: {
                id: 'student-123',
                fatigue_history: [
                    { timestamp: new Date(Date.now() - 86400000).toISOString(), level: 'LOW' },
                    { timestamp: new Date(Date.now() - 43200000).toISOString(), level: 'MEDIUM' },
                    { timestamp: new Date(Date.now() - 21600000).toISOString(), level: 'MEDIUM' }
                ],
                known_patterns: {
                    fatigue_onset: 'GRADUAL',
                    recovery_time: 'MODERATE',
                    peak_performance_window: 'MORNING'
                }
            },
            progressionHistory: [
                { phase: 'introduction', performance: 85 },
                { phase: 'practice', performance: 78 },
                { phase: 'application', performance: 82 }
            ]
        };

        // 3. Exécuter l'adaptation avec des options d'exécution
        try {
            console.log('Executing adaptation...');

            const result = await AdaptationExecutionSystem.executeAdaptation(
                predictionOptions,
                sessionData,
                {
                    timeout: 10000, // 10 secondes
                    retryCount: 2,
                    collectPerformanceMetrics: true,
                    priority: 7, // Priorité assez élevée
                    adapterCreationOptions: {
                        useDefaultAsFallback: true,
                        debugMode: true
                    }
                }
            );

            // 4. Traiter le résultat
            console.log('Adaptation result:');
            console.log(`- Success: ${result.success}`);
            console.log(`- Message: ${result.message}`);

            if (result.performanceMetrics) {
                console.log('Performance metrics:');
                console.log(`- Total execution time: ${result.performanceMetrics.totalExecutionTime}ms`);
                console.log(`- Retry count: ${result.performanceMetrics.retryCount}`);
            }

            if (result.traceInfo) {
                console.log('Execution trace:');
                result.traceInfo.log.forEach(entry => {
                    console.log(`- [${entry.level}] ${entry.message}`);
                });
            }

            // 5. Utiliser les données du résultat (si disponibles)
            if (result.data) {
                console.log('Adaptation data available');
                // Traiter les données spécifiques selon le cas d'utilisation
            }
        } catch (error) {
            console.error('Error during adaptation execution:', error);
        } finally {
            // Nettoyage (optionnel)
            console.log('Cleaning up resources...');
            AdaptationExecutionSystem.cleanup();
        }
    }

    /**
     * Point d'entrée de l'exemple
     */
    static async run(): Promise<void> {
        try {
            await this.demonstrateBasicUsage();
            console.log('Example completed successfully');
        } catch (error) {
            console.error('Example failed:', error);
        }
    }
}

// Pour exécuter l'exemple directement
if (require.main === module) {
    AdaptationExample.run()
        .then(() => console.log('Example execution completed'))
        .catch(error => console.error('Unhandled error:', error));
}