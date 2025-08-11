import { PyramideIACore } from '@ai/pyramid/PyramideIACore';
import { PyramidLevelType, ProcessingStatus, PyramidData } from '@ai/pyramid/types';
import { Logger } from '@ai/utils/Logger';
import { PyramidLevelFactory } from '@ai/pyramid/PyramidLevelFactory';

// Types pour les mocks
interface MockLogger {
    info: jest.Mock;
    debug: jest.Mock;
    warn: jest.Mock;
    error: jest.Mock;
}

interface MockLevelFactory {
    createLevel: jest.Mock;
}

interface PyramidLevel {
    level: PyramidLevelType;
    process: jest.Mock;
    getMetrics: jest.Mock;
}

// Interface pour les données de test qui respecte PyramidData
interface PyramidTestData extends PyramidData {
    id: string;
    timestamp: number;
    sourceLevel: PyramidLevelType;
    payload: Record<string, unknown>;
    source: string; // Obligatoire pour correspondre à PyramidData
    version: string; // Obligatoire pour correspondre à PyramidData
    content?: string;
    processed?: boolean;
}

// Mocks
jest.mock('@ai/utils/Logger', () => {
    return {
        Logger: jest.fn().mockImplementation(() => ({
            info: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            error: jest.fn()
        }))
    };
});

jest.mock('@ai/pyramid/PyramidLevelFactory', () => {
    return {
        PyramidLevelFactory: jest.fn().mockImplementation(() => ({
            createLevel: jest.fn().mockImplementation((level: PyramidLevelType) => ({
                level,
                process: jest.fn().mockImplementation((data: PyramidData) => ({ ...data, processed: true })),
                getMetrics: jest.fn().mockReturnValue({ processedItems: 0 })
            }))
        }))
    };
});

