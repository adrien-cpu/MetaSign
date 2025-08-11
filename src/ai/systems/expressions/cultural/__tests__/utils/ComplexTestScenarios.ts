// src/ai/systems/expressions/cultural/__tests__/utils/ComplexTestScenarios.ts

// Importation des types et classes nécessaires
import {
  ComplexScenario,
  ScenarioParameters,
  ScenarioResponse,
  ScenarioType,
  ValidationResult
} from './types/scenario-types';
import { ScenarioGenerator } from './generators/ScenarioGenerator';
import { ScenarioValidator } from './validators/ScenarioValidator';

/**
 * Classe de scénarios de test complexes pour valider les aspects culturels
 * 
 * Cette classe agit comme une façade qui orchestre la génération et la validation
 * de scénarios complexes pour tester le système dans des conditions culturellement
 * nuancées.
 */
export class ComplexTestScenarios {
  private readonly generator: ScenarioGenerator;
  private readonly validator: ScenarioValidator;

  /**
   * Constructeur qui initialise le générateur et le validateur
   */
  constructor() {
    this.generator = new ScenarioGenerator();
    this.validator = new ScenarioValidator();
  }

  /**
   * Génère un scénario complexe en fonction des paramètres
   * @param type Type de scénario à générer
   * @param parameters Paramètres de personnalisation
   * @returns Scénario complexe généré
   */
  async generateComplexScenario(
    type: ScenarioType,
    parameters: ScenarioParameters
  ): Promise<ComplexScenario> {
    return this.generator.generateComplexScenario(
      type as keyof typeof this.generator['COMPLEX_SCENARIOS'],
      parameters
    );
  }

  /**
   * Valide la réponse à un scénario
   * @param scenario Scénario complexe
   * @param response Réponse au scénario
   * @returns Résultat de la validation
   */
  async validateScenarioResponse(
    scenario: ComplexScenario,
    response: ScenarioResponse
  ): Promise<ValidationResult> {
    return this.validator.validateScenarioResponse(scenario, response);
  }
}