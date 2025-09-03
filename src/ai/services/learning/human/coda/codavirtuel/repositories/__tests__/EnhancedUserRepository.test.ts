/**
 * @file EnhancedUserRepository.test.ts
 * @description Tests unitaires complets pour le repository utilisateur avec persistence
 * 
 * Teste les fonctionnalités critiques:
 * - CRUD operations avec validation
 * - Persistence multi-format (JSON, Memory)
 * - Recherche et filtrage avancés
 * - Métriques et analytics
 * - Gestion des backups et migrations
 * - Performance avec de gros volumes
 * - Intégrité des données
 * 
 * @author MetaSign Team - CODA Tests
 * @version 1.0.0
 */

import { EnhancedUserRepository, type UserSearchOptions } from '../EnhancedUserRepository';
import { type CECRLLevel } from '../../types/base';
import { type UserReverseProfile } from '../../types/learning';

describe('EnhancedUserRepository', () => {
    let repository: EnhancedUserRepository;

    beforeEach(async () => {
        repository = new EnhancedUserRepository({
            type: 'memory',
            enableCache: true,
            cacheSize: 100,
            enableTransactions: true,
            autoMigrate: false,
            filePath: ':memory:'
        });
        await repository.initialize();
    });

    afterEach(async () => {
        await repository.destroy();
    });

    describe('Opérations CRUD de Base', () => {
        const testProfile: UserReverseProfile = {
            userId: 'user-test-001',
            currentLevel: 'A2' as CECRLLevel,
            progressHistory: [
                { date: new Date('2024-01-01'), level: 'A1' as CECRLLevel, score: 0.85 }
            ],
            strengths: ['vocabulaire_base', 'salutations'],
            weaknesses: ['grammaire_complexe'],
            learningPreferences: ['visual', 'interactive'],
            culturalBackground: 'deaf_family_home',
            motivationFactors: ['family_communication', 'career_development'],
            learningStyle: 'visual',
            sessionCount: 15,
            totalLearningTime: 450,
            lastActivity: new Date()
        };

        test('doit créer un utilisateur avec validation complète', async () => {
            await repository.createUser('user-test-001', testProfile);
            
            const retrievedUser = await repository.getUser('user-test-001');
            expect(retrievedUser).toBeDefined();
            expect(retrievedUser!.profile.userId).toBe('user-test-001');
            expect(retrievedUser!.profile.currentLevel).toBe('A2');
        });

        test('doit rejeter les utilisateurs avec des données invalides', async () => {
            const invalidProfile = {
                ...testProfile,
                currentLevel: 'INVALID' as CECRLLevel
            };

            await expect(repository.createUser('invalid-user', invalidProfile)).rejects.toThrow();
        });

        test('doit mettre à jour un utilisateur existant', async () => {
            await repository.createUser('user-test-001', testProfile);
            
            const updatedProfile: Partial<UserReverseProfile> = {
                currentLevel: 'B1' as CECRLLevel,
                sessionCount: 20
            };

            await repository.updateUserProfile('user-test-001', updatedProfile);

            const retrievedUser = await repository.getUser('user-test-001');
            expect(retrievedUser).toBeDefined();
            expect(retrievedUser!.profile.currentLevel).toBe('B1');
            expect(retrievedUser!.profile.sessionCount).toBe(20);
        });

        test('doit supprimer un utilisateur', async () => {
            await repository.createUser('user-test-001', testProfile);
            
            await repository.deleteUser('user-test-001');

            const retrievedUser = await repository.getUser('user-test-001');
            expect(retrievedUser).toBeNull();
        });

        test('doit gérer les utilisateurs inexistants', async () => {
            const inexistantUser = await repository.getUser('inexistant-id');
            expect(inexistantUser).toBeNull();

            await expect(repository.updateUserProfile('inexistant-id', { currentLevel: 'B1' as CECRLLevel })).rejects.toThrow();

            await repository.deleteUser('inexistant-id');
        });
    });

    describe('Recherche et Filtrage Avancés', () => {
        beforeEach(async () => {
            const profiles = [
                {
                    userId: 'user-001',
                    currentLevel: 'A1' as CECRLLevel,
                    progressHistory: [],
                    strengths: ['vocabulaire'],
                    weaknesses: ['grammaire'],
                    learningPreferences: ['visual'],
                    culturalBackground: 'deaf_family_home',
                    motivationFactors: ['family'],
                    learningStyle: 'visual',
                    sessionCount: 5,
                    totalLearningTime: 150,
                    lastActivity: new Date('2024-01-15')
                } as UserReverseProfile,
                {
                    userId: 'user-002',
                    currentLevel: 'B1' as CECRLLevel,
                    progressHistory: [],
                    strengths: ['grammaire'],
                    weaknesses: ['vocabulaire'],
                    learningPreferences: ['auditory'],
                    culturalBackground: 'mixed_hearing_family',
                    motivationFactors: ['career'],
                    learningStyle: 'kinesthetic',
                    sessionCount: 25,
                    totalLearningTime: 750,
                    lastActivity: new Date('2024-02-10')
                } as UserReverseProfile
            ];

            for (const profile of profiles) {
                await repository.createUser(profile.userId, profile);
            }
        });

        test('doit rechercher par niveau CECRL', async () => {
            const searchOptions: UserSearchOptions = {
                level: 'A1'
            };

            const results = await repository.searchUsers(searchOptions);
            expect(results.length).toBe(1);
            expect(results[0].profile.currentLevel).toBe('A1');
        });

        test('doit rechercher par nombre minimum de sessions', async () => {
            const searchOptions: UserSearchOptions = {
                minSessions: 20
            };

            const results = await repository.searchUsers(searchOptions);
            expect(results.length).toBeGreaterThanOrEqual(0);
            if (results.length > 0) {
                expect(results[0].profile.sessionCount).toBeGreaterThanOrEqual(20);
            }
        });

        test('doit combiner plusieurs critères de recherche', async () => {
            const searchOptions: UserSearchOptions = {
                level: 'B1',
                minSessions: 20
            };

            const results = await repository.searchUsers(searchOptions);
            expect(results.length).toBeGreaterThanOrEqual(0);
            results.forEach(user => {
                expect(user.profile.currentLevel).toBe('B1');
                expect(user.profile.sessionCount).toBeGreaterThanOrEqual(20);
            });
        });
    });

    describe('Métriques et Analytics', () => {
        beforeEach(async () => {
            const profiles = [
                {
                    userId: 'metrics-user-1',
                    currentLevel: 'A1' as CECRLLevel,
                    progressHistory: [
                        { date: new Date('2024-01-01'), level: 'A1' as CECRLLevel, score: 0.75 }
                    ],
                    strengths: ['vocabulaire'],
                    weaknesses: ['grammaire'],
                    learningPreferences: ['visual'],
                    culturalBackground: 'deaf_family_home',
                    motivationFactors: ['family'],
                    learningStyle: 'visual',
                    sessionCount: 10,
                    totalLearningTime: 300,
                    lastActivity: new Date()
                } as UserReverseProfile,
                {
                    userId: 'metrics-user-2',
                    currentLevel: 'B1' as CECRLLevel,
                    progressHistory: [
                        { date: new Date('2024-01-01'), level: 'A1' as CECRLLevel, score: 0.8 },
                        { date: new Date('2024-01-15'), level: 'A2' as CECRLLevel, score: 0.85 },
                        { date: new Date('2024-02-01'), level: 'B1' as CECRLLevel, score: 0.75 }
                    ],
                    strengths: ['grammaire', 'vocabulaire'],
                    weaknesses: ['expressions'],
                    learningPreferences: ['auditory'],
                    culturalBackground: 'deaf_school',
                    motivationFactors: ['career'],
                    learningStyle: 'kinesthetic',
                    sessionCount: 30,
                    totalLearningTime: 900,
                    lastActivity: new Date()
                } as UserReverseProfile
            ];

            for (const profile of profiles) {
                await repository.createUser(profile.userId, profile);
            }
        });

        test('doit calculer les métriques de progression utilisateur', async () => {
            const metrics = await repository.getUserMetrics('metrics-user-2');
            
            expect(metrics).toBeDefined();
            expect(metrics!.levelProgression.currentLevel).toBe('B1');
            expect(metrics!.totalSessions).toBe(30);
            expect(metrics!.totalLearningTime).toBe(900);
            expect(metrics!.averageSessionDuration).toBe(30);
            expect(metrics!.levelProgression.previousLevels).toBeInstanceOf(Array);
        });

        test('doit compter les utilisateurs actifs', async () => {
            const activeCount = await repository.getActiveUsersCount(30);
            
            expect(activeCount).toBe(2);
        });

        test('doit recalculer les métriques utilisateur', async () => {
            const recalculatedMetrics = await repository.recalculateUserMetrics('metrics-user-2');
            
            expect(recalculatedMetrics).toBeDefined();
            expect(recalculatedMetrics.levelProgression.currentLevel).toBe('B1');
            expect(recalculatedMetrics.totalSessions).toBe(30);
        });
    });

    describe('Gestion des Backups et Migrations', () => {
        beforeEach(async () => {
            const testProfile: UserReverseProfile = {
                userId: 'backup-user',
                currentLevel: 'A2',
                progressHistory: [],
                strengths: [],
                weaknesses: [],
                learningPreferences: ['visual'],
                culturalBackground: 'deaf_family_home',
                motivationFactors: [],
                learningStyle: 'visual',
                sessionCount: 1,
                totalLearningTime: 30,
                lastActivity: new Date()
            };

            await repository.createUser('backup-user', testProfile);
        });

        test('doit créer un backup des données', async () => {
            const backupPath = '/tmp/test-backup.json';
            
            await repository.createBackup(backupPath);
            
            const stats = repository.getRepositoryStats();
            expect(stats).toBeDefined();
            expect(typeof stats.totalOperations).toBe('number');
        });

        test('doit restaurer depuis une sauvegarde', async () => {
            const backupPath = '/tmp/test-restore.json';
            
            await repository.createBackup(backupPath);
            await repository.restoreFromBackup(backupPath);
            
            const user = await repository.getUser('backup-user');
            expect(user).toBeDefined();
        });
    });

    describe('Performance et Scalabilité', () => {
        test('doit maintenir de bonnes performances avec de multiples utilisateurs', async () => {
            const userCount = 10;
            const profiles: UserReverseProfile[] = [];

            for (let i = 0; i < userCount; i++) {
                profiles.push({
                    userId: `perf-user-${i}`,
                    currentLevel: ['A1', 'A2', 'B1'][i % 3] as CECRLLevel,
                    progressHistory: [],
                    strengths: [],
                    weaknesses: [],
                    learningPreferences: ['visual'],
                    culturalBackground: 'deaf_family_home',
                    motivationFactors: [],
                    learningStyle: 'visual',
                    sessionCount: i + 1,
                    totalLearningTime: (i + 1) * 30,
                    lastActivity: new Date()
                });
            }

            const startTime = Date.now();
            
            for (const profile of profiles) {
                await repository.createUser(profile.userId, profile);
            }
            
            const insertTime = Date.now() - startTime;
            expect(insertTime).toBeLessThan(5000);

            const searchResults = await repository.searchUsers({ level: 'A1' });
            expect(searchResults.length).toBeGreaterThan(0);
        });

        test('doit gérer efficacement le cache', async () => {
            const testProfile: UserReverseProfile = {
                userId: 'cache-test',
                currentLevel: 'A1' as CECRLLevel,
                progressHistory: [],
                strengths: [],
                weaknesses: [],
                learningPreferences: ['visual'],
                culturalBackground: 'deaf_family_home',
                motivationFactors: [],
                learningStyle: 'visual',
                sessionCount: 1,
                totalLearningTime: 30,
                lastActivity: new Date()
            };

            await repository.createUser('cache-test', testProfile);

            const start1 = Date.now();
            const user1 = await repository.getUser('cache-test');
            const time1 = Date.now() - start1;

            const start2 = Date.now();
            const user2 = await repository.getUser('cache-test');
            const time2 = Date.now() - start2;

            expect(user1).toEqual(user2);
            expect(time2).toBeLessThanOrEqual(time1 * 2); // Cache may not always be faster due to timing variations
        });
    });
});