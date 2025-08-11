/**
 * @file src/ai/services/learning/codavirtuel/scenarios/catalog/ThemeCatalogService.ts
 * @description Service de gestion du catalogue de thèmes pour l'apprentissage
 * Ce service permet de récupérer, ajouter et filtrer les thèmes d'apprentissage
 * en fonction de différents critères tels que le niveau CECRL et la catégorie.
 * @module ThemeCatalogService
 * @since 2024
 * @author MetaSign
 * @version 1.0.0
 */

import { Logger } from '@/ai/utils/Logger';
import { LearningTheme, CECRLLevel } from '../../types';

/**
 * Service responsable de la gestion du catalogue de thèmes d'apprentissage
 * Fournit des méthodes pour accéder aux thèmes disponibles
 */
export class ThemeCatalogService {
    private logger: Logger;
    private themes: LearningTheme[];

    /**
     * Initialise le service de catalogue de thèmes
     */
    constructor() {
        this.logger = new Logger('ThemeCatalogService');
        this.themes = this.initializeThemes();

        this.logger.info(`ThemeCatalogService initialisé avec ${this.themes.length} thèmes`);
    }

    /**
     * Récupère un thème par son identifiant
     * @param themeId Identifiant du thème
     * @returns Promise<LearningTheme | null> Thème correspondant ou null si non trouvé
     */
    public async getThemeById(themeId: string): Promise<LearningTheme | null> {
        try {
            const theme = this.themes.find(t => t.id === themeId);
            return theme || null;
        } catch (error) {
            this.logger.error(`Erreur lors de la récupération du thème ${themeId}: ${error}`);
            return null;
        }
    }

    /**
     * Récupère les thèmes disponibles, filtrés par niveau si spécifié
     * @param level Niveau CECRL pour filtrer les thèmes (optionnel)
     * @returns Promise<LearningTheme[]> Liste des thèmes disponibles
     */
    public async getThemes(level?: CECRLLevel): Promise<LearningTheme[]> {
        try {
            if (!level) {
                return this.themes;
            }

            // Filtre les thèmes selon le niveau minimum requis
            return this.themes.filter(theme => {
                const themeLevel = theme.minLevel;
                const levelOrder = Object.values(CECRLLevel);

                // Récupère l'index du niveau du thème et du niveau demandé
                const themeLevelIndex = levelOrder.indexOf(themeLevel);
                const requestedLevelIndex = levelOrder.indexOf(level);

                // Le thème est disponible si son niveau minimum est inférieur ou égal au niveau demandé
                return themeLevelIndex <= requestedLevelIndex;
            });
        } catch (error) {
            this.logger.error(`Erreur lors de la récupération des thèmes: ${error}`);
            return [];
        }
    }

    /**
     * Récupère les thèmes par catégorie
     * @param category Catégorie de thèmes
     * @returns Promise<LearningTheme[]> Liste des thèmes dans la catégorie
     */
    public async getThemesByCategory(category: string): Promise<LearningTheme[]> {
        try {
            return this.themes.filter(theme => theme.category === category);
        } catch (error) {
            this.logger.error(`Erreur lors de la récupération des thèmes par catégorie ${category}: ${error}`);
            return [];
        }
    }

    /**
     * Ajoute un nouveau thème au catalogue
     * @param theme Thème à ajouter
     * @returns Promise<boolean> true si l'ajout a réussi, false sinon
     */
    public async addTheme(theme: LearningTheme): Promise<boolean> {
        try {
            // Vérifie si un thème avec le même ID existe déjà
            if (this.themes.some(t => t.id === theme.id)) {
                this.logger.warn(`Un thème avec l'ID ${theme.id} existe déjà`);
                return false;
            }

            this.themes.push(theme);
            this.logger.info(`Thème ajouté: ${theme.name}`);

            return true;
        } catch (error) {
            this.logger.error(`Erreur lors de l'ajout du thème: ${error}`);
            return false;
        }
    }

