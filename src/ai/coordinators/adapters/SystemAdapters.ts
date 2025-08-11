/**
 * @file: src/ai/coordinators/adapters/SystemAdapters.ts
 * 
 * Adaptateurs pour les systèmes externes.
 * Fournit des adaptateurs pour les différents systèmes utilisés par l'orchestrateur,
 * permettant d'uniformiser leur utilisation et de gérer les incompatibilités.
 */

import { Logger } from '@ai/utils/Logger';
import { SystemeControleEthique } from '@ai/ethics/core/SystemeControleEthique';
import { SystemeExpressions } from '@ai/systems/SystemeExpressions';
import { IACore } from '@ai/base/IACore';
import { GestionVariantesDiatopiques } from '@ai/cultural/GestionVariantesDiatopiques';
import { ValidationCollaborative } from '@ai/validation/ValidationCollaborative';
import { GestionEspaceSpatial } from '@ai/spatial/GestionEspaceSpatial';
import { LearningSystem } from '@ai/learning/LearningSystem';

/**
 * Interface commune pour les instances de systèmes
 */
export interface SystemInstance {
    /** Identifiant du système */
    id: string;
    /** Nom du système */
    name: string;
    /** Instance du système */
    instance: unknown;
    /** Initialisation du système */
    initialize?: () => Promise<void>;
    /** Arrêt du système */
    shutdown?: () => Promise<void>;
}

/**
 * Interface pour les options du service d'adaptateurs
 */
export interface SystemAdaptersOptions {
    /** Mode d'initialisation */
    initMode?: 'parallel' | 'sequential';
    /** Nombre maximal de tentatives d'initialisation */
    maxInitAttempts?: number;
    /** Délai entre les tentatives en millisecondes */
    retryDelay?: number;
    /** Activer la récupération automatique en cas d'échec */
    enableAutoRecovery?: boolean;
}

/**
 * Service d'adaptateurs pour les systèmes externes
 * 
 * Fournit une interface unifiée pour l'initialisation, l'accès et la gestion
 * des systèmes externes utilisés par l'orchestrateur.
 */
export class SystemAdapters {
    private readonly logger = Logger.getInstance('SystemAdapters');
    private readonly systems = new Map<string, SystemInstance>();
    private readonly options: Required<SystemAdaptersOptions>;

    /**
     * Crée une nouvelle instance du service d'adaptateurs
     * @param options Options de configuration
     */
    constructor(options: SystemAdaptersOptions = {}) {
        // Options par défaut
        this.options = {
            initMode: 'parallel',
            maxInitAttempts: 3,
            retryDelay: 2000,
            enableAutoRecovery: true,
            ...options
        };

        this.logger.debug('SystemAdapters initialized', { options: this.options });
    }

    /**
     * Initialise tous les systèmes nécessaires
     * @returns Map des instances de systèmes initialisées
     */
    public async initializeSystems(): Promise<Map<string, SystemInstance>> {
        this.logger.info('Initializing all systems');

        // Créer les adaptateurs pour tous les systèmes
        await this.createAllAdapters();

        // Initialiser les systèmes selon le mode d'initialisation
        if (this.options.initMode === 'parallel') {
            await this.initializeSystemsInParallel();
        } else {
            await this.initializeSystemsSequentially();
        }

        this.logger.info('All systems initialized successfully', {
            systemCount: this.systems.size
        });

        return this.systems;
    }

