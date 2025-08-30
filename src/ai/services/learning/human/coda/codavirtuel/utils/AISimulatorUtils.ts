/**
 * @file src/ai/services/learning/human/coda/codavirtuel/utils/AISimulatorUtils.ts
 * @description Utilitaires pour le simulateur d'IA-élève révolutionnaire
 * 
 * Fonctionnalités :
 * - 🎯 Fonctions utilitaires pour simulation IA
 * - 🧠 Calculs de compréhension avancés
 * - 💬 Génération de réactions intelligentes
 * - 🔧 Compatible exactOptionalPropertyTypes: true
 * 
 * @module utils
 * @version 1.0.0 - Utilitaires révolutionnaires
 * @since 2025
 * @author MetaSign Team - CODA Utils
 * @lastModified 2025-07-04
 */

import type {
    ComprehensiveAIStatus,
    AIStudentPersonalityType,
    EmotionalState,
    EvolutionMetrics,
    AIPersonalityProfile
} from '../types/index';

/**
 * Détermine les faiblesses initiales basées sur le type de personnalité
 * 
 * @param personalityType - Type de personnalité de l'IA-élève
 * @returns Liste des faiblesses initiales
 */
export function determineInitialWeaknesses(personalityType: AIStudentPersonalityType): readonly string[] {
    const weaknessMap: Partial<Record<AIStudentPersonalityType, string[]>> = {
        'curious_student': ['attention_sustained', 'basic_grammar', 'patience_learning'],
        'shy_learner': ['confidence_expression', 'active_participation', 'question_asking'],
        'energetic_pupil': ['focus_details', 'calm_concentration', 'methodical_approach'],
        'patient_apprentice': ['learning_speed', 'spontaneous_reaction', 'quick_adaptation']
    };

    return weaknessMap[personalityType] || weaknessMap['curious_student'] || [];
}

/**
 * Détermine les forces initiales basées sur le type de personnalité
 * 
 * @param personalityType - Type de personnalité de l'IA-élève
 * @returns Liste des forces initiales
 */
export function determineInitialStrengths(personalityType: AIStudentPersonalityType): readonly string[] {
    const strengthMap: Partial<Record<AIStudentPersonalityType, string[]>> = {
        'curious_student': ['motivation_high', 'exploration_desire', 'question_generation'],
        'shy_learner': ['observation_careful', 'reflection_deep', 'attention_detail'],
        'energetic_pupil': ['enthusiasm_learning', 'quick_understanding', 'energy_positive'],
        'patient_apprentice': ['persistence_strong', 'methodical_learning', 'calm_approach']
    };

    return strengthMap[personalityType] || strengthMap['curious_student'] || [];
}

/**
 * Calcule la compréhension avancée avec multiples facteurs
 * 
 * @param aiStudent - Statut de l'IA-élève
 * @param concept - Concept enseigné
 * @param explanation - Explication donnée
 * @param teachingMethod - Méthode d'enseignement
 * @param relatedMemories - Souvenirs pertinents
 * @returns Score de compréhension (0-1)
 */
export function calculateAdvancedComprehension(
    aiStudent: ComprehensiveAIStatus,
    concept: string,
    _explanation: string,
    teachingMethod: string,
    // _relatedMemories: readonly LearningMemory[] // Paramètre commenté car non utilisé
): number {
    // Facteur de base lié à la personnalité
    const personalityFactor = calculatePersonalityComprehensionFactor(
        aiStudent.personalityProfile, teachingMethod
    );

    // Facteur de mémoire basé sur les souvenirs pertinents
    // Facteur mémoire simplifié car relatedMemories n'est plus utilisé
    const memoryFactor = 0.3; // Valeur par défaut

    // Facteur émotionnel
    const emotionalFactor = calculateEmotionalComprehensionFactor(aiStudent.emotionalState);

    // Facteur de complexité du concept
    const conceptComplexity = calculateConceptComplexity(concept);
    const complexityFactor = Math.max(0.1, 1 - conceptComplexity * 0.3);

    // Facteur de méthode d'enseignement
    const methodFactor = calculateTeachingMethodEffectiveness(teachingMethod, aiStudent.personality);

    // Calcul de compréhension composite
    const baseComprehension = (personalityFactor * 0.3 + memoryFactor * 0.2 + emotionalFactor * 0.2 +
        complexityFactor * 0.15 + methodFactor * 0.15);

    // Ajouter du bruit réaliste
    const noise = (Math.random() - 0.5) * 0.2;
    const finalComprehension = Math.max(0.1, Math.min(0.95, baseComprehension + noise));

    return Math.round(finalComprehension * 100) / 100;
}

