/**
 * Générateur de contenu pour les étapes d'apprentissage personnalisées
 * 
 * @file src/ai/services/learning/personalization/utils/StepContentGenerator.ts
 * @module ai/services/learning/personalization/utils
 * @description Générateur spécialisé pour le contenu adaptatif des étapes d'apprentissage LSF
 * Compatible avec exactOptionalPropertyTypes: true
 * @author MetaSign Learning Team
 * @version 3.0.0
 * @since 2024
 * @lastModified 2025-01-15
 */

import type {
    StepType,
    CECRLLevel,
    LearningPathStep
} from '../types/LearningPathTypes';
import type { UserReverseProfile } from '@/ai/services/learning/human/coda/codavirtuel/ReverseApprenticeshipSystem';
import { Logger } from '@/ai/utils/Logger';

/**
 * Contexte pour la génération de contenu
 */
export interface ContentGenerationContext {
    readonly profile: UserReverseProfile;
    readonly targetLevel: CECRLLevel;
    readonly currentLevel: CECRLLevel;
    readonly stepType: StepType;
    readonly targetSkills: readonly string[];
    readonly difficulty: number;
    readonly culturalContext: 'french' | 'international' | 'mixed';
    readonly learningStyle: 'visual' | 'kinesthetic' | 'mixed';
}

/**
 * Contenu généré pour une étape
 */
export interface GeneratedStepContent {
    readonly title: string;
    readonly description: string;
    readonly instructions: readonly string[];
    readonly materials: readonly ContentMaterial[];
    readonly examples: readonly ContentExample[];
    readonly assessmentCriteria: readonly string[];
    readonly culturalNotes: readonly string[];
    readonly adaptiveHints: readonly string[];
}

/**
 * Matériel de contenu
 */
interface ContentMaterial {
    readonly type: 'video' | 'image' | 'text' | 'interactive' | 'simulation';
    readonly title: string;
    readonly description: string;
    readonly url?: string;
    readonly duration?: number;
    readonly difficulty: number;
    readonly culturallyRelevant: boolean;
}

/**
 * Exemple de contenu
 */
interface ContentExample {
    readonly type: 'sign_demonstration' | 'conversation' | 'scenario' | 'exercise';
    readonly title: string;
    readonly description: string;
    readonly content: string;
    readonly difficulty: number;
    readonly culturalContext?: string;
    readonly videoReference?: string;
}

/**
 * Templates de contenu par type d'étape et compétence
 */
interface ContentTemplate {
    readonly stepType: StepType;
    readonly skill: string;
    readonly level: CECRLLevel;
    readonly titlePattern: string;
    readonly descriptionPattern: string;
    readonly instructionPatterns: readonly string[];
    readonly materialTypes: readonly ContentMaterial['type'][];
    readonly exampleTypes: readonly ContentExample['type'][];
}

/**
 * Bibliothèque de templates par compétence LSF
 */