    /**
     * Crée les adaptateurs pour tous les systèmes
     */
    private async createAllAdapters(): Promise<void> {
        // Système d'éthique
        this.systems.set('ethics', {
            id: 'ethics',
            name: 'SystemeControleEthique',
            instance: await this.createEthicsSystem(),
            initialize: async () => {
                const ethicsSystem = this.systems.get('ethics')?.instance as SystemeControleEthique;
                if (ethicsSystem.initialize) {
                    await ethicsSystem.initialize();
                }
            },
            shutdown: async () => {
                const ethicsSystem = this.systems.get('ethics')?.instance as SystemeControleEthique;
                if (ethicsSystem.shutdown) {
                    await ethicsSystem.shutdown();
                }
            }
        });

        // Noyau IA
        this.systems.set('iaCore', {
            id: 'iaCore',
            name: 'IACore',
            instance: await this.createIACore(),
            initialize: async () => {
                const iaCore = this.systems.get('iaCore')?.instance as IACore;
                if (iaCore.initialize) {
                    await iaCore.initialize();
                }
            },
            shutdown: async () => {
                const iaCore = this.systems.get('iaCore')?.instance as IACore;
                if (iaCore.shutdown) {
                    await iaCore.shutdown();
                }
            }
        });

        // Système d'expressions
        this.systems.set('expressions', {
            id: 'expressions',
            name: 'SystemeExpressions',
            instance: await this.createExpressionsSystem(),
            initialize: async () => {
                const expressionsSystem = this.systems.get('expressions')?.instance as SystemeExpressions;
                if (expressionsSystem.initialize) {
                    await expressionsSystem.initialize();
                }
            },
            shutdown: async () => {
                const expressionsSystem = this.systems.get('expressions')?.instance as SystemeExpressions;
                if (expressionsSystem.shutdown) {
                    await expressionsSystem.shutdown();
                }
            }
        });

        // Gestion des variantes dialectales
        this.systems.set('dialectSystem', {
            id: 'dialectSystem',
            name: 'GestionVariantesDiatopiques',
            instance: await this.createDialectSystem(),
            initialize: async () => {
                const dialectSystem = this.systems.get('dialectSystem')?.instance as GestionVariantesDiatopiques;
                if (dialectSystem.initialize) {
                    await dialectSystem.initialize();
                }
            },
            shutdown: async () => {
                const dialectSystem = this.systems.get('dialectSystem')?.instance as GestionVariantesDiatopiques;
                if (dialectSystem.shutdown) {
                    await dialectSystem.shutdown();
                }
            }
        });

        // Système de validation collaborative
        this.systems.set('validationSystem', {
            id: 'validationSystem',
            name: 'ValidationCollaborative',
            instance: await this.createValidationSystem(),
            initialize: async () => {
                const validationSystem = this.systems.get('validationSystem')?.instance as ValidationCollaborative;
                if (validationSystem.initialize) {
                    await validationSystem.initialize();
                }
            },
            shutdown: async () => {
                const validationSystem = this.systems.get('validationSystem')?.instance as ValidationCollaborative;
                if (validationSystem.shutdown) {
                    await validationSystem.shutdown();
                }
            }
        });

        // Système spatial
        this.systems.set('spatialSystem', {
            id: 'spatialSystem',
            name: 'GestionEspaceSpatial',
            instance: await this.createSpatialSystem(),
            initialize: async () => {
                const spatialSystem = this.systems.get('spatialSystem')?.instance as GestionEspaceSpatial;
                if (spatialSystem.initialize) {
                    await spatialSystem.initialize();
                }
            },
            shutdown: async () => {
                const spatialSystem = this.systems.get('spatialSystem')?.instance as GestionEspaceSpatial;
                if (spatialSystem.shutdown) {
                    await spatialSystem.shutdown();
                }
            }
        });

        // Système d'apprentissage
        try {
            const learningSystem = await this.createLearningSystem();
            if (learningSystem) {
                this.systems.set('learningSystem', {
                    id: 'learningSystem',
                    name: 'LearningSystem',
                    instance: learningSystem,
                    initialize: async () => {
                        const system = this.systems.get('learningSystem')?.instance as LearningSystem;
                        if (system.initialize) {
                            await system.initialize();
                        }
                    },
                    shutdown: async () => {
                        const system = this.systems.get('learningSystem')?.instance as LearningSystem;
                        if (system.shutdown) {
                            await system.shutdown();
                        }
                    }
                });
            }
        } catch (error) {
            this.logger.warn('Learning system not available', {
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Initialise les systèmes en parallèle
     */
    private async initializeSystemsInParallel(): Promise<void> {
        const initPromises: Promise<void>[] = [];

        for (const [id, system] of this.systems.entries()) {
            if (system.initialize) {
                const promise = this.initializeSystemWithRetry(id, system);
                initPromises.push(promise);
            }
        }

        await Promise.all(initPromises);
    }

    /**
     * Initialise les systèmes séquentiellement
     */
    private async initializeSystemsSequentially(): Promise<void> {
        const systems = Array.from(this.systems.entries());

        for (const [id, system] of systems) {
            if (system.initialize) {
                await this.initializeSystemWithRetry(id, system);
            }
        }
    }

    /**
     * Initialise un système avec gestion des tentatives
     * @param id Identifiant du système
     * @param system Instance du système
     */
    private async initializeSystemWithRetry(id: string, system: SystemInstance): Promise<void> {
        let attempts = 0;
        let success = false;

        while (attempts < this.options.maxInitAttempts && !success) {
            attempts++;

            try {
                this.logger.debug(`Initializing system: ${id} (Attempt ${attempts}/${this.options.maxInitAttempts})`);

                if (system.initialize) {
                    await system.initialize();
                }

                success = true;
                this.logger.info(`System initialized successfully: ${id}`);
            } catch (error) {
                this.logger.error(`Failed to initialize system: ${id}`, {
                    error: error instanceof Error ? error.message : String(error),
                    attempt: attempts,
                    maxAttempts: this.options.maxInitAttempts
                });

                if (attempts < this.options.maxInitAttempts) {
                    this.logger.debug(`Retrying initialization of ${id} in ${this.options.retryDelay}ms`);
                    await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
                } else {
                    throw new Error(`Failed to initialize system: ${id} after ${attempts} attempts`);
                }
            }
        }
    }

    /**
     * Crée une instance du système d'éthique
     * @returns Instance du système d'éthique
     */
    private async createEthicsSystem(): Promise<SystemeControleEthique> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (SystemeControleEthique.getInstance) {
                return SystemeControleEthique.getInstance({
                    strictLevel: 'standard',
                    enableContinuousMonitoring: true,
                    loggingEnabled: true,
                    autoUpdate: true,
                    transparencyLevel: 'high'
                });
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new SystemeControleEthique();
            }
        } catch (error) {
            this.logger.error('Error creating ethics system', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du noyau IA
     * @returns Instance du noyau IA
     */
    private async createIACore(): Promise<IACore> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (IACore.getInstance) {
                return IACore.getInstance({
                    preloadModels: true,
                    enableLearning: true,
                    contextAwareness: true,
                    adaptiveComputation: true,
                    memoryManagement: 'advanced',
                    optimizationLevel: 'balanced'
                });
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new IACore();
            }
        } catch (error) {
            this.logger.error('Error creating IA Core', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du système d'expressions
     * @returns Instance du système d'expressions
     */
    private async createExpressionsSystem(): Promise<SystemeExpressions> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (SystemeExpressions.getInstance) {
                return SystemeExpressions.getInstance();
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new SystemeExpressions();
            }
        } catch (error) {
            this.logger.error('Error creating expressions system', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du système de gestion des variantes dialectales
     * @returns Instance du système de gestion des variantes dialectales
     */
    private async createDialectSystem(): Promise<GestionVariantesDiatopiques> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (GestionVariantesDiatopiques.getInstance) {
                return GestionVariantesDiatopiques.getInstance();
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new GestionVariantesDiatopiques();
            }
        } catch (error) {
            this.logger.error('Error creating dialect system', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du système de validation collaborative
     * @returns Instance du système de validation collaborative
     */
    private async createValidationSystem(): Promise<ValidationCollaborative> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (ValidationCollaborative.getInstance) {
                return ValidationCollaborative.getInstance();
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new ValidationCollaborative();
            }
        } catch (error) {
            this.logger.error('Error creating validation system', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du système spatial
     * @returns Instance du système spatial
     */
    private async createSpatialSystem(): Promise<GestionEspaceSpatial> {
        try {
            // Vérifier si getInstance existe, sinon utiliser le constructeur
            if (GestionEspaceSpatial.getInstance) {
                return GestionEspaceSpatial.getInstance();
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new GestionEspaceSpatial();
            }
        } catch (error) {
            this.logger.error('Error creating spatial system', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw error;
        }
    }

    /**
     * Crée une instance du système d'apprentissage
     * @returns Instance du système d'apprentissage ou null si non disponible
     */
    private async createLearningSystem(): Promise<LearningSystem | null> {
        try {
            // Vérifier si getInstance existe, sinon retourner null
            if (LearningSystem.getInstance) {
                return LearningSystem.getInstance({
                    enableContinuousLearning: true,
                    feedbackThreshold: 0.75,
                    adaptationRate: 0.25,
                    observationalLearning: true,
                    selfImprovement: true
                });
            } else {
                // Approche alternative si getInstance n'est pas disponible
                return new LearningSystem();
            }
        } catch (error) {
            this.logger.warn('Error creating learning system', {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    /**
     * Récupère un système par son identifiant
     * @param id Identifiant du système
     * @returns Instance du système ou undefined
     */
    public getSystem<T>(id: string): T | undefined {
        const system = this.systems.get(id);
        return system ? system.instance as T : undefined;
    }

    /**
     * Arrête tous les systèmes
     */
    public async shutdownSystems(): Promise<void> {
        this.logger.info('Shutting down all systems');

        const shutdownPromises: Promise<void>[] = [];

        for (const [id, system] of this.systems.entries()) {
            if (system.shutdown) {
                const promise = this.shutdownSystemWithRetry(id, system);
                shutdownPromises.push(promise);
            }
        }

        await Promise.all(shutdownPromises);

        this.logger.info('All systems shut down successfully');
    }

    /**
     * Arrête un système avec gestion des tentatives
     * @param id Identifiant du système
     * @param system Instance du système
     */
    private async shutdownSystemWithRetry(id: string, system: SystemInstance): Promise<void> {
        try {
            this.logger.debug(`Shutting down system: ${id}`);

            if (system.shutdown) {
                await system.shutdown();
            }

            this.logger.info(`System shut down successfully: ${id}`);
        } catch (error) {
            this.logger.error(`Error shutting down system: ${id}`, {
                error: error instanceof Error ? error.message : String(error)
            });

            // Ne pas propager l'erreur pour permettre l'arrêt des autres systèmes
        }
    }
}