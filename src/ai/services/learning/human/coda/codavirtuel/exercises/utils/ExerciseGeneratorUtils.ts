/**
 * @file src/ai/services/learning/human/coda/codavirtuel/exercises/utils/ExerciseGeneratorUtils.ts
 * @description Fonctions utilitaires pour la génération d'exercices de la LSF
 * @module ExerciseGeneratorUtils
 * @version 1.1.0
 * @since 2024
 * @lastModified 2025-05-27
 * @author MetaSign Team
 */

/**
 * Type union pour les niveaux de difficulté des exercices
 */
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Interface pour les résultats de génération de texte à trous
 */
interface BlankTextResult {
    readonly text: string;
    readonly blanks: ReadonlyArray<{
        readonly id: string;
        readonly correctAnswer: string;
    }>;
    readonly options: readonly string[];
}

/**
 * Interface pour les configurations de main disponibles
 */
interface HandConfiguration {
    readonly name: string;
    readonly description: string;
    readonly difficulty: DifficultyLevel;
}

/**
 * Interface pour les types de mouvements
 */
interface MovementType {
    readonly name: string;
    readonly description: string;
    readonly complexity: number;
}

/**
 * Interface pour les expressions faciales
 */
interface FacialExpression {
    readonly name: string;
    readonly context: string;
    readonly intensity: 'subtle' | 'moderate' | 'strong';
}

/**
 * Classe regroupant les utilitaires pour la génération d'exercices LSF
 * Fournit des méthodes statiques pour créer du contenu d'exercice adapté à chaque niveau
 */
export class ExerciseGeneratorUtils {

    /**
     * Configurations de main LSF disponibles organisées par difficulté
     * @private
     */
    private static readonly handConfigurations: readonly HandConfiguration[] = [
        { name: 'poing fermé', description: 'Main fermée en poing', difficulty: 'beginner' },
        { name: 'main plate', description: 'Paume ouverte et droite', difficulty: 'beginner' },
        { name: 'index tendu', description: 'Index pointé, autres doigts repliés', difficulty: 'easy' },
        { name: 'pouce levé', description: 'Pouce dressé, signifiant approbation', difficulty: 'easy' },
        { name: 'V de victoire', description: 'Index et majeur tendus en V', difficulty: 'easy' },
        { name: 'pince', description: 'Pouce et index se touchent', difficulty: 'medium' },
        { name: 'main en coupe', description: 'Paume incurvée formant une coupe', difficulty: 'medium' },
        { name: 'main en griffe', description: 'Doigts recourbés comme des griffes', difficulty: 'hard' },
        { name: 'doigts écartés', description: 'Tous les doigts bien séparés', difficulty: 'medium' },
        { name: 'pouce et auriculaire tendus', description: 'Signe "shaka" ou "appel téléphonique"', difficulty: 'expert' }
    ];

    /**
     * Types de mouvements LSF organisés par complexité
     * @private
     */
    private static readonly movementTypes: readonly MovementType[] = [
        { name: 'circulaire', description: 'Mouvement en cercle', complexity: 0.3 },
        { name: 'de haut en bas', description: 'Mouvement vertical descendant', complexity: 0.2 },
        { name: 'de droite à gauche', description: 'Mouvement horizontal latéral', complexity: 0.2 },
        { name: 'en zigzag', description: 'Mouvement en forme de Z', complexity: 0.6 },
        { name: 'répétitif', description: 'Mouvement qui se répète', complexity: 0.4 },
        { name: 'vers l\'avant', description: 'Mouvement d\'extension vers l\'avant', complexity: 0.3 },
        { name: 'vers soi', description: 'Mouvement de retrait vers le corps', complexity: 0.3 },
        { name: 'en arc', description: 'Mouvement en forme d\'arc de cercle', complexity: 0.5 },
        { name: 'alternant', description: 'Mouvement alternant entre les mains', complexity: 0.7 },
        { name: 'rapide et bref', description: 'Mouvement court et vif', complexity: 0.8 }
    ];

