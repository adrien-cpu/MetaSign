// src/ai/systems/expressions/cultural/__tests__/utils/helpers/ScenarioUtils.ts

/**
 * Utilitaires partagés pour la manipulation de scénarios
 */

/**
 * Génère une description à partir d'une clé de défi
 * @param key Clé du défi
 * @returns Description textuelle
 */
export function describeChallengeFromKey(key: string): string {
    // Transformer la clé en texte lisible
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Extrait les mots-clés d'une chaîne
 * @param text Texte à analyser
 * @returns Mots-clés extraits
 */
export function extractKeywords(text: string): string[] {
    // Convertir en minuscules et diviser en mots
    const words = text.toLowerCase().split(/\s+/);

    // Filtrer les mots vides
    const stopwords = ['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'de', 'du', 'au', 'aux'];
    return words.filter(word =>
        word.length > 3 && !stopwords.includes(word)
    );
}

/**
 * Vérifie si une action est liée à un élément culturel
 * @param action Action prise
 * @param culturalElement Élément culturel à vérifier
 * @returns Vrai si l'action est liée à l'élément culturel
 */
export function isRelatedToCultural(action: string, culturalElement: string): boolean {
    // Extraire les mots-clés des deux chaînes
    const actionKeywords = extractKeywords(action);
    const elementKeywords = extractKeywords(culturalElement);

    // Vérifier le chevauchement des mots-clés
    const overlap = actionKeywords.filter(keyword =>
        elementKeywords.includes(keyword)
    );

    return overlap.length >= 2; // Au moins 2 mots-clés en commun
}

/**
 * Calcule la pertinence contextuelle d'une liste d'actions
 * @param actions Actions à évaluer
 * @returns Score de pertinence contextuelle
 */
export function calculateContextualRelevance(actions: string[]): number {
    // Simulation simple basée sur le nombre d'actions
    return Math.min(10, actions.length * 2);
}

/**
 * Calcule la pertinence contextuelle en situation d'urgence
 * @param actions Actions d'urgence à évaluer
 * @returns Score de pertinence contextuelle
 */
export function calculateEmergencyContextRelevance(actions: string[]): number {
    // Plus d'actions d'urgence = meilleure pertinence, mais avec un plafond
    return Math.min(10, actions.length * 2.5);
}

/**
 * Catégorise un mécanisme d'adaptation
 * @param mechanism Mécanisme à catégoriser
 * @returns Catégorie du mécanisme
 */
export function categorizeAdaptationMechanism(mechanism: string): string {
    if (mechanism.includes('communication') || mechanism.includes('signal')) {
        return 'COMMUNICATION';
    } else if (mechanism.includes('coordination') || mechanism.includes('group')) {
        return 'COORDINATION';
    } else if (mechanism.includes('resource') || mechanism.includes('material')) {
        return 'RESOURCE';
    } else if (mechanism.includes('technical') || mechanism.includes('system')) {
        return 'TECHNICAL';
    } else {
        return 'OTHER';
    }
}

/**
 * Catégorise une action
 * @param action Action à catégoriser
 * @param domain Domaine de l'action
 * @returns Catégorie de l'action
 */
export function categorizeAction(action: string, domain: string): string {
    // Simplification pour le test
    return `${domain}_${action.length % 3}`;
}

/**
 * Extrait le cœur d'un message de faiblesse
 * @param weakness Message de faiblesse
 * @returns Partie centrale du message
 */
export function extractCore(weakness: string): string {
    // Extraire la partie après le dernier ":"
    const parts = weakness.split(':');
    return parts.length > 1 ? parts[parts.length - 1].trim() : weakness;
}

/**
 * Vérifie si une action répond à un défi d'urgence
 * @param action Action prise
 * @param challenge Défi à adresser
 * @returns Vrai si l'action répond au défi
 */
export function isActionAddressingEmergencyChallenge(
    action: string,
    challenge: { impact: string[] }
): boolean {
    // Vérifier si l'action adresse l'un des impacts du défi
    return challenge.impact.some(impact =>
        action.toUpperCase().includes(impact)
    );
}