/**
 * Service pour la gestion des niveaux dans le système de gamification
 * 
 * @file src/ai/services/learning/gamification/services/LevelService.ts
 */

import { GamificationLevel, GamificationProfile, LevelUpResult } from '../types';

/**
 * Service de gestion des niveaux
 */
export class LevelService {
    private levels: GamificationLevel[];

    /**
     * Initialise le service de niveaux
     */
    constructor() {
        this.levels = this.initializeLevels();
    }

    /**
     * Initialise les niveaux de progression
     * @returns Liste des niveaux
     * @private
     */
    private initializeLevels(): GamificationLevel[] {
        return [
            {
                level: 1,
                title: 'Débutant',
                description: 'Votre parcours d\'apprentissage commence...',
                requiredPoints: 0,
                rewards: {
                    unlockedFeatures: ['basic_exercises']
                }
            },
            {
                level: 2,
                title: 'Explorateur',
                description: 'Vous commencez à explorer le monde de la LSF',
                requiredPoints: 100,
                rewards: {
                    bonusPoints: 50,
                    badgeId: 'welcome_explorer',
                    unlockedFeatures: ['daily_challenges']
                }
            },
            {
                level: 3,
                title: 'Apprenti',
                description: 'Vos compétences de base se développent',
                requiredPoints: 300,
                rewards: {
                    bonusPoints: 100,
                    badgeId: 'learning_apprentice',
                    unlockedFeatures: ['progress_tracking']
                }
            },
            {
                level: 4,
                title: 'Communicateur',
                description: 'Vous pouvez maintenant communiquer en LSF de façon basique',
                requiredPoints: 700,
                rewards: {
                    bonusPoints: 150,
                    badgeId: 'basic_communicator',
                    unlockedFeatures: ['video_exercises']
                }
            },
            {
                level: 5,
                title: 'Conteur',
                description: 'Vous savez raconter des histoires simples en LSF',
                requiredPoints: 1500,
                rewards: {
                    bonusPoints: 200,
                    badgeId: 'storyteller',
                    unlockedFeatures: ['narrative_exercises']
                }
            },
            {
                level: 6,
                title: 'Interlocuteur',
                description: 'Vous pouvez tenir des conversations fluides en LSF',
                requiredPoints: 3000,
                rewards: {
                    bonusPoints: 300,
                    badgeId: 'fluent_speaker',
                    unlockedFeatures: ['conversation_practice']
                }
            },
            {
                level: 7,
                title: 'Expert',
                description: 'Vos compétences en LSF sont maintenant avancées',
                requiredPoints: 5000,
                rewards: {
                    bonusPoints: 500,
                    badgeId: 'lsf_expert',
                    unlockedFeatures: ['advanced_exercises']
                }
            },
            {
                level: 8,
                title: 'Maître',
                description: 'Vous maîtrisez la LSF dans des contextes variés',
                requiredPoints: 8000,
                rewards: {
                    bonusPoints: 800,
                    badgeId: 'lsf_master',
                    unlockedFeatures: ['mentor_features']
                }
            },
            {
                level: 9,
                title: 'Virtuose',
                description: 'Votre maîtrise de la LSF est exceptionnelle',
                requiredPoints: 12000,
                rewards: {
                    bonusPoints: 1000,
                    badgeId: 'lsf_virtuoso',
                    unlockedFeatures: ['advanced_analytics']
                }
            },
            {
                level: 10,
                title: 'Légendaire',
                description: 'Vous êtes maintenant une référence en LSF',
                requiredPoints: 20000,
                rewards: {
                    bonusPoints: 2000,
                    badgeId: 'lsf_legend',
                    unlockedFeatures: ['all_features']
                }
            }
        ];
    }

    /**
     * Vérifie si l'utilisateur monte de niveau
     * @param profile Profil de l'utilisateur
     * @returns Résultat de la vérification
     */
    public checkLevelUp(profile: GamificationProfile): LevelUpResult {
        const currentLevel = profile.currentLevel;
        let newLevel = currentLevel;

        // Parcourir les niveaux pour trouver le niveau actuel
        for (let i = 0; i < this.levels.length; i++) {
            const level = this.levels[i];

            // Trouver le niveau suivant que l'utilisateur peut atteindre
            if (level.level > currentLevel && profile.totalPoints >= level.requiredPoints) {
                newLevel = level.level;

                // Mettre à jour le profil
                profile.currentLevel = newLevel;

                // Calculer les points pour le prochain niveau
                const nextLevel = this.levels.find(l => l.level > newLevel);
                profile.pointsToNextLevel = nextLevel ? nextLevel.requiredPoints - profile.totalPoints : 0;

                return {
                    levelUp: true,
                    previousLevel: currentLevel,
                    newLevel
                };
            }
        }

        // Mettre à jour les points pour le prochain niveau
        const nextLevel = this.levels.find(l => l.level > currentLevel);
        if (nextLevel) {
            profile.pointsToNextLevel = nextLevel.requiredPoints - profile.totalPoints;
        }

        return {
            levelUp: false,
            previousLevel: currentLevel,
            newLevel
        };
    }

    /**
     * Obtient les informations d'un niveau par son identifiant
     * @param level Identifiant du niveau
     * @returns Informations du niveau ou undefined si non trouvé
     */
    public getLevelInfo(level: number): GamificationLevel | undefined {
        return this.levels.find(l => l.level === level);
    }

    /**
     * Obtient tous les niveaux
     * @returns Liste de tous les niveaux
     */
    public getAllLevels(): GamificationLevel[] {
        return [...this.levels];
    }

    /**
     * Calcule le niveau correspondant à un nombre de points
     * @param points Nombre de points
     * @returns Niveau correspondant
     */
    public getLevelForPoints(points: number): number {
        let highestLevel = 1;

        for (const level of this.levels) {
            if (points >= level.requiredPoints) {
                highestLevel = level.level;
            } else {
                break;
            }
        }

        return highestLevel;
    }

    /**
     * Calcule les points nécessaires pour atteindre le niveau suivant
     * @param currentLevel Niveau actuel
     * @param currentPoints Points actuels
     * @returns Points nécessaires pour le niveau suivant
     */
    public getPointsToNextLevel(currentLevel: number, currentPoints: number): number {
        const nextLevel = this.levels.find(l => l.level > currentLevel);
        if (!nextLevel) {
            return 0; // Niveau maximum atteint
        }

        return Math.max(0, nextLevel.requiredPoints - currentPoints);
    }
}