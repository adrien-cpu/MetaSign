// src/ai/specialized/grammar/validators/factories/BodyPostureValidatorFactory.ts

import { BodyPostureValidator } from '../body/BodyPostureValidator';
import { IBodyPostureValidator } from '../interfaces/IBodyPostureValidator';

/**
 * Factory pour créer des instances de validateurs de posture corporelle
 */
export class BodyPostureValidatorFactory {
    /**
     * Crée une instance de validateur de posture corporelle
     * @returns Instance de validateur implémentant IBodyPostureValidator
     */
    public static createValidator(): IBodyPostureValidator {
        return new BodyPostureValidator();
    }
}