    /**
     * Expressions faciales LSF organisées par intensité
     * @private
     */
    private static readonly facialExpressions: readonly FacialExpression[] = [
        { name: 'sourcils levés', context: 'Question ou surprise', intensity: 'moderate' },
        { name: 'sourcils froncés', context: 'Concentration ou négation', intensity: 'strong' },
        { name: 'joues gonflées', context: 'Intensité ou grande quantité', intensity: 'strong' },
        { name: 'bouche en o', context: 'Surprise ou admiration', intensity: 'moderate' },
        { name: 'lèvres pincées', context: 'Petitesse ou précision', intensity: 'subtle' },
        { name: 'regard intense', context: 'Attention soutenue', intensity: 'strong' },
        { name: 'tête inclinée', context: 'Question ou réflexion', intensity: 'subtle' },
        { name: 'yeux plissés', context: 'Concentration ou méfiance', intensity: 'moderate' },
        { name: 'sourire', context: 'Joie ou accord', intensity: 'moderate' },
        { name: 'moue dubitative', context: 'Doute ou incertitude', intensity: 'subtle' }
    ];

    /**
     * Obtient une configuration de main aléatoire adaptée au niveau de difficulté
     * @param difficultyLevel Niveau de difficulté souhaité (optionnel)
     * @returns Configuration de main
     */
    public static getRandomHandShape(difficultyLevel?: DifficultyLevel): string {
        let availableShapes = this.handConfigurations;

        if (difficultyLevel) {
            const complexityOrder: Record<DifficultyLevel, number> = {
                'beginner': 1,
                'easy': 2,
                'medium': 3,
                'hard': 4,
                'expert': 5
            };

            const maxComplexity = complexityOrder[difficultyLevel];
            availableShapes = this.handConfigurations.filter(config =>
                complexityOrder[config.difficulty] <= maxComplexity
            );
        }

        const randomIndex = Math.floor(Math.random() * availableShapes.length);
        return availableShapes[randomIndex].name;
    }

    /**
     * Obtient un mouvement aléatoire adapté au niveau de complexité
     * @param maxComplexity Complexité maximale (0-1, optionnel)
     * @returns Description du mouvement
     */
    public static getRandomMovement(maxComplexity?: number): string {
        let availableMovements = this.movementTypes;

        if (maxComplexity !== undefined) {
            availableMovements = this.movementTypes.filter(movement =>
                movement.complexity <= maxComplexity
            );
        }

        const randomIndex = Math.floor(Math.random() * availableMovements.length);
        return availableMovements[randomIndex].name;
    }

    /**
     * Obtient une expression faciale aléatoire selon l'intensité souhaitée
     * @param intensity Intensité souhaitée (optionnelle)
     * @returns Description de l'expression faciale
     */
    public static getRandomFacialExpression(intensity?: 'subtle' | 'moderate' | 'strong'): string {
        let availableExpressions = this.facialExpressions;

        if (intensity) {
            availableExpressions = this.facialExpressions.filter(expr =>
                expr.intensity === intensity
            );
        }

        const randomIndex = Math.floor(Math.random() * availableExpressions.length);
        return availableExpressions[randomIndex].name;
    }

    /**
     * Simplifie un texte pour les débutants en LSF
     * @param text Texte à simplifier
     * @returns Texte simplifié avec vocabulaire adapté
     */
    public static simplifyText(text: string): string {
        const simplifications: Record<string, string> = {
            'dans le contexte de': 'pour',
            'exprimer': 'dire',
            'utilisé pour': 'pour',
            'communiquer': 'dire',
            'signification': 'sens',
            'configuration': 'forme',
            'orientation': 'direction',
            'mouvement complexe': 'mouvement',
            'expression faciale': 'visage',
            'paramètre': 'partie',
            'référentiel spatial': 'espace',
            'prosodie': 'rythme'
        };

        let simplifiedText = text;

        Object.entries(simplifications).forEach(([complex, simple]) => {
            const regex = new RegExp(complex, 'gi');
            simplifiedText = simplifiedText.replace(regex, simple);
        });

        return simplifiedText;
    }