describe('PyramideIACore', () => {
    let pyramideIACore: PyramideIACore;
    let mockLogger: MockLogger;
    let mockLevelFactory: MockLevelFactory;

    beforeEach(() => {
        jest.clearAllMocks();
        pyramideIACore = new PyramideIACore();

        // Accès aux propriétés internes pour les tests
        const pyramideCoreInternals = pyramideIACore as unknown as {
            logger: MockLogger;
            levelFactory: MockLevelFactory;
            levels: Map<PyramidLevelType, PyramidLevel>;
            getNextLevelUp(level: PyramidLevelType): PyramidLevelType | null;
            getNextLevelDown(level: PyramidLevelType): PyramidLevelType | null;
            updateMetrics(direction: string, processingTime: number, success: boolean): void;
        };

        mockLogger = pyramideCoreInternals.logger;
        mockLevelFactory = pyramideCoreInternals.levelFactory;
    });

    describe('Initialization', () => {
        test('should initialize properly', async () => {
            await pyramideIACore.initialize();

            // Vérifier que le logger a été appelé
            expect(Logger).toHaveBeenCalledWith('PyramideIACore');

            // Vérifier que la factory a été initialisée
            expect(PyramidLevelFactory).toHaveBeenCalled();

            // Vérifier que le logging d'initialisation a été effectué
            expect(mockLogger.info).toHaveBeenCalledWith('Initializing PyramideIACore...');
            expect(mockLogger.info).toHaveBeenCalledWith('PyramideIACore initialized successfully');
        });

        test('should handle initialization errors', async () => {
            // Simuler une erreur dans l'initialisation
            mockLevelFactory.createLevel.mockImplementationOnce(() => {
                throw new Error('Initialization error');
            });

            // L'initialisation devrait échouer
            await expect(pyramideIACore.initialize()).rejects.toThrow('Initialization error');

            // Vérifier le logging d'erreur
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('Data Processing', () => {
        beforeEach(async () => {
            await pyramideIACore.initialize();
        });

        test('should process data upward correctly', async () => {
            // Données de test
            const testData: PyramidTestData = {
                id: 'test-data',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.COLLECTOR,
                payload: {
                    content: 'Hello, World!'
                },
                source: 'test',
                version: '1.0'
            };

            // Traiter les données
            const result = await pyramideIACore.processUp(
                testData,
                PyramidLevelType.SPECTATOR
            );

            // Vérifier le résultat
            expect(result.status).toBe(ProcessingStatus.SUCCESS);
            expect(result.data).toMatchObject({
                ...testData,
                processed: true
            });
            expect(result.metadata).toBeDefined();
            expect(result.metadata.processingPath).toContain(PyramidLevelType.SPECTATOR);
        });

        test('should process data downward correctly', async () => {
            // Données de test
            const testData: PyramidTestData = {
                id: 'test-data-down',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.MENTOR,
                payload: {
                    content: 'Processing Downward'
                },
                source: 'test',
                version: '1.0'
            };

            // Traiter les données
            const result = await pyramideIACore.processDown(
                testData,
                PyramidLevelType.MENTOR
            );

            // Vérifier le résultat
            expect(result.status).toBe(ProcessingStatus.SUCCESS);
            expect(result.data).toMatchObject({
                ...testData,
                processed: true
            });
            expect(result.metadata).toBeDefined();
            expect(result.metadata.processingPath).toContain(PyramidLevelType.MENTOR);
        });

        test('should handle errors in upward processing', async () => {
            // Accéder à la propriété interne levels
            const pyramideCoreInternals = pyramideIACore as unknown as {
                levels: Map<PyramidLevelType, PyramidLevel>;
            };

            // Simuler une erreur dans le traitement
            const mockLevel: PyramidLevel = {
                level: PyramidLevelType.SPECTATOR,
                process: jest.fn().mockImplementationOnce(() => {
                    throw new Error('Processing error');
                }),
                getMetrics: jest.fn().mockReturnValue({ processedItems: 0 })
            };

            // Remplacer le niveau dans la map des niveaux
            pyramideCoreInternals.levels.set(PyramidLevelType.SPECTATOR, mockLevel);

            // Données de test
            const testData: PyramidTestData = {
                id: 'test-data-error',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.COLLECTOR,
                payload: {
                    content: 'Error Test'
                },
                source: 'test',
                version: '1.0'
            };

            // Traiter les données
            const result = await pyramideIACore.processUp(
                testData,
                PyramidLevelType.SPECTATOR
            );

            // Vérifier que le statut est ERROR
            expect(result.status).toBe(ProcessingStatus.ERROR);
            expect(result.metadata.error).toBe('Processing error');

            // Vérifier que les données originales sont retournées
            expect(result.data).toEqual(testData);
        });

        test('should handle missing level processors', async () => {
            // Accéder à la propriété interne levels
            const pyramideCoreInternals = pyramideIACore as unknown as {
                levels: Map<PyramidLevelType, PyramidLevel>;
            };

            // Supprimer un niveau de la map
            pyramideCoreInternals.levels.delete(PyramidLevelType.SPECTATOR);

            // Données de test
            const testData: PyramidTestData = {
                id: 'test-data-missing-level',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.COLLECTOR,
                payload: {
                    content: 'Missing Level Test'
                },
                source: 'test',
                version: '1.0'
            };

            // Traiter les données
            const result = await pyramideIACore.processUp(
                testData,
                PyramidLevelType.SPECTATOR
            );

            // Vérifier que le statut est ERROR
            expect(result.status).toBe(ProcessingStatus.ERROR);
            expect(result.metadata.error).toContain('Level processor not found');

            // Vérifier que les données originales sont retournées
            expect(result.data).toEqual(testData);
        });
    });

    describe('Level Navigation', () => {
        beforeEach(async () => {
            await pyramideIACore.initialize();
        });

        test('getNextLevelUp should return the correct next level', () => {
            // Accéder à la méthode privée getNextLevelUp
            const pyramideCoreInternals = pyramideIACore as unknown as {
                getNextLevelUp(level: PyramidLevelType): PyramidLevelType | null;
            };

            // Tester la navigation vers le haut
            const getNextLevelUp = pyramideCoreInternals.getNextLevelUp.bind(pyramideCoreInternals);

            // Les niveaux doivent être organisés hiérarchiquement
            expect(getNextLevelUp(PyramidLevelType.COLLECTOR)).toBe(PyramidLevelType.PREPARATOR);
            expect(getNextLevelUp(PyramidLevelType.PREPARATOR)).toBe(PyramidLevelType.SPECTATOR);

            // Le dernier niveau ne devrait pas avoir de niveau supérieur
            expect(getNextLevelUp(PyramidLevelType.HISTORIAN)).toBeNull();
        });

        test('getNextLevelDown should return the correct next level', () => {
            // Accéder à la méthode privée getNextLevelDown
            const pyramideCoreInternals = pyramideIACore as unknown as {
                getNextLevelDown(level: PyramidLevelType): PyramidLevelType | null;
            };

            // Tester la navigation vers le bas
            const getNextLevelDown = pyramideCoreInternals.getNextLevelDown.bind(pyramideCoreInternals);

            // Les niveaux doivent être organisés hiérarchiquement
            expect(getNextLevelDown(PyramidLevelType.PREPARATOR)).toBe(PyramidLevelType.COLLECTOR);
            expect(getNextLevelDown(PyramidLevelType.SPECTATOR)).toBe(PyramidLevelType.PREPARATOR);

            // Le premier niveau ne devrait pas avoir de niveau inférieur
            expect(getNextLevelDown(PyramidLevelType.COLLECTOR)).toBeNull();
        });
    });

    describe('Performance Metrics', () => {
        beforeEach(async () => {
            await pyramideIACore.initialize();
        });

        test('should update metrics correctly', () => {
            // Accéder à la méthode privée updateMetrics
            const pyramideCoreInternals = pyramideIACore as unknown as {
                updateMetrics(direction: string, processingTime: number, success: boolean): void;
            };

            // Tester la mise à jour des métriques
            const updateMetrics = pyramideCoreInternals.updateMetrics.bind(pyramideCoreInternals);

            // Simuler des mises à jour de métriques
            updateMetrics('upward', 100, true);
            updateMetrics('upward', 200, true);
            updateMetrics('downward', 150, false);

            // Vérifier les métriques
            const metrics = pyramideIACore.getPerformanceMetrics();

            // Les métriques devraient être mises à jour avec une moyenne mobile
            expect(metrics['upward.processingTime']).toBeGreaterThan(0);
            expect(metrics['upward.successRate']).toBeGreaterThan(0);
            expect(metrics['downward.processingTime']).toBeGreaterThan(0);
            expect(metrics['downward.successRate']).toBeLessThan(1);
        });

        test('getPerformanceMetrics should return the correct format', () => {
            // Vérifier le format des métriques
            const metrics = pyramideIACore.getPerformanceMetrics();

            // Vérifier que toutes les métriques attendues sont présentes
            expect(metrics).toHaveProperty('upward.processingTime');
            expect(metrics).toHaveProperty('upward.successRate');
            expect(metrics).toHaveProperty('upward.throughput');
            expect(metrics).toHaveProperty('downward.processingTime');
            expect(metrics).toHaveProperty('downward.successRate');
            expect(metrics).toHaveProperty('downward.throughput');
        });
    });

    describe('Level Management', () => {
        beforeEach(async () => {
            await pyramideIACore.initialize();
        });

        test('isLevelAvailable should correctly check level availability', () => {
            // Accéder à la propriété interne levels
            const pyramideCoreInternals = pyramideIACore as unknown as {
                levels: Map<PyramidLevelType, PyramidLevel>;
            };

            // Tous les niveaux devraient être disponibles après initialisation
            for (const level of Object.values(PyramidLevelType)) {
                expect(pyramideIACore.isLevelAvailable(level)).toBe(true);
            }

            // Simuler un niveau indisponible
            pyramideCoreInternals.levels.delete(PyramidLevelType.EXPLORER);
            expect(pyramideIACore.isLevelAvailable(PyramidLevelType.EXPLORER)).toBe(false);
        });

        test('getActiveLevels should return all active levels', () => {
            // Accéder à la propriété interne levels
            const pyramideCoreInternals = pyramideIACore as unknown as {
                levels: Map<PyramidLevelType, PyramidLevel>;
            };

            // Tous les niveaux devraient être actifs après initialisation
            const activeLevels = pyramideIACore.getActiveLevels();

            for (const level of Object.values(PyramidLevelType)) {
                expect(activeLevels).toContain(level);
            }

            // Simuler un niveau inactif
            pyramideCoreInternals.levels.delete(PyramidLevelType.EXPLORER);

            const updatedActiveLevels = pyramideIACore.getActiveLevels();
            expect(updatedActiveLevels).not.toContain(PyramidLevelType.EXPLORER);
        });
    });

    describe('Edge Cases', () => {
        beforeEach(async () => {
            await pyramideIACore.initialize();
        });

        test('should handle empty data', async () => {
            // Données vides mais respectant l'interface PyramidData
            const emptyData: PyramidTestData = {
                id: '',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.COLLECTOR,
                payload: {},
                source: '',
                version: ''
            };

            // Traiter les données
            const result = await pyramideIACore.processUp(
                emptyData,
                PyramidLevelType.SPECTATOR
            );

            // La validation devrait réussir, car nous n'avons pas de validation de données
            expect(result.status).toBe(ProcessingStatus.SUCCESS);
        });

        test('should handle invalid level types', async () => {
            // Données de test
            const testData: PyramidTestData = {
                id: 'test-invalid-level',
                timestamp: Date.now(),
                sourceLevel: PyramidLevelType.COLLECTOR,
                payload: {},
                source: 'test',
                version: '1.0'
            };

            // Simuler un niveau invalide
            const invalidLevel = 'INVALID_LEVEL' as unknown as PyramidLevelType;

            // Traiter les données
            const result = await pyramideIACore.processUp(
                testData,
                invalidLevel
            );

            // Vérifier que le statut est ERROR
            expect(result.status).toBe(ProcessingStatus.ERROR);
            expect(result.metadata.error).toContain('Level processor not found');
        });
    });
});