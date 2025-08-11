/**
 * @file src/ai/services/learning/human/coda/codavirtuel/simulation/ErrorSimulator.ts
 * @description Simulateur d'erreurs pour le système d'apprentissage inversé (CODA virtuel)
 * Permet de générer des erreurs réalistes dans les expressions LSF selon le niveau de l'apprenant
 * @author MetaSign
 * @version 1.0.0
 */

import { Logger } from '@/ai/utils/Logger';
import { ErrorSimulationConfig } from './types/ErrorTypes';
import { ErrorTransformerFactory } from './transformers/ErrorTransformerFactory';
import { ErrorSimulationUtils } from './utils/ErrorSimulationUtils';
import { BaseErrorTransformer } from './transformers';
import { LSFContent, LSFDialogue, LSFExercise, LSFScenario } from './types/LSFContentTypes';

/**
 * Classe responsable de simuler des erreurs réalistes dans les expressions LSF
 * pour simuler le comportement d'un apprenant (CODA virtuel)
 */
export class ErrorSimulator {
    private logger: Logger;
    private transformerFactory: ErrorTransformerFactory;

    /**
     * Initialise le simulateur d'erreurs
     */
    constructor() {
        this.logger = new Logger('ErrorSimulator');
        this.transformerFactory = new ErrorTransformerFactory();
        this.logger.info('ErrorSimulator initialisé');
    }

    /**
     * Applique des erreurs réalistes à un scénario d'apprentissage
     * @param scenario Scénario original sans erreurs
     * @param config Configuration de la simulation d'erreurs
     * @returns Scénario modifié avec des erreurs simulées
     */
    public applyErrors(scenario: LSFScenario, config: ErrorSimulationConfig): LSFScenario {
        try {
            // Clone le scénario pour ne pas modifier l'original
            const modifiedScenario = ErrorSimulationUtils.deepClone(scenario);

            // Applique la configuration d'erreurs au scénario
            modifiedScenario.avatarProficiency = {
                errorRate: config.errorRate,
                errorTypes: config.errorTypes
            };

            // Si le taux d'erreur est nul, retourne le scénario sans modifications
            if (config.errorRate <= 0) {
                return modifiedScenario;
            }

            // Parcourt les différentes parties du scénario et applique des erreurs
            this.processScenarioComponents(modifiedScenario, config);

            this.logger.info(`Erreurs appliquées au scénario avec un taux de ${config.errorRate}`);

            return modifiedScenario;
        } catch (error) {
            this.logger.error(`Erreur lors de l'application des erreurs: ${error instanceof Error ? error.message : String(error)}`);
            // En cas d'erreur, retourne le scénario original
            return scenario;
        }
    }

    /**
     * Traite les différents composants du scénario pour appliquer des erreurs
     * @param scenario Scénario à modifier
     * @param config Configuration de la simulation d'erreurs
     * @private
     */
    private processScenarioComponents(scenario: LSFScenario, config: ErrorSimulationConfig): void {
        // Parcourt les exercices et applique des erreurs
        if (scenario.exercises && Array.isArray(scenario.exercises)) {
            scenario.exercises = scenario.exercises.map(exercise => {
                return this.applyErrorsToExercise(exercise, config);
            });
        }

        // Parcourt d'autres éléments du scénario qui peuvent contenir des contenus LSF
        if (scenario.dialogues && Array.isArray(scenario.dialogues)) {
            scenario.dialogues = scenario.dialogues.map(dialogue => {
                return this.applyErrorsToDialogue(dialogue, config);
            });
        }

        // Parcourt les démonstrations si elles existent
        if (scenario.demonstrations && Array.isArray(scenario.demonstrations)) {
            scenario.demonstrations = scenario.demonstrations.map(demo => {
                return this.applyErrorsToContent(demo, config);
            });
        }
    }