    /**
     * Initialise le catalogue de thèmes avec des données prédéfinies
     * @returns LearningTheme[] Liste des thèmes prédéfinis
     * @private
     */
    private initializeThemes(): LearningTheme[] {
        // En production, ces données viendraient d'une base de données
        // Pour l'exemple, nous utilisons des données en dur
        return [
            // Thèmes de niveau A1 (Débutant)
            {
                id: 'presentation',
                name: 'Présentation personnelle',
                description: 'Apprenez à vous présenter et à faire connaissance en LSF.',
                minLevel: CECRLLevel.A1,
                category: 'interaction',
                associatedConcepts: [
                    'salutations', 'nom', 'âge', 'métier', 'habitation', 'famille_base'
                ],
                resources: {
                    videos: ['presentation_basique.mp4'],
                    images: ['signes_presentation.jpg']
                }
            },
            {
                id: 'famille',
                name: 'La famille',
                description: 'Découvrez le vocabulaire pour parler de votre famille.',
                minLevel: CECRLLevel.A1,
                category: 'vocabulaire',
                associatedConcepts: [
                    'parents', 'enfants', 'freres_soeurs', 'grands_parents', 'relation'
                ],
                resources: {
                    videos: ['famille_basics.mp4'],
                    images: ['arbre_genealogique.jpg']
                }
            },
            {
                id: 'couleurs',
                name: 'Les couleurs',
                description: 'Apprenez les signes des couleurs et comment les utiliser en contexte.',
                minLevel: CECRLLevel.A1,
                category: 'vocabulaire',
                associatedConcepts: ['couleurs_base', 'description_visuelle', 'preferences'],
                resources: {
                    videos: ['couleurs_basiques.mp4'],
                    images: ['palette_couleurs.jpg']
                }
            },
            {
                id: 'chiffres',
                name: 'Les chiffres et nombres',
                description: 'Maîtrisez les chiffres, les nombres et leur utilisation en LSF.',
                minLevel: CECRLLevel.A1,
                category: 'vocabulaire',
                associatedConcepts: ['chiffres', 'nombres', 'age', 'quantite', 'argent'],
                resources: {
                    videos: ['chiffres_basiques.mp4'],
                    images: ['tableau_chiffres.jpg']
                }
            },

            // Thèmes de niveau A2 (Élémentaire)
            {
                id: 'alimentation',
                name: 'Alimentation et repas',
                description: 'Vocabulaire et expressions pour parler de nourriture et des repas.',
                minLevel: CECRLLevel.A2,
                category: 'vie_quotidienne',
                associatedConcepts: [
                    'nourriture', 'boissons', 'repas', 'gouts', 'cuisiner', 'restaurant'
                ],
                resources: {
                    videos: ['alimentation_a2.mp4'],
                    images: ['nourriture_schema.jpg']
                }
            },
            {
                id: 'vetements',
                name: 'Vêtements et mode',
                description: 'Comment décrire les vêtements et parler de mode en LSF.',
                minLevel: CECRLLevel.A2,
                category: 'vie_quotidienne',
                associatedConcepts: [
                    'vetements', 'accessoires', 'couleurs', 'tailles', 'styles', 'shopping'
                ],
                resources: {
                    videos: ['vetements_a2.mp4'],
                    images: ['catalogue_vetements.jpg']
                }
            },
            {
                id: 'temps',
                name: 'Le temps et la météo',
                description: 'Expressions pour parler du temps qu\'il fait et des saisons.',
                minLevel: CECRLLevel.A2,
                category: 'environnement',
                associatedConcepts: [
                    'meteo', 'saisons', 'temperature', 'climat', 'previsions'
                ],
                resources: {
                    videos: ['meteo_signes.mp4'],
                    images: ['saisons_schema.jpg']
                }
            },

            // Thèmes de niveau B1 (Intermédiaire)
            {
                id: 'travail',
                name: 'Le monde du travail',
                description: 'Vocabulaire et expressions pour parler du travail et des métiers.',
                minLevel: CECRLLevel.B1,
                category: 'professionnel',
                associatedConcepts: [
                    'metiers', 'entreprise', 'hierarchie', 'competences', 'recherche_emploi', 'entretien'
                ],
                resources: {
                    videos: ['travail_lsf.mp4'],
                    images: ['entreprise_schema.jpg']
                }
            },
            {
                id: 'sante',
                name: 'Santé et bien-être',
                description: 'Comment parler de santé et exprimer des problèmes médicaux.',
                minLevel: CECRLLevel.B1,
                category: 'vie_quotidienne',
                associatedConcepts: [
                    'corps', 'maladies', 'symptomes', 'medecin', 'hopital', 'bien_etre'
                ],
                resources: {
                    videos: ['sante_lsf.mp4'],
                    images: ['corps_humain.jpg']
                }
            },
            {
                id: 'education',
                name: 'Éducation et formation',
                description: 'Vocabulaire lié à l\'école, l\'université et l\'apprentissage.',
                minLevel: CECRLLevel.B1,
                category: 'education',
                associatedConcepts: [
                    'ecole', 'universite', 'formations', 'diplomes', 'apprentissage', 'matieres'
                ],
                resources: {
                    videos: ['education_lsf.mp4'],
                    images: ['systeme_education.jpg']
                }
            },

            // Thèmes de niveau B2 (Avancé)
            {
                id: 'environnement',
                name: 'Environnement et écologie',
                description: 'Discussion sur l\'environnement, l\'écologie et le développement durable.',
                minLevel: CECRLLevel.B2,
                category: 'societe',
                associatedConcepts: [
                    'ecologie', 'climat', 'developpement_durable', 'pollution', 'biodiversite'
                ],
                resources: {
                    videos: ['environnement_lsf.mp4'],
                    images: ['ecologie_infographie.jpg']
                }
            },
            {
                id: 'technologie',
                name: 'Technologies et numérique',
                description: 'Vocabulaire et expressions pour parler des nouvelles technologies.',
                minLevel: CECRLLevel.B2,
                category: 'moderne',
                associatedConcepts: [
                    'informatique', 'internet', 'reseaux_sociaux', 'applications', 'intelligence_artificielle'
                ],
                resources: {
                    videos: ['technologie_lsf.mp4'],
                    images: ['numerique_schema.jpg']
                }
            },

            // Thèmes de niveau C1 (Autonome)
            {
                id: 'politique',
                name: 'Politique et citoyenneté',
                description: 'Discussions politiques et questions de citoyenneté en LSF.',
                minLevel: CECRLLevel.C1,
                category: 'societe',
                associatedConcepts: [
                    'politique', 'democratie', 'elections', 'droits', 'citoyennete', 'debats'
                ],
                resources: {
                    videos: ['politique_lsf.mp4'],
                    images: ['systeme_politique.jpg']
                }
            },
            {
                id: 'culture_sourde',
                name: 'Culture sourde et histoire',
                description: 'Histoire, traditions et aspects culturels de la communauté sourde.',
                minLevel: CECRLLevel.C1,
                category: 'culture',
                associatedConcepts: [
                    'histoire_sourds', 'identite_sourde', 'communaute', 'evenements_culturels', 'art_sourd'
                ],
                resources: {
                    videos: ['culture_sourde.mp4', 'histoire_lsf.mp4'],
                    images: ['evenements_sourds.jpg']
                }
            },

            // Thèmes de niveau C2 (Maîtrise)
            {
                id: 'linguistique_lsf',
                name: 'Linguistique de la LSF',
                description: 'Étude approfondie de la structure et des caractéristiques linguistiques de la LSF.',
                minLevel: CECRLLevel.C2,
                category: 'linguistique',
                associatedConcepts: [
                    'parametres_formation', 'iconicite', 'espace_syntaxique', 'proformes', 'structures_grande_iconicite'
                ],
                resources: {
                    videos: ['linguistique_lsf.mp4'],
                    images: ['parametres_formation.jpg', 'espace_syntaxique.jpg']
                }
            },
            {
                id: 'traduction_interpretation',
                name: 'Traduction et interprétation',
                description: 'Techniques et pratiques de traduction et d\'interprétation entre le français et la LSF.',
                minLevel: CECRLLevel.C2,
                category: 'professionnel',
                associatedConcepts: [
                    'techniques_interpretation', 'ethique_professionnelle', 'adaptation_culturelle', 'contextes_specifiques'
                ],
                resources: {
                    videos: ['interpretation_techniques.mp4'],
                    images: ['situations_interpretation.jpg']
                }
            },
            {
                id: 'litterature_poesie',
                name: 'Littérature et poésie en LSF',
                description: 'Découverte des formes d\'expression artistique et littéraire en LSF.',
                minLevel: CECRLLevel.C2,
                category: 'culture',
                associatedConcepts: [
                    'poesie_lsf', 'narration', 'chansigne', 'theatre_sourd', 'expressions_artistiques'
                ],
                resources: {
                    videos: ['poesie_lsf.mp4', 'chansigne_exemple.mp4'],
                    images: ['performance_artistique.jpg']
                }
            }
        ];
    }
}