/**
 * Génère une réaction avancée de l'IA-élève
 * 
 * @param aiStudent - Statut de l'IA-élève
 * @param emotionalState - État émotionnel actuel
 * @param comprehension - Score de compréhension
 * @param concept - Concept appris
 * @returns Réaction textuelle de l'IA
 */
export function generateAdvancedReaction(
    aiStudent: ComprehensiveAIStatus,
    emotionalState: EmotionalState,
    comprehension: number,
    concept: string
): string {
    const personality = aiStudent.personality;
    const emotion = emotionalState.primaryEmotion;

    // Templates de réactions par personnalité et compréhension
    const reactionTemplates = getReactionTemplates(personality);

    let selectedTemplate: string;

    if (comprehension > 0.8) {
        selectedTemplate = reactionTemplates.high[Math.floor(Math.random() * reactionTemplates.high.length)];
    } else if (comprehension > 0.5) {
        selectedTemplate = reactionTemplates.medium[Math.floor(Math.random() * reactionTemplates.medium.length)];
    } else {
        selectedTemplate = reactionTemplates.low[Math.floor(Math.random() * reactionTemplates.low.length)];
    }

    // Personnaliser avec le concept et l'émotion
    return selectedTemplate
        .replace('{concept}', concept)
        .replace('{emotion}', getEmotionExpression(emotion))
        .replace('{name}', aiStudent.name);
}

/**
 * Génère une question contextuelle de l'IA-élève
 * 
 * @param comprehension - Score de compréhension
 * @param concept - Concept concerné
 * @param personalityProfile - Profil de personnalité
 * @param emotionalState - État émotionnel
 * @returns Question générée ou undefined
 */
export function generateContextualQuestion(
    comprehension: number,
    concept: string,
    personalityProfile: AIPersonalityProfile,
    // _emotionalState: EmotionalState // Paramètre commenté car non utilisé
): string | undefined {
    // Probabilité de poser une question basée sur la personnalité
    const questionProbability = calculateQuestionProbability(personalityProfile, comprehension);

    if (Math.random() > questionProbability) {
        return undefined;
    }

    const questionTypes = getQuestionTypes(comprehension);
    const selectedType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    return generateQuestionByType(selectedType, concept);
}

/**
 * Génère une erreur intelligente de l'IA-élève
 * 
 * @param comprehension - Score de compréhension
 * @param concept - Concept concerné
 * @param relatedMemories - Souvenirs pertinents
 * @returns Erreur générée ou undefined
 */
export function generateIntelligentError(
    comprehension: number,
    concept: string,
    // _relatedMemories: readonly LearningMemory[] // Paramètre commenté car non utilisé
): string | undefined {
    // Probabilité d'erreur inversement proportionnelle à la compréhension
    const errorProbability = Math.max(0.05, (1 - comprehension) * 0.7);

    if (Math.random() > errorProbability) {
        return undefined;
    }

    // Types d'erreurs basées sur la compréhension
    const errorTypes = getErrorTypes(comprehension);
    const selectedError = errorTypes[Math.floor(Math.random() * errorTypes.length)];

    return generateErrorByType(selectedError, concept);
}

/**
 * Calcule la confiance avancée
 * 
 * @param comprehension - Score de compréhension
 * @param personalityProfile - Profil de personnalité
 * @param emotionalState - État émotionnel
 * @returns Score de confiance (0-1)
 */
export function calculateAdvancedConfidence(
    comprehension: number,
    personalityProfile: AIPersonalityProfile,
    emotionalState: EmotionalState
): number {
    // Facteur de base lié à la compréhension
    const baseFactor = comprehension;

    // Facteur de personnalité (conscientiousness influence la confiance)
    const personalityFactor = personalityProfile.bigFiveTraits.conscientiousness;

    // Facteur émotionnel (emotions positives augmentent la confiance)
    const emotionalFactor = calculateEmotionalConfidenceFactor(emotionalState);

    // Calcul composite
    const confidence = (baseFactor * 0.5 + personalityFactor * 0.3 + emotionalFactor * 0.2);

    return Math.max(0.1, Math.min(0.95, confidence));
}

