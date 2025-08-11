//src/ai/pyramid/PyramideIAIntegration.test.ts
import { PyramideIACore } from '../PyramideIACore';
import { PyramidLevelType } from '../types';
import { ProcessingStatus, PyramidData } from '../interfaces/IPyramidDataFlow';
import { PyramidCache, CacheStrategy } from '../cache/PyramidCache';
import { ParallelProcessingManager } from '../processing/ParallelProcessingManager';
import { PyramidDataValidator } from '../validation/PyramidDataValidator';
import { AdvancedMetricsCollector, MetricType } from '../metrics/AdvancedMetricsCollector';
import { ValidationSchema, ValidationType, DataType } from '../validation/PyramidDataValidator';

// Cette suite de tests vérifie l'intégration entre les différents composants
// du système PyramideIA (cache, traitement parallèle, validateur de données, etc.)
describe('PyramideIA Integration Tests', () => {
    let pyramide: PyramideIACore;
    let cache: PyramidCache;
    let processingManager: ParallelProcessingManager;
    let validator: PyramidDataValidator;
    let metricsCollector: AdvancedMetricsCollector;

    beforeAll(async () => {
        // Initialiser tous les composants pour les tests d'intégration
        cache = new PyramidCache({
            maxSize: 100,
            ttl: 5000,
            strategy: CacheStrategy.LRU
        });

        processingManager = new ParallelProcessingManager({
            maxConcurrency: 2,
            priority: 'normal',
            executionMode: 'conservative'
        });

        validator = new PyramidDataValidator({
            validateAll: true,
            strictMode: false
        });

        metricsCollector = new AdvancedMetricsCollector({
            retentionPeriod: 3600000, // 1 heure
            maxPointsPerSeries: 100
        });

        // Initialiser la PyramideIA
        pyramide = new PyramideIACore();
        await pyramide.initialize();

        // Enregistrer des métriques pour le suivi des performances
        metricsCollector.registerMetric({
            name: 'pyramid.processing.time',
            description: 'Temps de traitement des données',
            type: MetricType.TIMER,
            unit: 'ms'
        });

        metricsCollector.registerMetric({
            name: 'pyramid.cache.hits',
            description: 'Nombre de hits du cache',
            type: MetricType.COUNTER
        });

        metricsCollector.registerMetric({
            name: 'pyramid.validation.errors',
            description: 'Nombre d\'erreurs de validation',
            type: MetricType.COUNTER
        });

        // Enregistrer un schéma de validation pour les tests
        validator.registerSchema(
            PyramidLevelType.PREPARATOR,
            {
                id: [
                    { type: ValidationType.REQUIRED },
                    { type: ValidationType.TYPE, dataType: DataType.STRING }
                ],
                timestamp: [
                    { type: ValidationType.REQUIRED },
                    { type: ValidationType.TYPE, dataType: DataType.NUMBER }
                ],
                source: [
                    { type: ValidationType.REQUIRED },
                    { type: ValidationType.TYPE, dataType: DataType.STRING },
                    { type: ValidationType.PATTERN, pattern: /^[a-z-]+$/ }
                ],
                version: [
                    { type: ValidationType.REQUIRED },
                    { type: ValidationType.TYPE, dataType: DataType.STRING },
                    { type: ValidationType.PATTERN, pattern: /^\d+\.\d+\.\d+$/ }
                ]
            },
            'both'
        );
    });

    afterAll(async () => {
        // Nettoyer les ressources
        cache.clear();
        await processingManager.shutdown();
        metricsCollector.shutdown();
    });

    describe('End-to-End Processing Flow with All Components', () => {
        test('should process data through the entire pipeline', async () => {
            // Données de test valides
            const testData: PyramidData = {
                id: 'test-integrated-flow',
                timestamp: Date.now(),
                source: 'integration-test',
                version: '1.0.0',
                content: 'This is a test of the integrated flow'
            };

            // 1. Valider les données
            const validationResult = await validator.validate(
                testData,
                PyramidLevelType.PREPARATOR,
                'up'
            );

            // Vérifier que les données sont valides
            expect(validationResult.valid).toBe(true);

            // 2. Vérifier si les données sont en cache
            let cachedResult = cache.get(
                testData,
                PyramidLevelType.COLLECTOR,
                'up'
            );

            // Le résultat ne devrait pas être en cache initialement
            expect(cachedResult).toBeNull();
            metricsCollector.recordMetric('pyramid.cache.hits', 0);

            // 3. Démarrer le timer pour mesurer les performances
            const timerId = metricsCollector.startTimer('pyramid.processing.time');

            // 4. Traiter les données en parallèle avec le ProcessingManager
            const processingResult = await processingManager.process(
                testData,
                PyramidLevelType.COLLECTOR,
                'up',
                async (data, level) => pyramide.processUp(data, level)
            );

            // 5. Stopper le timer et enregistrer le temps de traitement
            const processingTime = metricsCollector.stopTimer(timerId);
            expect(processingTime).toBeGreaterThan(0);

            // 6. Vérifier le résultat du traitement
            expect(processingResult.status).toBe(ProcessingStatus.SUCCESS);
            expect(processingResult.data).toHaveProperty('id', 'test-integrated-flow');
            expect(processingResult.metadata.processingPath.length).toBeGreaterThan(1);

            // 7. Mettre en cache le résultat
            cache.set(
                testData,
                PyramidLevelType.COLLECTOR,
                'up',
                processingResult
            );

            // 8. Vérifier que le résultat est maintenant en cache
            cachedResult = cache.get(
                testData,
                PyramidLevelType.COLLECTOR,
                'up'
            );

            expect(cachedResult).not.toBeNull();
            metricsCollector.recordMetric('pyramid.cache.hits', 1);

            // 9. Obtenir et vérifier les métriques
            const cacheMetrics = cache.getMetrics();
            expect(cacheMetrics.hits).toBe(1);
            expect(cacheMetrics.misses).toBe(1);

            const pyramidMetrics = pyramide.getPerformanceMetrics();
            expect(pyramidMetrics['upward.processingTime']).toBeGreaterThan(0);
        });

        test('should validate and reject invalid data', async () => {
            // Données de test invalides (pattern de version incorrect)
            const invalidData: PyramidData = {
                id: 'test-validation-error',
                timestamp: Date.now(),
                source: 'validation-test',
                version: 'invalid-version', // Ne correspond pas au pattern \d+\.\d+\.\d+
                content: 'This data should be rejected by validation'
            };

            // 1. Valider les données
            const validationResult = await validator.validate(
                invalidData,
                PyramidLevelType.PREPARATOR,
                'up'
            );

            // Les données devraient être invalides
            expect(validationResult.valid).toBe(false);
            expect(validationResult.errors.length).toBeGreaterThan(0);
            expect(validationResult.errors[0].field).toBe('version');

            // Enregistrer l'erreur de validation
            metricsCollector.recordMetric('pyramid.validation.errors', 1, {
                level: PyramidLevelType.PREPARATOR,
                field: 'version'
            });

            // Dans un flux réel, on arrêterait le traitement ici
            // Mais pour le test, on va quand même essayer de traiter les données
            // pour vérifier que le système est robuste face aux données invalides

            // 2. Traiter les données malgré la validation échouée
            const processingResult = await processingManager.process(
                invalidData,
                PyramidLevelType.COLLECTOR,
                'up',
                async (data, level) => pyramide.processUp(data, level)
            );

            // 3. Vérifier que le traitement a quand même réussi (aucune validation à ce niveau)
            expect(processingResult.status).toBe(ProcessingStatus.SUCCESS);

            // 4. Mais ces données ne devraient pas être mises en cache car invalides
            cache.set(
                invalidData,
                PyramidLevelType.COLLECTOR,
                'up',
                processingResult
            );

            // 5. Obtenir et vérifier les métriques
            const validationMetrics = metricsCollector.getMetricValues(
                'pyramid.validation.errors',
                { level: PyramidLevelType.PREPARATOR }
            );
            expect(validationMetrics.length).toBeGreaterThan(0);
        });

        test('should process batch data efficiently', async () => {
            // Préparer un lot de données à traiter
            const batchData = Array.from({ length: 5 }).map((_, index) => ({
                id: `batch-item-${index}`,
                timestamp: Date.now(),
                source: 'batch-test',
                version: '1.0.0',
                content: `Batch item content ${index}`
            }));

            // 1. Préparer les tâches pour le traitement par lots
            const batchTasks = batchData.map(data => ({
                data,
                level: PyramidLevelType.COLLECTOR,
                direction: 'up' as const
            }));

            // 2. Démarrer le timer pour mesurer les performances
            const timerId = metricsCollector.startTimer('pyramid.processing.time');

            // 3. Traiter le lot de données
            const batchResult = await processingManager.processBatch(
                batchTasks,
                async (data, level) => pyramide.processUp(data, level)
            );

            // 4. Stopper le timer et enregistrer le temps de traitement
            const processingTime = metricsCollector.stopTimer(timerId, {
                batchSize: batchData.length
            });

            // 5. Vérifier les résultats du traitement par lots
            expect(batchResult.results.length).toBe(batchData.length);
            expect(batchResult.successCount).toBe(batchData.length);
            expect(batchResult.failureCount).toBe(0);

            // 6. Vérifier que le temps moyen par tâche est inférieur au temps total
            // (bénéfice du traitement parallèle)
            expect(batchResult.averageTaskTime).toBeLessThan(processingTime);

            // 7. Mettre tous les résultats en cache
            batchResult.results.forEach((result, index) => {
                cache.set(
                    batchData[index],
                    PyramidLevelType.COLLECTOR,
                    'up',
                    result
                );
            });

            // 8. Vérifier les métriques du cache
            const cacheMetrics = cache.getMetrics();
            expect(cacheMetrics.utilization).toBeGreaterThan(0);
        });

        test('should detect and handle errors gracefully', async () => {
            // Données de test qui provoqueront une erreur
            const errorData: PyramidData = {
                id: 'error-test',
                timestamp: Date.now(),
                source: 'error-source',
                version: '1.0.0',
                // Cette propriété provoquera une erreur lors du traitement
                triggerError: true
            };

            // Créer un mock du processUp qui échoue quand triggerError est true
            const originalProcessUp = pyramide.processUp;
            pyramide.processUp = jest.fn().mockImplementation(async (data, level) => {
                if ((data as any).triggerError) {
                    throw new Error('Simulated processing error');
                }
                return originalProcessUp.call(pyramide, data, level);
            });

            // 1. Valider les données (elles sont valides selon notre schéma)
            const validationResult = await validator.validate(
                errorData,
                PyramidLevelType.PREPARATOR,
                'up'
            );

            expect(validationResult.valid).toBe(true);

            // 2. Traiter les données qui provoqueront une erreur
            try {
                const processingResult = await processingManager.process(
                    errorData,
                    PyramidLevelType.COLLECTOR,
                    'up',
                    async (data, level) => pyramide.processUp(data, level)
                );

                // Le ProcessingManager devrait capturer l'erreur et retourner un statut ERROR
                expect(processingResult.status).toBe(ProcessingStatus.ERROR);

            } catch (error) {
                // Si l'erreur remonte jusqu'ici, c'est que le système n'a pas
                // correctement géré l'erreur
                fail('Error should have been handled by the processing manager');
            }

            // 3. Enregistrer l'erreur dans les métriques
            metricsCollector.recordMetric('pyramid.errors', 1, {
                type: 'processing',
                level: PyramidLevelType.COLLECTOR
            });

            // 4. Restaurer la fonction originale
            pyramide.processUp = originalProcessUp;
        });
    });

    describe('Data Flow with Cache', () => {
        test('should use cached results when available', async () => {
            // Données de test
            const testData: PyramidData = {
                id: 'cache-test',
                timestamp: Date.now(),
                source: 'cache-source',
                version: '1.0.0',
                content: 'Testing cache functionality'
            };

            // 1. Traiter les données une première fois
            const firstResult = await pyramide.processUp(
                testData,
                PyramidLevelType.COLLECTOR
            );

            // 2. Mettre le résultat en cache
            cache.set(
                testData,
                PyramidLevelType.COLLECTOR,
                'up',
                firstResult
            );

            // 3. Vérifier que le résultat est en cache
            const cachedResult = cache.get(
                testData,
                PyramidLevelType.COLLECTOR,
                'up'
            );

            expect(cachedResult).not.toBeNull();
            expect(cachedResult?.data.id).toBe('cache-test');

            // 4. Mesurer le temps de traitement avec cache
            const timerId = metricsCollector.startTimer('pyramid.cached.request.time');

            // 5. Traiter les mêmes données à nouveau
            const secondResult = await (async () => {
                // Vérifier d'abord si les données sont en cache
                const cached = cache.get(
                    testData,
                    PyramidLevelType.COLLECTOR,
                    'up'
                );

                if (cached) {
                    metricsCollector.recordMetric('pyramid.cache.hits', 1);
                    return cached;
                }

                // Sinon, traiter normalement
                const result = await pyramide.processUp(
                    testData,
                    PyramidLevelType.COLLECTOR
                );

                // Et mettre en cache pour la prochaine fois
                cache.set(
                    testData,
                    PyramidLevelType.COLLECTOR,
                    'up',
                    result
                );

                return result;
            })();

            const cachedProcessingTime = metricsCollector.stopTimer(timerId);

            // 6. Vérifier que le résultat est le même
            expect(secondResult).toEqual(cachedResult);

            // 7. Vérifier que le traitement avec cache est plus rapide
            // Note: This assumes firstResult processing time is recorded elsewhere
            // In a real system, we would compare with non-cached processing time
            expect(cachedProcessingTime).toBeLessThan(100); // Should be very fast

            // 8. Vérifier les métriques du cache
            const cacheMetrics = cache.getMetrics();
            expect(cacheMetrics.hits).toBeGreaterThan(1);
        });

        test('should handle cache eviction', async () => {
            // Remplir le cache avec beaucoup de données pour forcer l'éviction
            for (let i = 0; i < 150; i++) {
                const data: PyramidData = {
                    id: `eviction-test-${i}`,
                    timestamp: Date.now(),
                    source: 'eviction-source',
                    version: '1.0.0',
                    content: `Testing cache eviction ${i}`
                };

                const result = await pyramide.processUp(
                    data,
                    PyramidLevelType.COLLECTOR
                );

                cache.set(
                    data,
                    PyramidLevelType.COLLECTOR,
                    'up',
                    result
                );
            }

            // Vérifier que des évictions ont eu lieu
            const cacheMetrics = cache.getMetrics();
            expect(cacheMetrics.evictions).toBeGreaterThan(0);
        });
    });

    describe('Performance and Load Testing', () => {
        test('should handle multiple concurrent requests', async () => {
            // Créer de nombreuses requêtes concurrentes
            const concurrentCount = 10;
            const requests = Array.from({ length: concurrentCount }).map((_, index) => ({
                id: `concurrent-${index}`,
                timestamp: Date.now(),
                source: 'concurrent-source',
                version: '1.0.0',
                content: `Concurrent request ${index}`
            }));

            // Enregistrer une métrique pour le suivi de concurrence
            metricsCollector.registerMetric({
                name: 'pyramid.concurrent.requests',
                description: 'Nombre de requêtes concurrentes',
                type: MetricType.GAUGE
            });

            metricsCollector.recordMetric('pyramid.concurrent.requests', concurrentCount);

            // Exécuter toutes les requêtes en parallèle
            const startTime = Date.now();

            const results = await Promise.all(
                requests.map(data =>
                    processingManager.process(
                        data,
                        PyramidLevelType.COLLECTOR,
                        'up',
                        async (d, level) => pyramide.processUp(d, level)
                    )
                )
            );

            const totalTime = Date.now() - startTime;

            // Vérifier que toutes les requêtes ont réussi
            expect(results.length).toBe(concurrentCount);
            expect(results.every(r => r.status === ProcessingStatus.SUCCESS)).toBe(true);

            // Enregistrer des métriques de performance
            metricsCollector.recordMetric('pyramid.concurrent.total.time', totalTime);
            metricsCollector.recordMetric('pyramid.concurrent.avg.time', totalTime / concurrentCount);

            // Vérifier les métriques du ProcessingManager
            const processingMetrics = processingManager.getMetrics();
            expect(processingMetrics.totalTasks).toBeGreaterThan(concurrentCount);
            expect(processingMetrics.successfulTasks).toBeGreaterThan(concurrentCount);

            // Le temps moyen devrait être inférieur au temps total divisé par le nombre de requêtes
            // car certaines requêtes sont exécutées en parallèle
            expect(processingMetrics.averageProcessingTime).toBeLessThan(totalTime);
        });
    });
});