    /**
     * Complexifie un texte pour les niveaux avancés
     * @param text Texte à complexifier
     * @returns Texte enrichi avec vocabulaire technique
     */
    public static makeTextMoreComplex(text: string): string {
        const complexifications: Record<string, string> = {
            'pour': 'dans le contexte spécifique de',
            'dire': 'communiquer précisément',
            'utilisé': 'employé formellement',
            'forme': 'configuration gestuelle',
            'direction': 'orientation spatiale',
            'mouvement': 'paramètre cinétique',
            'visage': 'expression non-manuelle',
            'espace': 'référentiel spatial tridimensionnel',
            'rythme': 'prosodie gestuelle'
        };

        let complexText = text;

        Object.entries(complexifications).forEach(([simple, complex]) => {
            const regex = new RegExp(`\\b${simple}\\b`, 'gi');
            complexText = complexText.replace(regex, complex);
        });

        return complexText;
    }

    /**
     * Génère une question pour un concept en fonction de la difficulté
     * @param conceptName Nom du concept
     * @param example Exemple à utiliser dans la question
     * @param difficulty Niveau de difficulté
     * @param conceptDescription Description du concept
     * @param relatedConcept Concept lié (optionnel)
     * @param category Catégorie du concept (optionnelle)
     * @returns Question générée et adaptée au niveau
     */
    public static generateQuestionByDifficulty(
        conceptName: string,
        example: string,
        difficulty: DifficultyLevel,
        conceptDescription: string,
        relatedConcept?: string,
        category?: string
    ): string {
        // Templates de questions selon la difficulté
        const questionTemplates: Record<DifficultyLevel, readonly string[]> = {
            'beginner': [
                `Quel est le signe LSF pour "${example}"?`,
                `Comment signe-t-on "${example}" en LSF?`,
                `Parmi ces signes, lequel correspond à "${example}"?`
            ],
            'easy': [
                `Quel signe utilise-t-on pour exprimer "${example}" dans une conversation?`,
                `Dans une discussion sur ${conceptName}, quel signe utiliserait-on pour "${example}"?`,
                `Identifiez le signe correct pour exprimer "${example}"`
            ],
            'medium': [
                `Comment exprimerait-on "${example}" dans le contexte de ${conceptDescription}?`,
                `Quel est le signe approprié pour "${example}" lorsqu'on parle de ${relatedConcept || conceptName}?`,
                `En tenant compte du contexte ${category || conceptName}, quel signe représente "${example}"?`
            ],
            'hard': [
                `Dans une conversation complexe sur ${conceptDescription}, comment signerait-on précisément "${example}"?`,
                `Quel signe permettrait de nuancer "${example}" dans un discours formel?`,
                `Comment exprimerait-on les subtilités de "${example}" lors d'une interprétation professionnelle?`
            ],
            'expert': [
                `Dans un contexte académique portant sur ${conceptDescription}, quel serait le signe le plus précis pour "${example}"?`,
                `Comment un interprète professionnel signerait-il "${example}" lors d'une conférence spécialisée sur ${category || conceptName}?`,
                `En tenant compte des variations régionales, quel est le signe standard pour "${example}" dans le cadre de ${conceptDescription}?`
            ]
        };

        // Sélection aléatoire d'un template de question
        const templates = questionTemplates[difficulty];
        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }

    /**
     * Génère une description détaillée pour un exercice de type glisser-déposer
     * @param example Exemple à décrire
     * @param conceptDescription Description du concept
     * @returns Description générée avec contexte approprié
     */
    public static generateDescriptionForExample(example: string, conceptDescription: string): string {
        const templates = [
            `Signe utilisé pour exprimer "${example}" dans le contexte de ${conceptDescription}`,
            `Expression en LSF de "${example}" dans les situations liées à ${conceptDescription}`,
            `Signe correspondant à "${example}" qu'on utilise lorsqu'on parle de ${conceptDescription}`,
            `Représentation gestuelle de "${example}" spécifique au domaine de ${conceptDescription}`,
            `Configuration LSF pour "${example}" employée dans le cadre de ${conceptDescription}`
        ];

        const randomIndex = Math.floor(Math.random() * templates.length);
        return templates[randomIndex];
    }