    /**
     * Applique des erreurs à un exercice
     * @param exercise Exercice à modifier
     * @param config Configuration de la simulation d'erreurs
     * @returns Exercice modifié avec des erreurs
     * @private
     */
    private applyErrorsToExercise(exercise: LSFExercise, config: ErrorSimulationConfig): LSFExercise {
        // Clone l'exercice
        const modifiedExercise = { ...exercise };

        // Vérifie si l'exercice contient des contenus LSF à modifier
        if (modifiedExercise.content) {
            if (Array.isArray(modifiedExercise.content)) {
                // Si le contenu est un tableau, traite chaque élément
                modifiedExercise.content = modifiedExercise.content.map((item: LSFContent) => {
                    return ErrorSimulationUtils.shouldApplyError(config)
                        ? this.applyErrorsToContent(item, config)
                        : item;
                });
            } else {
                // Si le contenu est un objet unique
                modifiedExercise.content = ErrorSimulationUtils.shouldApplyError(config)
                    ? this.applyErrorsToContent(modifiedExercise.content, config)
                    : modifiedExercise.content;
            }
        }

        // Applique également aux instructions si elles existent
        if (modifiedExercise.instructions) {
            modifiedExercise.instructions = ErrorSimulationUtils.shouldApplyError(config)
                ? this.applyErrorsToContent(modifiedExercise.instructions, config)
                : modifiedExercise.instructions;
        }

        // Pour les exercices de type MULTIPLE_CHOICE, modifie les options
        if (modifiedExercise.type === 'MULTIPLE_CHOICE' && modifiedExercise.options) {
            modifiedExercise.options = modifiedExercise.options.map((option: LSFContent) => {
                return ErrorSimulationUtils.shouldApplyError(config, 0.3) // Réduit la probabilité pour les options
                    ? this.applyErrorsToContent(option, config)
                    : option;
            });
        }

        return modifiedExercise;
    }

    /**
     * Applique des erreurs à un dialogue
     * @param dialogue Dialogue à modifier
     * @param config Configuration de la simulation d'erreurs
     * @returns Dialogue modifié avec des erreurs
     * @private
     */
    private applyErrorsToDialogue(dialogue: LSFDialogue, config: ErrorSimulationConfig): LSFDialogue {
        // Clone le dialogue
        const modifiedDialogue = { ...dialogue };

        // Vérifie si le dialogue contient des répliques
        if (modifiedDialogue.exchanges && Array.isArray(modifiedDialogue.exchanges)) {
            modifiedDialogue.exchanges = modifiedDialogue.exchanges.map(exchange => {
                // Ne modifie que les répliques de l'avatar CODA
                if (exchange.speaker === 'avatar') {
                    return {
                        ...exchange,
                        content: ErrorSimulationUtils.shouldApplyError(config)
                            ? this.applyErrorsToContent(exchange.content, config)
                            : exchange.content
                    };
                }
                return exchange;
            });
        }

        return modifiedDialogue;
    }

    /**
     * Applique des erreurs à un contenu LSF
     * @param content Contenu LSF à modifier
     * @param config Configuration de la simulation d'erreurs
     * @returns Contenu modifié avec des erreurs
     * @private
     */
    private applyErrorsToContent(content: LSFContent, config: ErrorSimulationConfig): LSFContent {
        // Si le contenu est une chaîne simple, retourne sans modifications
        if (typeof content === 'string') {
            return content;
        }

        // Clone le contenu
        const modifiedContent = { ...content };

        // Si le contenu correspond à un concept maîtrisé, ne pas appliquer d'erreurs
        if (ErrorSimulationUtils.isErrorExempt(modifiedContent, config)) {
            return modifiedContent;
        }

        // Applique des erreurs aux paramètres LSF selon les types d'erreurs configurés
        config.errorTypes.forEach(errorType => {
            this.applyErrorOfType(modifiedContent, errorType, config);
        });

        return modifiedContent;
    }

    /**
     * Applique un type d'erreur spécifique à un contenu LSF
     * @param content Contenu LSF à modifier
     * @param errorType Type d'erreur à appliquer
     * @param config Configuration de la simulation d'erreurs
     * @private
     */
    private applyErrorOfType(content: LSFContent, errorType: string, config: ErrorSimulationConfig): void {
        // Vérifie si un transformateur existe pour ce type d'erreur
        if (!this.transformerFactory.hasTransformer(errorType)) {
            this.logger.warn(`Aucun transformateur trouvé pour le type d'erreur: ${errorType}`);
            return;
        }

        // Récupère le transformateur
        const transformer = this.transformerFactory.getTransformer(errorType) as BaseErrorTransformer;

        // Vérifie si le transformateur peut s'appliquer à ce contenu
        if (!transformer.canTransform(content)) {
            return;
        }

        // Détermine si une erreur doit être appliquée selon le taux d'erreur global
        if (!ErrorSimulationUtils.shouldApplyError(config)) {
            return;
        }

        // Applique la transformation
        this.applyTransformationWithTransformer(transformer, content);
    }

    /**
     * Applique une transformation en utilisant un transformateur spécifique
     * @param transformer Transformateur à utiliser
     * @param content Contenu LSF à modifier
     * @private
     */
    private applyTransformationWithTransformer(transformer: BaseErrorTransformer, content: LSFContent): void {
        try {
            // Applique la transformation par défaut (les transformateurs eux-mêmes peuvent décider d'appliquer
            // des transformations plus spécifiques en interne si approprié)
            transformer.applyDefaultTransformation(content);
        } catch (error) {
            this.logger.error(`Erreur lors de l'application de la transformation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}