/**
 * Génère des suggestions d'amélioration
 * 
 * @param aiStudent - Statut de l'IA-élève
 * @param comprehension - Score de compréhension
 * @param evolutionMetrics - Métriques d'évolution
 * @returns Liste des suggestions
 */
export function generateImprovementSuggestions(
    aiStudent: ComprehensiveAIStatus,
    comprehension: number,
    evolutionMetrics: EvolutionMetrics
): readonly string[] {
    const suggestions: string[] = [];

    // Suggestions basées sur la compréhension
    if (comprehension < 0.5) {
        suggestions.push("Essayez une approche plus visuelle avec des exemples concrets");
        suggestions.push("Décomposez le concept en étapes plus petites");
    } else if (comprehension > 0.8) {
        suggestions.push("Excellent ! Essayez maintenant des concepts plus avancés");
        suggestions.push("Pratiquez avec des variations de ce concept");
    }

    // Suggestions basées sur les faiblesses
    for (const weakness of aiStudent.weaknesses) {
        if (weakness.includes('attention')) {
            suggestions.push("Faites des pauses plus fréquentes pour maintenir l'attention");
        }
        if (weakness.includes('confidence')) {
            suggestions.push("Encouragez davantage et célébrez les petites réussites");
        }
    }

    // Suggestions basées sur l'évolution
    // learningEfficiency n'existe pas dans EvolutionMetrics, on utilise une estimation
    const estimatedEfficiency = evolutionMetrics.recentSuccessRate * evolutionMetrics.globalConfidence;
    if (estimatedEfficiency < 0.6) {
        suggestions.push("Adaptez le rythme d'enseignement aux besoins de l'élève");
    }

    return suggestions.slice(0, 3); // Limiter à 3 suggestions maximum
}

/**
 * Met à jour le statut de l'IA-élève
 * 
 * @param aiStudent - Statut actuel
 * @param emotionalState - Nouvel état émotionnel
 * @param evolutionMetrics - Nouvelles métriques
 * @param learningTime - Temps d'apprentissage additionnel
 */
export function updateAIStudentStatus(
    aiStudent: ComprehensiveAIStatus,
    emotionalState: EmotionalState,
    evolutionMetrics: EvolutionMetrics,
    learningTime: number
): void {
    // Mutation contrôlée du statut (pas idéal mais nécessaire pour l'architecture actuelle)
    (aiStudent as { emotionalState: EmotionalState }).emotionalState = emotionalState;
    (aiStudent as { evolutionMetrics: EvolutionMetrics }).evolutionMetrics = evolutionMetrics;
    (aiStudent as { totalLearningTime: number }).totalLearningTime += learningTime;

    // Mettre à jour l'humeur basée sur l'émotion
    const moodMap: Record<string, string> = {
        'joy': 'happy',
        'sadness': 'confused',
        'fear': 'confused',
        'anger': 'frustrated',
        'surprise': 'excited',
        'neutral': 'neutral'
    };

    const newMood = moodMap[emotionalState.primaryEmotion] || 'neutral';
    (aiStudent as { mood: string }).mood = newMood;
}

// ==================== FONCTIONS UTILITAIRES PRIVÉES ====================

/**
 * Calcule le facteur de compréhension lié à la personnalité
 */
function calculatePersonalityComprehensionFactor(
    personality: AIPersonalityProfile,
    teachingMethod: string
): number {
    const methodPreferences: Record<string, number> = {
        'visual': personality.bigFiveTraits.openness,
        'demonstration': personality.bigFiveTraits.conscientiousness,
        'interactive': personality.bigFiveTraits.extraversion,
        'explanation': personality.bigFiveTraits.openness * 0.8
    };

    return methodPreferences[teachingMethod] || 0.5;
}

/**
 * Calcule le facteur émotionnel de compréhension
 */
function calculateEmotionalComprehensionFactor(emotionalState: EmotionalState): number {
    const emotionFactors: Record<string, number> = {
        'joy': 0.9,
        'excitement': 0.85,
        'neutral': 0.7,
        'surprise': 0.6,
        'sadness': 0.4,
        'fear': 0.3,
        'anger': 0.2
    };

    return emotionFactors[emotionalState.primaryEmotion] || 0.5;
}