    /**
     * Génère une option distractrice réaliste pour un exercice à choix multiples
     * @param difficulty Niveau de difficulté pour adapter la complexité du distracteur
     * @returns Description d'un signe incorrect mais plausible
     */
    public static generateDistractorOption(difficulty: DifficultyLevel = 'medium'): string {
        const handShape = this.getRandomHandShape(difficulty);
        const movement = this.getRandomMovement(difficulty === 'expert' ? 1.0 : 0.6);
        const expression = this.getRandomFacialExpression();

        return `Configuration: mains en ${handShape}, mouvement ${movement}, expression: ${expression}`;
    }

    /**
     * Génère des synonymes ou termes associés pour un concept LSF
     * @param conceptId ID du concept
     * @returns Liste de synonymes ou termes associés pertinents
     */
    public static generateSynonymsForConcept(conceptId: string): readonly string[] {
        // Base de données de synonymes organisée par concept
        const synonymsByConceptId: Record<string, readonly string[]> = {
            'greetings': ['salut', 'bienvenue', 'salutations', 'coucou', 'hey', 'bonsoir', 'bonne nuit'],
            'questions-forms': ['interrogation', 'demande', 'requête', 'questionnement', 'enquête', 'qui', 'que', 'quoi'],
            'facial-expressions': ['mimique', 'visage expressif', 'expression', 'émotion faciale', 'regard', 'sourcils', 'bouche'],
            'spatial-grammar': ['espace de signation', 'référencement spatial', 'pointage', 'locus', 'placement', 'localisation'],
            'politeness': ['courtoisie', 'savoir-vivre', 'respect', 'merci', 's\'il vous plaît', 'excusez-moi'],
            'family': ['parenté', 'famille', 'mère', 'père', 'enfant', 'frère', 'sœur', 'grand-parent'],
            'emotions': ['sentiments', 'états d\'âme', 'joie', 'tristesse', 'colère', 'peur', 'surprise'],
            'time': ['temporalité', 'durée', 'moment', 'hier', 'aujourd\'hui', 'demain', 'heure'],
            'colors': ['couleurs', 'teintes', 'rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc'],
            'numbers': ['chiffres', 'quantité', 'un', 'deux', 'trois', 'beaucoup', 'peu', 'rien']
        };

        return synonymsByConceptId[conceptId] || ['terme générique', 'concept associé', 'notion liée', 'élément connexe', 'variante'];
    }