const LSF_CONTENT_TEMPLATES: readonly ContentTemplate[] = [
    // Vocabulaire de base
    {
        stepType: 'lesson',
        skill: 'basicVocabulary',
        level: 'A1',
        titlePattern: 'Vocabulaire essentiel : {skill_topic}',
        descriptionPattern: 'Apprentissage des signes de base pour {skill_topic} en contexte quotidien',
        instructionPatterns: [
            'Observez attentivement la démonstration de chaque signe',
            'Répétez chaque signe en respectant la configuration et le mouvement',
            'Pratiquez la transition entre les signes'
        ],
        materialTypes: ['video', 'image', 'interactive'],
        exampleTypes: ['sign_demonstration', 'scenario']
    },
    {
        stepType: 'exercise',
        skill: 'basicVocabulary',
        level: 'A1',
        titlePattern: 'Pratique : Reconnaissance de signes {skill_topic}',
        descriptionPattern: 'Exercices interactifs pour reconnaître et reproduire les signes de {skill_topic}',
        instructionPatterns: [
            'Identifiez le signe présenté parmi les options proposées',
            'Reproduisez le signe avec précision',
            'Vérifiez votre exécution avec la correction'
        ],
        materialTypes: ['interactive', 'video'],
        exampleTypes: ['exercise', 'sign_demonstration']
    },
    // Reconnaissance des signes
    {
        stepType: 'practice',
        skill: 'recognition',
        level: 'A1',
        titlePattern: 'Reconnaissance en contexte : {skill_topic}',
        descriptionPattern: 'Pratique de reconnaissance des signes dans des situations réelles',
        instructionPatterns: [
            'Observez la conversation signée complète',
            'Identifiez les signes que vous connaissez',
            'Déduisez le sens général du message'
        ],
        materialTypes: ['video', 'simulation'],
        exampleTypes: ['conversation', 'scenario']
    },
    // Grammaire LSF
    {
        stepType: 'lesson',
        skill: 'grammar',
        level: 'B1',
        titlePattern: 'Grammaire LSF : {skill_topic}',
        descriptionPattern: 'Étude des structures grammaticales spécifiques à la LSF',
        instructionPatterns: [
            'Analysez la structure grammaticale présentée',
            'Comparez avec les équivalents en français parlé',
            'Observez l\'utilisation de l\'espace de signation'
        ],
        materialTypes: ['video', 'text', 'interactive'],
        exampleTypes: ['sign_demonstration', 'conversation']
    },
    // Expressions faciales et corporelles
    {
        stepType: 'practice',
        skill: 'facialExpressions',
        level: 'A2',
        titlePattern: 'Expressions non-manuelles : {skill_topic}',
        descriptionPattern: 'Maîtrise des expressions faciales et corporelles grammaticales',
        instructionPatterns: [
            'Concentrez-vous sur les expressions faciales',
            'Synchronisez l\'expression avec le signe manuel',
            'Pratiquez la nuance émotionnelle'
        ],
        materialTypes: ['video', 'simulation'],
        exampleTypes: ['sign_demonstration', 'scenario']
    }
] as const;

/**
 * Contenus culturels contextuels
 */
const CULTURAL_CONTEXTS: Readonly<Record<string, readonly string[]>> = {
    'french_deaf_community': [
        'Histoire de la LSF et de l\'éducation des sourds en France',
        'Traditions et événements de la communauté sourde française',
        'Personnalités importantes de la culture sourde française'
    ],
    'international_deaf': [
        'Diversité des langues des signes dans le monde',
        'Culture sourde internationale et échanges',
        'Conventions et droits des personnes sourdes'
    ],
    'daily_life': [
        'Situations de communication quotidienne',
        'Interactions professionnelles en LSF',
        'Vie sociale et familiale en LSF'
    ]
} as const;

/**
 * Générateur de contenu pour les étapes d'apprentissage
 */
export class StepContentGenerator {
    private readonly logger = Logger.getInstance('StepContentGenerator');

    /**
     * Constructeur du générateur de contenu
     * 
     * @example
     * ```typescript
     * const contentGenerator = new StepContentGenerator();
     * ```
     */
    constructor() {
        this.logger.debug('StepContentGenerator initialisé');
    }

