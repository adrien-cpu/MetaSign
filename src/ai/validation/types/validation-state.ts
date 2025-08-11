// src/ai/validation/types/validation-state.ts

/**
 * États possibles pour une validation collaborative
 */
export enum ValidationState {
    /** État initial ou inconnu */
    UNKNOWN = 'UNKNOWN',

    /** Validation soumise, en attente de traitement */
    SUBMITTED = 'SUBMITTED',

    /** En attente de validation */
    PENDING = 'PENDING',

    /** En cours de revue */
    IN_REVIEW = 'IN_REVIEW',

    /** Collecte de feedback en cours */
    FEEDBACK_COLLECTING = 'FEEDBACK_COLLECTING',

    /** Calcul du consensus en cours */
    CONSENSUS_CALCULATING = 'CONSENSUS_CALCULATING',

    /** Consensus atteint */
    CONSENSUS_REACHED = 'CONSENSUS_REACHED',

    /** Nécessite des améliorations avant approbation */
    NEEDS_IMPROVEMENT = 'NEEDS_IMPROVEMENT',

    /** Validation approuvée */
    APPROVED = 'APPROVED',

    /** Validation rejetée */
    REJECTED = 'REJECTED',

    /** Validation intégrée dans le système */
    INTEGRATED = 'INTEGRATED',

    /** Validation annulée */
    CANCELLED = 'CANCELLED',

    /** Validation expirée (délai dépassé) */
    EXPIRED = 'EXPIRED'
}

/**
 * Groupe les états par catégorie
 */
export const ValidationStateGroups = {
    /** États actifs requérant une action */
    active: [
        ValidationState.SUBMITTED,
        ValidationState.PENDING,
        ValidationState.IN_REVIEW,
        ValidationState.FEEDBACK_COLLECTING,
        ValidationState.CONSENSUS_CALCULATING,
        ValidationState.NEEDS_IMPROVEMENT
    ],

    /** États terminaux ne requérant plus d'action */
    terminal: [
        ValidationState.APPROVED,
        ValidationState.REJECTED,
        ValidationState.INTEGRATED,
        ValidationState.CANCELLED,
        ValidationState.EXPIRED
    ],

    /** États positifs */
    positive: [
        ValidationState.APPROVED,
        ValidationState.INTEGRATED
    ],

    /** États négatifs */
    negative: [
        ValidationState.REJECTED,
        ValidationState.CANCELLED,
        ValidationState.EXPIRED
    ]
};

/**
 * Vérifie si un état est terminal (ne nécessite plus d'action)
 * @param state État à vérifier
 * @returns Vrai si l'état est terminal
 */
export function isTerminalState(state: ValidationState): boolean {
    return ValidationStateGroups.terminal.includes(state);
}

/**
 * Vérifie si un état est actif (nécessite une action)
 * @param state État à vérifier 
 * @returns Vrai si l'état est actif
 */
export function isActiveState(state: ValidationState): boolean {
    return ValidationStateGroups.active.includes(state);
}