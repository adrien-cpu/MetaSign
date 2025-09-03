/**
 * @file src/ai/services/learning/human/coda/codavirtuel/repositories/index.ts
 * @description Point d'entrée pour tous les repositories CODA avec persistance améliorée
 * 
 * Fonctionnalités :
 * - 🗄️ Repositories avec persistance réelle (JSON, SQLite, mémoire)
 * - 👤 Gestion avancée des utilisateurs et profils
 * - 📚 Gestion complète des sessions d'enseignement
 * - 📊 Métriques et analytics détaillées
 * - 🔄 Migrations et backup automatiques
 * - ✨ Cache intelligent et performance optimisée
 * 
 * @module repositories
 * @version 1.0.0
 * @since 2025
 * @author MetaSign Team - CODA Repositories
 */

// Imports nécessaires pour les méthodes utilitaires
import { EnhancedUserRepository } from './EnhancedUserRepository';
import { SessionRepository } from './SessionRepository';
import { type PersistenceConfig } from './core/BasePersistenceAdapter';

// Exports des adaptateurs de persistance
export {
    BasePersistenceAdapter,
    PersistenceAdapterFactory,
    type PersistenceConfig,
    type CRUDOperations,
    type Transaction
} from './core/BasePersistenceAdapter';

export { JsonPersistenceAdapter } from './core/JsonPersistenceAdapter';
export { MemoryPersistenceAdapter } from './core/MemoryPersistenceAdapter';

// Exports des repositories principaux
export {
    EnhancedUserRepository,
    type EnhancedUserData,
    type UserProgressMetrics,
    type UserPreferences,
    type UserMetadata,
    type UserSearchOptions
} from './EnhancedUserRepository';

export {
    SessionRepository,
    type StoredSession,
    type SessionInteraction,
    type RealTimeSessionMetrics,
    type SessionSearchCriteria,
    type SessionAggregateStats,
    type SessionStatus
} from './SessionRepository';

// Exports du repository legacy pour rétrocompatibilité
export {
    UserReverseApprenticeshipRepository,
    type ExerciseResult
} from './UserReverseApprenticeshipRepository';

/**
 * Configuration par défaut pour les repositories
 */
export const DEFAULT_PERSISTENCE_CONFIGS = {
    // Configuration JSON pour développement local
    jsonDev: {
        type: 'json' as const,
        filePath: './data/coda/users.json',
        enableCache: true,
        cacheSize: 500,
        enableTransactions: true,
        autoMigrate: true
    },
    
    // Configuration JSON pour production
    jsonProd: {
        type: 'json' as const,
        filePath: '/app/data/coda/users.json',
        enableCache: true,
        cacheSize: 2000,
        enableTransactions: true,
        autoMigrate: true
    },
    
    // Configuration mémoire pour tests
    memory: {
        type: 'memory' as const,
        enableCache: false, // Pas besoin de cache supplémentaire
        enableTransactions: true,
        autoMigrate: false
    },
    
    // Configuration SQLite pour production (future)
    sqlite: {
        type: 'sqlite' as const,
        filePath: './data/coda/database.sqlite',
        enableCache: true,
        cacheSize: 1000,
        enableTransactions: true,
        autoMigrate: true
    }
} as const;

/**
 * Factory pour créer une collection de repositories configurés
 */
export class RepositoryFactory {
    /**
     * Crée un ensemble complet de repositories avec la même configuration de persistance
     */
    static async createRepositorySet(persistenceConfig: PersistenceConfig) {
        const userRepository = new EnhancedUserRepository(persistenceConfig);
        const sessionRepository = new SessionRepository({
            ...persistenceConfig,
            filePath: persistenceConfig.filePath?.replace('users.json', 'sessions.json')
        });

        // Initialiser tous les repositories
        await Promise.all([
            userRepository.initialize(),
            sessionRepository.initialize()
        ]);

        return {
            users: userRepository,
            sessions: sessionRepository,
            
            // Méthode utilitaire pour fermer tous les repositories
            async destroyAll() {
                await Promise.all([
                    userRepository.destroy(),
                    sessionRepository.destroy()
                ]);
            },
            
            // Méthode utilitaire pour créer des backups complets
            async createFullBackup(backupDir: string) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                await Promise.all([
                    userRepository.createBackup(`${backupDir}/users_${timestamp}.json`),
                    sessionRepository.createBackup(`${backupDir}/sessions_${timestamp}.json`)
                ]);
                return timestamp;
            },
            
            // Méthode utilitaire pour obtenir les stats globales
            getGlobalStats() {
                return {
                    users: userRepository.getRepositoryStats(),
                    sessions: sessionRepository.getRepositoryStats()
                };
            }
        };
    }
    
    /**
     * Crée des repositories pour l'environnement de développement
     */
    static async createDevRepositories() {
        return await this.createRepositorySet(DEFAULT_PERSISTENCE_CONFIGS.jsonDev);
    }
    
    /**
     * Crée des repositories pour l'environnement de production
     */
    static async createProdRepositories() {
        return await this.createRepositorySet(DEFAULT_PERSISTENCE_CONFIGS.jsonProd);
    }
    
    /**
     * Crée des repositories en mémoire pour les tests
     */
    static async createTestRepositories() {
        return await this.createRepositorySet(DEFAULT_PERSISTENCE_CONFIGS.memory);
    }
}

/**
 * Utilitaires pour la gestion des données
 */
export class DataUtils {
    /**
     * Migre les données depuis l'ancien UserReverseApprenticeshipRepository
     */
    static async migrateLegacyData(
        _legacyRepository: unknown,
        _enhancedRepository: EnhancedUserRepository
    ): Promise<void> {
        // Cette méthode sera implémentée pour migrer les données existantes
        // vers le nouveau format avec persistance
        console.log('Migration legacy data - à implémenter selon les besoins', { _legacyRepository, _enhancedRepository });
    }
    
    /**
     * Valide l'intégrité des données entre repositories
     */
    static async validateDataIntegrity(repositories: {
        users: EnhancedUserRepository;
        sessions: SessionRepository;
    }): Promise<{
        isValid: boolean;
        issues: string[];
        recommendations: string[];
    }> {
        const issues: string[] = [];
        const recommendations: string[] = [];
        
        // Validation de base - à étendre selon les besoins
        const userStats = repositories.users.getRepositoryStats();
        const sessionStats = repositories.sessions.getRepositoryStats();
        
        if ((userStats as { dataSize?: number }).dataSize === 0 && (sessionStats as { dataSize?: number }).dataSize && (sessionStats as { dataSize?: number }).dataSize! > 0) {
            issues.push('Sessions orphelines détectées (utilisateurs manquants)');
            recommendations.push('Nettoyer les sessions sans utilisateurs associés');
        }
        
        return {
            isValid: issues.length === 0,
            issues,
            recommendations
        };
    }
}

/**
 * Types utilitaires pour les repositories
 */
export type RepositorySet = Awaited<ReturnType<typeof RepositoryFactory.createRepositorySet>>;
export type RepositoryEnvironment = 'development' | 'production' | 'test';

/**
 * Configuration centralisée pour les repositories selon l'environnement
 */
export function getRepositoryConfig(environment: RepositoryEnvironment = 'development') {
    switch (environment) {
        case 'production':
            return DEFAULT_PERSISTENCE_CONFIGS.jsonProd;
        case 'test':
            return DEFAULT_PERSISTENCE_CONFIGS.memory;
        case 'development':
        default:
            return DEFAULT_PERSISTENCE_CONFIGS.jsonDev;
    }
}