/**
 * Calcule la complexité d'un concept
 */
function calculateConceptComplexity(concept: string): number {
    const complexityMap: Record<string, number> = {
        'basic_greetings': 0.1,
        'numbers': 0.2,
        'colors': 0.15,
        'family': 0.3,
        'spatial_grammar': 0.8,
        'complex_sentences': 0.9,
        'cultural_expressions': 0.7
    };

    return complexityMap[concept] || 0.5;
}

/**
 * Calcule l'efficacité d'une méthode d'enseignement
 */
function calculateTeachingMethodEffectiveness(
    method: string,
    personality: string
): number {
    const effectivenessMap: Record<string, Record<string, number>> = {
        'curious_student': {
            'visual': 0.9,
            'demonstration': 0.8,
            'interactive': 0.95,
            'explanation': 0.7
        },
        'shy_learner': {
            'visual': 0.8,
            'demonstration': 0.9,
            'interactive': 0.6,
            'explanation': 0.85
        },
        'energetic_pupil': {
            'visual': 0.85,
            'demonstration': 0.7,
            'interactive': 0.95,
            'explanation': 0.6
        },
        'patient_apprentice': {
            'visual': 0.75,
            'demonstration': 0.95,
            'interactive': 0.8,
            'explanation': 0.9
        }
    };

    return effectivenessMap[personality]?.[method] || 0.7;
}

/**
 * Obtient les templates de réactions par personnalité
 */
function getReactionTemplates(personality: string): { high: string[]; medium: string[]; low: string[] } {
    const templates = {
        'curious_student': {
            high: [
                "Wow ! Je comprends parfaitement {concept} ! {emotion} C'est fascinant !",
                "Génial ! {concept} c'est exactement ce que je pensais ! {emotion}",
                "Super ! Maintenant je vois comment {concept} fonctionne ! {emotion}"
            ],
            medium: [
                "OK, je pense que je comprends {concept}... {emotion}",
                "Hmm, {concept} commence à avoir du sens pour moi {emotion}",
                "Je crois que je saisis l'idée de {concept} {emotion}"
            ],
            low: [
                "Euh... {concept} c'est encore un peu flou pour moi {emotion}",
                "Je ne suis pas sûr de bien comprendre {concept}... {emotion}",
                "Pouvez-vous m'expliquer {concept} différemment ? {emotion}"
            ]
        },
        'shy_learner': {
            high: [
                "Je... je pense que je comprends {concept} maintenant {emotion}",
                "Oh ! {concept} c'est plus clair maintenant, merci {emotion}",
                "{concept} commence à faire sens... {emotion}"
            ],
            medium: [
                "Peut-être que {concept}... oui, je vois un peu {emotion}",
                "Je crois comprendre une partie de {concept} {emotion}",
                "{concept}... c'est intéressant {emotion}"
            ],
            low: [
                "Désolé, je ne comprends pas bien {concept}... {emotion}",
                "C'est difficile pour moi, {concept} {emotion}",
                "J'ai besoin d'aide avec {concept} {emotion}"
            ]
        },
        'energetic_pupil': {
            high: [
                "OUI ! {concept} c'est GÉNIAL ! {emotion} Je veux en apprendre plus !",
                "SUPER ! {concept} c'est trop cool ! {emotion}",
                "J'ADORE {concept} ! {emotion} C'est fantastique !"
            ],
            medium: [
                "Cool ! {concept} c'est sympa ! {emotion}",
                "Ah oui ! {concept} je commence à voir ! {emotion}",
                "{concept} c'est intéressant ! {emotion}"
            ],
            low: [
                "Hein ? {concept} c'est compliqué ! {emotion}",
                "Je ne comprends pas {concept}... {emotion}",
                "Aidez-moi avec {concept} ! {emotion}"
            ]
        },
        'patient_apprentice': {
            high: [
                "Parfait. Je comprends {concept} maintenant. {emotion}",
                "Excellent. {concept} est maintenant clair pour moi. {emotion}",
                "Merci. {concept} fait sens maintenant. {emotion}"
            ],
            medium: [
                "Je vois. {concept} devient plus clair. {emotion}",
                "D'accord. Je commence à saisir {concept}. {emotion}",
                "Intéressant. {concept} mérite réflexion. {emotion}"
            ],
            low: [
                "Je vois que {concept} nécessite plus d'attention. {emotion}",
                "Je dois réfléchir davantage à {concept}. {emotion}",
                "Puis-je avoir plus d'explications sur {concept} ? {emotion}"
            ]
        }
    };

    return templates[personality as keyof typeof templates] || templates['curious_student'];
}