    /**
     * Génère un texte à trous adapté pour un concept donné
     * @param conceptId ID du concept
     * @param examples Exemples du concept
     * @param conceptName Nom du concept 
     * @returns Objet contenant le texte à trous, les blancs et les options
     */
    public static generateBlankTextForConcept(
        conceptId: string,
        examples: readonly string[],
        conceptName: string
    ): BlankTextResult {
        // Templates de textes à trous organisés par concept
        const textTemplates: Record<string, string> = {
            'greetings': `Lorsque vous rencontrez quelqu'un en LSF, vous pouvez utiliser le signe [BLANK1] pour dire bonjour. Si c'est le matin, vous pouvez préciser en ajoutant le signe [BLANK2]. Pour prendre congé, le signe [BLANK3] est couramment utilisé.`,

            'questions-forms': `En LSF, pour poser une question ouverte, vous utilisez généralement le signe [BLANK1] à la fin de votre phrase. Pour demander "où", le signe [BLANK2] est accompagné d'une expression faciale interrogative. Pour demander "pourquoi", on utilise le signe [BLANK3].`,

            'facial-expressions': `L'expression faciale [BLANK1] est essentielle pour marquer une question en LSF. Pour exprimer la négation, on utilise l'expression [BLANK2] accompagnée d'un mouvement de tête. L'intensité d'une émotion ou d'une action peut être modulée par [BLANK3].`,

            'spatial-grammar': `En LSF, l'espace devant le signeur est utilisé pour [BLANK1] les référents du discours. La technique [BLANK2] permet de désigner ces référents une fois qu'ils sont placés. Pour exprimer une relation entre deux éléments, on utilise [BLANK3].`,

            'politeness': `Les formules de politesse en LSF incluent [BLANK1] pour exprimer la gratitude. Quand on veut demander quelque chose poliment, on utilise [BLANK2]. Pour s'excuser, le signe approprié est [BLANK3].`,

            'family': `Dans le vocabulaire familial LSF, [BLANK1] désigne le parent masculin. Le terme [BLANK2] fait référence au parent féminin. Pour parler des descendants, on utilise le signe [BLANK3].`,

            'emotions': `Pour exprimer la joie en LSF, on utilise [BLANK1] avec une expression faciale appropriée. La tristesse se manifeste par [BLANK2]. Pour montrer la surprise, le signe [BLANK3] est accompagné d'une expression marquée.`,

            'time': `En LSF, pour indiquer le passé, on signe [BLANK1] en pointant vers l'arrière. Le présent s'exprime par [BLANK2]. Pour le futur, on utilise [BLANK3] en dirigeant le geste vers l'avant.`,

            'colors': `La couleur [BLANK1] se signe en référence au sang ou aux roses. Pour [BLANK2], on fait référence au ciel ou à l'océan. La couleur [BLANK3] évoque la nature et les feuilles.`,

            'numbers': `En LSF, le chiffre [BLANK1] se forme avec l'index tendu. Pour [BLANK2], on tend deux doigts. Le nombre [BLANK3] utilise trois doigts distincts.`
        };

        // Utiliser le template approprié ou un template générique
        const baseText = textTemplates[conceptId] ||
            `Le concept ${conceptName} est important en LSF. Il implique [BLANK1] et [BLANK2]. Pour bien le maîtriser, il faut pratiquer [BLANK3].`;

        // Création des blancs avec les exemples fournis
        const blanks = [
            { id: 'blank1', correctAnswer: examples[0] || 'exemple1' },
            { id: 'blank2', correctAnswer: examples[1] || 'exemple2' },
            { id: 'blank3', correctAnswer: examples[2] || 'exemple3' }
        ];

        // Génération d'options supplémentaires (distracteurs)
        const synonyms = this.generateSynonymsForConcept(conceptId);
        const additionalOptions = synonyms.slice(0, 4); // Prendre 4 distracteurs

        // Combinaison des réponses correctes et des distracteurs
        const correctAnswers = blanks.map(blank => blank.correctAnswer);
        const allOptions = [...correctAnswers, ...additionalOptions];

        // Mélanger les options de manière déterministe mais aléatoire
        const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);

        return {
            text: baseText,
            blanks,
            options: shuffledOptions
        };
    }

    /**
     * Valide si un niveau de difficulté est valide
     * @param difficulty Niveau à valider
     * @returns True si le niveau est valide
     */
    public static isValidDifficultyLevel(difficulty: string): difficulty is DifficultyLevel {
        const validLevels: readonly DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
        return validLevels.includes(difficulty as DifficultyLevel);
    }

    /**
     * Convertit un score numérique (0-1) en niveau de difficulté
     * @param score Score numérique entre 0 et 1
     * @returns Niveau de difficulté correspondant
     */
    public static scoreToDifficultyLevel(score: number): DifficultyLevel {
        const normalizedScore = Math.max(0, Math.min(1, score));

        if (normalizedScore <= 0.2) return 'beginner';
        if (normalizedScore <= 0.4) return 'easy';
        if (normalizedScore <= 0.6) return 'medium';
        if (normalizedScore <= 0.8) return 'hard';
        return 'expert';
    }

    /**
     * Convertit un niveau de difficulté en score numérique
     * @param difficulty Niveau de difficulté
     * @returns Score numérique correspondant (0-1)
     */
    public static difficultyLevelToScore(difficulty: DifficultyLevel): number {
        const scoreMap: Record<DifficultyLevel, number> = {
            'beginner': 0.1,
            'easy': 0.3,
            'medium': 0.5,
            'hard': 0.7,
            'expert': 0.9
        };

        return scoreMap[difficulty];
    }
}