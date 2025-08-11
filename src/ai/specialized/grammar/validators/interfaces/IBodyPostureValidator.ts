// src/ai/specialized/grammar/validators/interfaces/IBodyPostureValidator.ts

import { ValidationResult, GrammaticalContext } from '../../types';
import { TrunkPosture, ShoulderPosture, WeightShift } from '../../types/body-posture.types';

/**
 * Interface définissant les méthodes de validation de posture corporelle pour la LSF
 */
export interface IBodyPostureValidator {
    /**
     * Valide la posture du tronc selon les règles LSF
     * @param posture Tableau de postures du tronc à valider
     * @param context Contexte grammatical optionnel
     */
    validateTrunk(
        posture: TrunkPosture[],
        context?: GrammaticalContext
    ): Promise<ValidationResult>;

    /**
     * Valide les postures des épaules selon les règles LSF
     * @param posture Tableau de postures d'épaules à valider
     */
    validateShoulders(
        posture: ShoulderPosture[]
    ): Promise<ValidationResult>;

    /**
     * Valide les transferts de poids selon les règles LSF
     * @param shifts Tableau de transferts de poids à valider
     * @param context Contexte grammatical optionnel
     */
    validateWeightShifts(
        shifts: WeightShift[],
        context?: GrammaticalContext
    ): Promise<ValidationResult>;
}