/**
 * Obtient l'expression d'une émotion
 */
function getEmotionExpression(emotion: string): string {
    const expressions: Record<string, string> = {
        'joy': '😊',
        'excitement': '🤩',
        'surprise': '😮',
        'confusion': '🤔',
        'sadness': '😔',
        'fear': '😰',
        'anger': '😤',
        'neutral': '😐'
    };

    return expressions[emotion] || '🙂';
}

/**
 * Calcule la probabilité de poser une question
 */
function calculateQuestionProbability(
    personality: AIPersonalityProfile,
    comprehension: number
): number {
    const baseProbability = personality.bigFiveTraits.openness * 0.6;
    const comprehensionFactor = comprehension < 0.7 ? 0.8 : 0.3;

    return Math.min(0.8, baseProbability + comprehensionFactor * 0.4);
}

/**
 * Obtient les types de questions basés sur la compréhension
 */
function getQuestionTypes(comprehension: number /* _concept: string */): string[] {
    if (comprehension > 0.7) {
        return ['extension', 'application', 'comparison'];
    } else if (comprehension > 0.4) {
        return ['clarification', 'example', 'repetition'];
    } else {
        return ['basic', 'help', 'simplification'];
    }
}

/**
 * Génère une question par type
 */
function generateQuestionByType(type: string, concept: string /* _personality: string */): string {
    const questionTemplates: Record<string, string[]> = {
        'extension': [
            `Et qu'est-ce qui vient après {concept} ?`,
            `Comment {concept} se connecte avec d'autres signes ?`,
            `Y a-t-il des variantes de {concept} ?`
        ],
        'clarification': [
            `Pouvez-vous répéter la partie sur {concept} ?`,
            `Je ne suis pas sûr de {concept}, pouvez-vous clarifier ?`,
            `Qu'est-ce que vous voulez dire exactement par {concept} ?`
        ],
        'basic': [
            `Qu'est-ce que {concept} exactement ?`,
            `Comment faire {concept} ?`,
            `Pouvez-vous me montrer {concept} encore ?`
        ]
    };

    const templates = questionTemplates[type] || questionTemplates['basic'];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template.replace('{concept}', concept);
}

/**
 * Obtient les types d'erreurs
 */
function getErrorTypes(comprehension: number /* _memories: readonly LearningMemory[] */): string[] {
    if (comprehension < 0.3) {
        return ['fundamental', 'confusion'];
    } else if (comprehension < 0.6) {
        return ['partial', 'interference'];
    } else {
        return ['minor', 'detail'];
    }
}

/**
 * Génère une erreur par type
 */
function generateErrorByType(type: string, concept: string): string {
    const errorTemplates: Record<string, string[]> = {
        'fundamental': [
            `Je pense que {concept} c'est comme... non, attendez...`,
            `{concept} c'est quand on... euh... je me trompe ?`,
            `Est-ce que {concept} c'est la même chose que... non ?`
        ],
        'partial': [
            `Je fais {concept} comme ça... mais je ne suis pas sûr de la fin`,
            `{concept} c'est presque ça, mais il manque quelque chose`,
            `Je pense que j'ai presque {concept} mais...`
        ],
        'detail': [
            `{concept} c'est bien comme ça, juste cette petite partie...`,
            `J'ai {concept} mais est-ce que ma main est au bon endroit ?`,
            `{concept} est correct mais l'expression du visage ?`
        ]
    };

    const templates = errorTemplates[type] || errorTemplates['partial'];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return template.replace('{concept}', concept);
}

/**
 * Calcule le facteur émotionnel de confiance
 */
function calculateEmotionalConfidenceFactor(emotionalState: EmotionalState): number {
    const confidenceMap: Record<string, number> = {
        'joy': 0.9,
        'excitement': 0.85,
        'surprise': 0.6,
        'neutral': 0.7,
        'confusion': 0.4,
        'sadness': 0.3,
        'fear': 0.2,
        'anger': 0.25
    };

    return confidenceMap[emotionalState.primaryEmotion] || 0.5;
}