    /**
     * Génère le contenu complet pour une étape d'apprentissage
     * 
     * @param context Contexte de génération
     * @returns Contenu généré pour l'étape
     * 
     * @example
     * ```typescript
     * const content = generator.generateStepContent({
     *     stepType: 'lesson',
     *     targetSkills: ['basicVocabulary'],
     *     difficulty: 0.3,
     *     targetLevel: 'A1'
     * });
     * ```
     */
    public generateStepContent(context: ContentGenerationContext): GeneratedStepContent {
        this.logger.debug('Génération de contenu d\'étape', {
            stepType: context.stepType,
            targetLevel: context.targetLevel,
            targetSkills: context.targetSkills.length
        });

        try {
            // Sélectionner le template approprié
            const template = this.selectTemplate(context);

            // Générer le contenu de base
            const baseContent = this.generateBaseContent(template, context);

            // Générer les matériaux
            const materials = this.generateMaterials(template, context);

            // Générer les exemples
            const examples = this.generateExamples(template, context);

            // Générer les critères d'évaluation
            const assessmentCriteria = this.generateAssessmentCriteria(context);

            // Générer les notes culturelles
            const culturalNotes = this.generateCulturalNotes(context);

            // Générer les indices adaptatifs
            const adaptiveHints = this.generateAdaptiveHints(context);

            const generatedContent: GeneratedStepContent = {
                title: baseContent.title,
                description: baseContent.description,
                instructions: baseContent.instructions,
                materials,
                examples,
                assessmentCriteria,
                culturalNotes,
                adaptiveHints
            };

            this.logger.info('Contenu d\'étape généré avec succès', {
                stepType: context.stepType,
                materialsCount: materials.length,
                examplesCount: examples.length,
                hintsCount: adaptiveHints.length
            });

            return generatedContent;

        } catch (error) {
            this.logger.error('Erreur lors de la génération de contenu', {
                stepType: context.stepType,
                targetSkills: context.targetSkills,
                error
            });
            throw new Error(`Génération de contenu échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        }
    }

    /**
     * Génère du contenu adaptatif basé sur les performances
     * 
     * @param originalContent Contenu original
     * @param performanceData Données de performance
     * @returns Contenu adapté
     * 
     * @example
     * ```typescript
     * const adaptedContent = generator.generateAdaptiveContent(content, performanceData);
     * ```
     */
    public generateAdaptiveContent(
        originalContent: GeneratedStepContent,
        performanceData: { successRate: number; avgTime: number; mistakes: readonly string[] }
    ): GeneratedStepContent {
        this.logger.debug('Génération de contenu adaptatif', performanceData);

        // Adapter selon le taux de succès
        let adaptedInstructions = [...originalContent.instructions];
        let adaptedHints = [...originalContent.adaptiveHints];

        if (performanceData.successRate < 0.6) {
            // Ajouter des instructions simplifiées
            adaptedInstructions = [
                'Prenez votre temps pour bien observer chaque détail',
                ...adaptedInstructions,
                'N\'hésitez pas à revoir la démonstration plusieurs fois'
            ];

            // Ajouter des indices supplémentaires
            adaptedHints = [
                ...adaptedHints,
                'Concentrez-vous d\'abord sur la forme de la main',
                'Observez le mouvement avant de l\'imiter',
                'Vérifiez la position par rapport au corps'
            ];
        }

        if (performanceData.avgTime > 60) {
            // Ajouter des encouragements pour accélérer
            adaptedHints = [
                ...adaptedHints,
                'Essayez de maintenir un rythme naturel',
                'La fluidité viendra avec la pratique'
            ];
        }

        return {
            ...originalContent,
            instructions: adaptedInstructions,
            adaptiveHints: adaptedHints
        };
    }

    /**
     * Valide le contenu généré
     * 
     * @param content Contenu à valider
     * @returns True si le contenu est valide
     * @throws {Error} Si le contenu n'est pas valide
     */
    public validateGeneratedContent(content: GeneratedStepContent): boolean {
        if (!content.title || content.title.trim().length === 0) {
            throw new Error('Titre du contenu requis');
        }

        if (!content.description || content.description.trim().length === 0) {
            throw new Error('Description du contenu requise');
        }

        if (content.instructions.length === 0) {
            throw new Error('Au moins une instruction requise');
        }

        if (content.materials.length === 0) {
            throw new Error('Au moins un matériel requis');
        }

        // Validation de la cohérence des niveaux de difficulté
        const difficulties = content.materials.map(m => m.difficulty);
        const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;

        if (avgDifficulty < 0 || avgDifficulty > 1) {
            throw new Error(`Difficulté moyenne invalide: ${avgDifficulty}`);
        }

        return true;
    }

    /**
     * Sélectionne le template approprié selon le contexte
     * 
     * @param context Contexte de génération
     * @returns Template sélectionné
     * @private
     */
    private selectTemplate(context: ContentGenerationContext): ContentTemplate {
        // Rechercher un template exact
        const exactMatch = LSF_CONTENT_TEMPLATES.find(template =>
            template.stepType === context.stepType &&
            context.targetSkills.includes(template.skill) &&
            template.level === context.targetLevel
        );

        if (exactMatch) {
            return exactMatch;
        }

        // Rechercher un template pour le type et la compétence
        const skillMatch = LSF_CONTENT_TEMPLATES.find(template =>
            template.stepType === context.stepType &&
            context.targetSkills.includes(template.skill)
        );

        if (skillMatch) {
            return skillMatch;
        }

        // Rechercher un template pour le type d'étape
        const typeMatch = LSF_CONTENT_TEMPLATES.find(template =>
            template.stepType === context.stepType
        );

        if (typeMatch) {
            return typeMatch;
        }

        // Template par défaut
        return this.createDefaultTemplate(context);
    }

    /**
     * Crée un template par défaut
     * 
     * @param context Contexte de génération
     * @returns Template par défaut
     * @private
     */
    private createDefaultTemplate(context: ContentGenerationContext): ContentTemplate {
        return {
            stepType: context.stepType,
            skill: context.targetSkills[0] || 'general',
            level: context.targetLevel,
            titlePattern: '{stepType} : {skill}',
            descriptionPattern: 'Apprentissage de {skill} en LSF (niveau {level})',
            instructionPatterns: [
                'Suivez les instructions affichées',
                'Pratiquez les éléments présentés',
                'Vérifiez votre compréhension'
            ],
            materialTypes: ['video', 'interactive'],
            exampleTypes: ['exercise', 'sign_demonstration']
        };
    }

    /**
     * Génère le contenu de base
     * 
     * @param template Template à utiliser
     * @param context Contexte de génération
     * @returns Contenu de base
     * @private
     */
    private generateBaseContent(
        template: ContentTemplate,
        context: ContentGenerationContext
    ): { title: string; description: string; instructions: readonly string[] } {
        const skillTopic = context.targetSkills[0] || 'communication générale';

        const title = template.titlePattern
            .replace('{skill_topic}', this.formatSkillName(skillTopic))
            .replace('{stepType}', this.formatStepTypeName(context.stepType))
            .replace('{skill}', this.formatSkillName(skillTopic));

        const description = template.descriptionPattern
            .replace('{skill_topic}', this.formatSkillName(skillTopic))
            .replace('{level}', context.targetLevel)
            .replace('{skill}', this.formatSkillName(skillTopic));

        const instructions = template.instructionPatterns.map(pattern =>
            pattern
                .replace('{skill}', this.formatSkillName(skillTopic))
                .replace('{level}', context.targetLevel)
        );

        return { title, description, instructions };
    }

    /**
     * Génère les matériaux de contenu
     * 
     * @param template Template à utiliser
     * @param context Contexte de génération
     * @returns Matériaux générés
     * @private
     */
    private generateMaterials(
        template: ContentTemplate,
        context: ContentGenerationContext
    ): readonly ContentMaterial[] {
        const materials: ContentMaterial[] = [];

        for (const materialType of template.materialTypes) {
            const material = this.createMaterial(materialType, context);
            materials.push(material);
        }

        // Ajouter des matériaux supplémentaires selon la difficulté
        if (context.difficulty > 0.7) {
            materials.push(this.createMaterial('text', context, 'Support théorique avancé'));
        }

        return materials;
    }

    /**
     * Crée un matériau de contenu
     * 
     * @param type Type de matériau
     * @param context Contexte
     * @param customTitle Titre personnalisé (optionnel)
     * @returns Matériau créé
     * @private
     */
    private createMaterial(
        type: ContentMaterial['type'],
        context: ContentGenerationContext,
        customTitle?: string
    ): ContentMaterial {
        const skillName = this.formatSkillName(context.targetSkills[0] || 'général');

        const titles: Record<ContentMaterial['type'], string> = {
            video: `Démonstration vidéo : ${skillName}`,
            image: `Illustrations : ${skillName}`,
            text: `Guide textuel : ${skillName}`,
            interactive: `Exercice interactif : ${skillName}`,
            simulation: `Simulation 3D : ${skillName}`
        };

        const descriptions: Record<ContentMaterial['type'], string> = {
            video: 'Démonstration visuelle des signes et techniques',
            image: 'Illustrations détaillées des configurations et mouvements',
            text: 'Explications textuelles et points clés',
            interactive: 'Exercice interactif avec feedback immédiat',
            simulation: 'Simulation 3D pour une pratique immersive'
        };

        return {
            type,
            title: customTitle || titles[type],
            description: descriptions[type],
            duration: this.calculateMaterialDuration(type, context.difficulty),
            difficulty: context.difficulty,
            culturallyRelevant: context.culturalContext !== 'international'
        };
    }

    /**
     * Génère les exemples de contenu
     * 
     * @param template Template à utiliser
     * @param context Contexte de génération
     * @returns Exemples générés
     * @private
     */
    private generateExamples(
        template: ContentTemplate,
        context: ContentGenerationContext
    ): readonly ContentExample[] {
        const examples: ContentExample[] = [];

        for (const exampleType of template.exampleTypes) {
            const example = this.createExample(exampleType, context);
            examples.push(example);
        }

        return examples;
    }

    /**
     * Crée un exemple de contenu
     * 
     * @param type Type d'exemple
     * @param context Contexte
     * @returns Exemple créé
     * @private
     */
    private createExample(
        type: ContentExample['type'],
        context: ContentGenerationContext
    ): ContentExample {
        const skillName = this.formatSkillName(context.targetSkills[0] || 'général');

        const titles: Record<ContentExample['type'], string> = {
            sign_demonstration: `Démonstration : ${skillName}`,
            conversation: `Dialogue en LSF : ${skillName}`,
            scenario: `Scénario pratique : ${skillName}`,
            exercise: `Exercice d'application : ${skillName}`
        };

        const descriptions: Record<ContentExample['type'], string> = {
            sign_demonstration: 'Démonstration détaillée du signe avec variations',
            conversation: 'Exemple de conversation utilisant les signes appris',
            scenario: 'Situation réelle d\'utilisation des signes',
            exercise: 'Exercice pratique pour valider la compréhension'
        };

        return {
            type,
            title: titles[type],
            description: descriptions[type],
            content: this.generateExampleContent(type, context),
            difficulty: context.difficulty,
            culturalContext: context.culturalContext
        };
    }

    /**
     * Génère les critères d'évaluation
     * 
     * @param context Contexte de génération
     * @returns Critères d'évaluation
     * @private
     */
    private generateAssessmentCriteria(context: ContentGenerationContext): readonly string[] {
        const baseCriteria = [
            'Précision de la configuration manuelle',
            'Exactitude du mouvement',
            'Utilisation appropriée de l\'espace de signation'
        ];

        const levelSpecificCriteria: Record<CECRLLevel, readonly string[]> = {
            A1: ['Reconnaissance des signes de base', 'Reproduction fidèle des signes simples'],
            A2: ['Fluidité dans l\'enchaînement', 'Compréhension du contexte'],
            B1: ['Utilisation des expressions non-manuelles', 'Adaptation au contexte communicatif'],
            B2: ['Nuances expressives', 'Structures grammaticales complexes'],
            C1: ['Subtilités culturelles', 'Registres de langue appropriés'],
            C2: ['Maîtrise native', 'Créativité et spontanéité']
        };

        const typeSpecificCriteria: Record<StepType, readonly string[]> = {
            lesson: ['Compréhension des concepts théoriques'],
            exercise: ['Application correcte des règles apprises'],
            practice: ['Adaptation à des situations variées'],
            assessment: ['Démonstration autonome des compétences'],
            revision: ['Consolidation des acquis antérieurs']
        };

        return [
            ...baseCriteria,
            ...levelSpecificCriteria[context.targetLevel],
            ...typeSpecificCriteria[context.stepType]
        ];
    }

    /**
     * Génère les notes culturelles
     * 
     * @param context Contexte de génération
     * @returns Notes culturelles
     * @private
     */
    private generateCulturalNotes(context: ContentGenerationContext): readonly string[] {
        const culturalNotes: string[] = [];

        // Ajouter des notes selon le contexte culturel
        if (context.culturalContext === 'french') {
            culturalNotes.push(...CULTURAL_CONTEXTS.french_deaf_community);
        } else if (context.culturalContext === 'international') {
            culturalNotes.push(...CULTURAL_CONTEXTS.international_deaf);
        }

        // Ajouter des notes générales sur la vie quotidienne
        culturalNotes.push(...CULTURAL_CONTEXTS.daily_life.slice(0, 2));

        return culturalNotes.slice(0, 3); // Limiter à 3 notes
    }

    /**
     * Génère les indices adaptatifs
     * 
     * @param context Contexte de génération
     * @returns Indices adaptatifs
     * @private
     */
    private generateAdaptiveHints(context: ContentGenerationContext): readonly string[] {
        const hints: string[] = [];

        // Indices selon le niveau
        if (context.targetLevel === 'A1' || context.targetLevel === 'A2') {
            hints.push(
                'Commencez lentement et augmentez progressivement la vitesse',
                'Concentrez-vous sur la précision avant la fluidité'
            );
        }

        // Indices selon le style d'apprentissage
        if (context.learningStyle === 'visual') {
            hints.push('Utilisez les repères visuels pour mémoriser les signes');
        } else if (context.learningStyle === 'kinesthetic') {
            hints.push('Pratiquez physiquement chaque signe plusieurs fois');
        }

        // Indices selon la difficulté
        if (context.difficulty > 0.6) {
            hints.push(
                'Décomposez les mouvements complexes en étapes simples',
                'N\'hésitez pas à faire des pauses pour assimiler'
            );
        }

        return hints;
    }

    /**
     * Formate le nom d'une compétence pour l'affichage
     * 
     * @param skillName Nom brut de la compétence
     * @returns Nom formaté
     * @private
     */
    private formatSkillName(skillName: string): string {
        const skillMap: Record<string, string> = {
            'basicVocabulary': 'vocabulaire de base',
            'recognition': 'reconnaissance des signes',
            'grammar': 'grammaire LSF',
            'facialExpressions': 'expressions faciales',
            'spatialRelations': 'relations spatiales'
        };

        return skillMap[skillName] || skillName.toLowerCase();
    }

    /**
     * Formate le nom d'un type d'étape
     * 
     * @param stepType Type d'étape
     * @returns Nom formaté
     * @private
     */
    private formatStepTypeName(stepType: StepType): string {
        const typeMap: Record<StepType, string> = {
            lesson: 'Leçon',
            exercise: 'Exercice',
            practice: 'Pratique',
            assessment: 'Évaluation',
            revision: 'Révision'
        };

        return typeMap[stepType];
    }

    /**
     * Calcule la durée d'un matériau selon son type et sa difficulté
     * 
     * @param type Type de matériau
     * @param difficulty Difficulté
     * @returns Durée en minutes
     * @private
     */
    private calculateMaterialDuration(type: ContentMaterial['type'], difficulty: number): number {
        const baseDurations: Record<ContentMaterial['type'], number> = {
            video: 5,
            image: 2,
            text: 3,
            interactive: 10,
            simulation: 15
        };

        const baseDuration = baseDurations[type];
        const difficultyMultiplier = 0.7 + (difficulty * 0.6); // 0.7 à 1.3

        return Math.round(baseDuration * difficultyMultiplier);
    }

    /**
     * Génère le contenu d'un exemple
     * 
     * @param type Type d'exemple
     * @param context Contexte
     * @returns Contenu généré
     * @private
     */
    private generateExampleContent(type: ContentExample['type'], context: ContentGenerationContext): string {
        const skillName = context.targetSkills[0] || 'général';

        const contentGenerators: Record<ContentExample['type'], string> = {
            sign_demonstration: `Démonstration du signe pour "${skillName}" avec variations contextuelles`,
            conversation: `Dialogue intégrant le vocabulaire de "${skillName}" dans un contexte naturel`,
            scenario: `Situation pratique d'utilisation des signes de "${skillName}"`,
            exercise: `Exercice interactif pour pratiquer "${skillName}" avec feedback immédiat`
        };

        return contentGenerators[type];
    }
}