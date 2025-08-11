/**
 * @file: src/ai/multimodal/analysis/IntentAnalyzer.ts
 * 
 * Analyseur d'intention pour détecter les intentions des utilisateurs
 * dans les requêtes textuelles et multimodales
 */

import { logger } from '@/utils/Logger';

/**
 * Types d'intentions reconnues
 */
export enum IntentType {
    TRANSLATE = 'translate',
    LEARN = 'learn',
    ANALYZE = 'analyze',
    GENERATE = 'generate',
    VALIDATE = 'validate',
    EXPLAIN = 'explain',
    HELP = 'help',
    STATUS = 'status',
    FEEDBACK = 'feedback',
    CONFIGURE = 'configure',
    UNKNOWN = 'unknown'
}

/**
 * Résultat d'analyse d'intention
 */
export interface IntentAnalysisResult {
    /** Intention principale détectée */
    intent: IntentType;
    /** Intentions secondaires détectées */
    secondaryIntents: IntentType[];
    /** Score de confiance (0-1) */
    confidence: number;
    /** Entités détectées liées à l'intention */
    entities: IntentEntity[];
    /** Paramètres extraits de l'intention */
    parameters: Record<string, unknown>;
    /** Données brutes d'analyse */
    raw?: Record<string, unknown>;
}

/**
 * Entité liée à une intention
 */
export interface IntentEntity {
    /** Type d'entité */
    type: string;
    /** Valeur de l'entité */
    value: string;
    /** Paramètre associé */
    parameter?: string;
    /** Score de confiance (0-1) */
    confidence: number;
}

/**
 * Configuration pour l'analyseur d'intention
 */
export interface IntentAnalyzerOptions {
    /** Seuil de confiance minimal (0-1) */
    confidenceThreshold?: number;
    /** Activer la détection multi-intentions */
    enableMultiIntent?: boolean;
    /** Activer l'extraction de paramètres */
    enableParameterExtraction?: boolean;
    /** Intention par défaut si aucune n'est détectée */
    defaultIntent?: IntentType;
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
    /** Nombre maximal d'intentions secondaires à détecter */
    maxSecondaryIntents?: number;
}

/**
 * Modèle d'intention pour la reconnaissance
 */
interface IntentPattern {
    /** Type d'intention */
    type: IntentType;
    /** Expressions régulières pour détecter l'intention */
    patterns: RegExp[];
    /** Poids de cette intention (pour départager) */
    weight: number;
    /** Extracteurs de paramètres */
    parameterExtractors?: Array<{
        /** Nom du paramètre */
        name: string;
        /** Schéma de correspondance */
        pattern: RegExp;
        /** Fonction de transformation optionnelle */
        transform?: (value: string) => unknown;
    }>;
}

/**
 * Analyseur d'intention pour détecter les intentions des utilisateurs
 */
export class IntentAnalyzer {
    private initialized = false;
    private readonly options: Required<IntentAnalyzerOptions>;

    /** Modèles d'intentions pour la reconnaissance */
    private readonly intentPatterns: IntentPattern[] = [];

    /**
     * Crée une nouvelle instance de l'analyseur d'intention
     * @param options Options de configuration
     */
    constructor(options: IntentAnalyzerOptions = {}) {
        this.options = {
            confidenceThreshold: options.confidenceThreshold || 0.5,
            enableMultiIntent: options.enableMultiIntent !== false,
            enableParameterExtraction: options.enableParameterExtraction !== false,
            defaultIntent: options.defaultIntent || IntentType.UNKNOWN,
            logLevel: options.logLevel || 'info',
            maxSecondaryIntents: options.maxSecondaryIntents || 2
        };

        logger.debug('IntentAnalyzer created', {
            options: this.options
        });
    }

    /**
     * Initialise l'analyseur d'intention
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        logger.info('Initializing IntentAnalyzer...');

        try {
            // Configurer les modèles d'intention
            this.configureIntentPatterns();

            this.initialized = true;
            logger.info('IntentAnalyzer initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize IntentAnalyzer', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error('IntentAnalyzer initialization failed');
        }
    }

    /**
     * Configure les modèles d'intention pour la reconnaissance
     * @private
     */
    private configureIntentPatterns(): void {
        // Intention de traduction
        this.intentPatterns.push({
            type: IntentType.TRANSLATE,
            patterns: [
                /tradu(is|ire|ction)|convertir|interpréter/i,
                /translat(e|ion)|convert/i,
                /^(je\s+)?veux\s+(faire\s+)?(traduire|convertir)/i,
                /^(can\s+you\s+)?(please\s+)?(translate|convert)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(me\s+)?(traduire|convertir)/i
            ],
            weight: 1.0,
            parameterExtractors: [
                {
                    name: 'sourceLanguage',
                    pattern: /(?:depuis|from|de)\s+(?:la\s+)?(?:langue\s+)?([a-zA-Z\s]+?)(?:\s+(?:vers|to|en)|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                },
                {
                    name: 'targetLanguage',
                    pattern: /(?:vers|to|en)\s+(?:la\s+)?(?:langue\s+)?([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention d'apprentissage
        this.intentPatterns.push({
            type: IntentType.LEARN,
            patterns: [
                /apprendre|apprentissage|cours|leçon|étudier|formation/i,
                /learn(ing)?|study(ing)?|course|lesson|train(ing)?/i,
                /^(je\s+)?veux\s+(apprendre|étudier|me\s+former)/i,
                /^(can\s+you\s+)?(please\s+)?(teach|show|help\s+me\s+learn)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(m['']apprendre|m['']enseigner)/i
            ],
            weight: 0.9,
            parameterExtractors: [
                {
                    name: 'subject',
                    pattern: /(?:apprendre|étudier|learn|study)\s+(?:à\s+|le\s+|la\s+|les\s+|l['']|to\s+)?([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                },
                {
                    name: 'level',
                    pattern: /(?:niveau|level)\s+(\w+)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention d'analyse
        this.intentPatterns.push({
            type: IntentType.ANALYZE,
            patterns: [
                /analy(se[rz]?|zing)/i,
                /examiner|étudier|observer|comprendre/i,
                /examine|study|observe|understand/i,
                /^(je\s+)?veux\s+(analyser|examiner|étudier)/i,
                /^(can\s+you\s+)?(please\s+)?(analyze|examine)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(analyser|examiner)/i
            ],
            weight: 0.8,
            parameterExtractors: [
                {
                    name: 'analysisType',
                    pattern: /(?:analyse|analysis)\s+(?:de\s+|du\s+|des\s+|of\s+)?(\w+)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention de génération
        this.intentPatterns.push({
            type: IntentType.GENERATE,
            patterns: [
                /génér(er|ation)|créer|produire|fabriquer/i,
                /generat(e|ion)|create|produce|make/i,
                /^(je\s+)?veux\s+(générer|créer|produire)/i,
                /^(can\s+you\s+)?(please\s+)?(generate|create|produce)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(générer|créer|produire)/i
            ],
            weight: 0.85,
            parameterExtractors: [
                {
                    name: 'contentType',
                    pattern: /(?:génér(?:er|ation)|créer|generate|create)\s+(?:un|une|des|a|an|some)?\s+([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention de validation
        this.intentPatterns.push({
            type: IntentType.VALIDATE,
            patterns: [
                /valid(er|ation)|vérifi(er|cation)|contrôl(er|e)/i,
                /validat(e|ion)|verify|check/i,
                /^(je\s+)?veux\s+(valider|vérifier|contrôler)/i,
                /^(can\s+you\s+)?(please\s+)?(validate|verify|check)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(valider|vérifier|contrôler)/i
            ],
            weight: 0.75,
            parameterExtractors: [
                {
                    name: 'validationType',
                    pattern: /(?:validation|vérification|verification)\s+(?:de\s+|du\s+|des\s+|of\s+)?([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention d'explication
        this.intentPatterns.push({
            type: IntentType.EXPLAIN,
            patterns: [
                /expliqu(er|e[rz]?)|décrire|clarifi(er|e[rz]?)|détaill(er|e[rz]?)/i,
                /explain|describe|clarify|detail/i,
                /^(je\s+)?veux\s+(une\s+)?explication/i,
                /^(can\s+you\s+)?(please\s+)?explain/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(expliquer|décrire)/i,
                /^qu['']est[-\s]ce\s+que/i,
                /^what\s+is/i,
                /^how\s+does/i,
                /^comment\s+(?:fonctionne|marche)/i
            ],
            weight: 0.8,
            parameterExtractors: [
                {
                    name: 'explainTopic',
                    pattern: /(?:expliquer|décrire|explain|describe)\s+(?:le|la|les|l['']|the)?\s+([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        // Intention d'aide
        this.intentPatterns.push({
            type: IntentType.HELP,
            patterns: [
                /^(je\s+)?(?:besoin\s+d[''])?aide/i,
                /^(je\s+)?(?:ne\s+)?comprends\s+pas/i,
                /^help(?:\s+me)?/i,
                /^(i\s+)?need\s+help/i,
                /^(i\s+)?don['']t\s+understand/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(m['']aider|me\s+montrer)/i,
                /^(can\s+you\s+)?(please\s+)?help\s+me/i,
                /^comment\s+(?:puis[-\s]je|faire|utiliser)/i,
                /^how\s+(?:can\s+i|do\s+i|to)/i
            ],
            weight: 0.85
        });

        // Intention de status
        this.intentPatterns.push({
            type: IntentType.STATUS,
            patterns: [
                /(?:quel\s+est\s+le\s+)?statut|état|status|état\s+du\s+système/i,
                /(?:what\s+is\s+the\s+)?status|state|system\s+status/i,
                /^(?:montre[rz]?|affiche[rz]?)\s+(?:le\s+)?statut/i,
                /^(?:show|display)\s+(?:the\s+)?status/i,
                /(?:comment|how)\s+(?:va|fonctionne|se\s+porte)\s+le\s+système/i,
                /(?:how\s+is|how\s+does)\s+the\s+system/i
            ],
            weight: 0.7
        });

        // Intention de feedback
        this.intentPatterns.push({
            type: IntentType.FEEDBACK,
            patterns: [
                /feedback|retour|avis|opinion|commentaire/i,
                /^(je\s+)?veux\s+donner\s+(un|mon)\s+(avis|feedback|retour)/i,
                /^(i\s+)?(?:want\s+to\s+)?give\s+(?:some\s+|my\s+)?feedback/i,
                /^(voici|voilà)\s+(mon|un)\s+(avis|retour|feedback)/i,
                /^here\s+is\s+(?:my|some)\s+feedback/i
            ],
            weight: 0.75
        });

        // Intention de configuration
        this.intentPatterns.push({
            type: IntentType.CONFIGURE,
            patterns: [
                /configur(er|ation|e[rz]?)|paramètr(er|e[rz]?|age)|régl(er|e[rz]?|age)/i,
                /configur(e|ation|ing)|set\s+up|setting/i,
                /^(je\s+)?veux\s+(configurer|paramétrer|régler)/i,
                /^(can\s+you\s+)?(please\s+)?(configure|set\s+up)/i,
                /^(pouvez[-\s]vous|peux[-\s]tu)\s+(configurer|paramétrer|régler)/i,
                /^change[rz]?\s+(?:les?\s+)?(?:réglages?|paramètres?|options?|configurations?)/i,
                /^change\s+(?:the\s+)?(?:settings?|parameters?|options?|configurations?)/i
            ],
            weight: 0.7,
            parameterExtractors: [
                {
                    name: 'configItem',
                    pattern: /(?:configurer|paramétrer|régler|configure|set\s+up|change)\s+(?:le|la|les|l['']|the)?\s+([a-zA-Z\s]+?)(?:\s+|$)/i,
                    transform: (value) => value.trim().toLowerCase()
                }
            ]
        });

        logger.debug(`${this.intentPatterns.length} intent patterns configured`);
    }

    /**
     * Analyse l'intention d'un texte
     * @param text Texte à analyser
     * @returns Résultat de l'analyse d'intention
     */
    public async analyzeIntent(text: string): Promise<IntentAnalysisResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug('Analyzing intent', { textLength: text.length });

        // Analyser les intentions
        const intentScores = this.scoreIntents(text);

        // Trier les intentions par score
        const sortedIntents = [...intentScores.entries()]
            .sort((a, b) => b[1] - a[1]);

        // Sélectionner l'intention principale et les intentions secondaires
        const primaryIntent = sortedIntents.length > 0 && sortedIntents[0][1] >= this.options.confidenceThreshold
            ? sortedIntents[0][0]
            : this.options.defaultIntent;

        const secondaryIntents = this.options.enableMultiIntent
            ? sortedIntents
                .slice(1, 1 + this.options.maxSecondaryIntents)
                .filter(([intent, score]) =>
                    score >= this.options.confidenceThreshold / 2 &&
                    intent !== primaryIntent)
                .map(([intent]) => intent)
            : [];

        // Calculer le score de confiance global
        const confidence = sortedIntents.length > 0 ?
            Math.min(sortedIntents[0][1], 1.0) : 0.3;

        // Extraire les paramètres
        const parameters: Record<string, unknown> = {};
        const entities: IntentEntity[] = [];

        if (this.options.enableParameterExtraction) {
            const extractionResult = this.extractParameters(text, primaryIntent);
            Object.assign(parameters, extractionResult.parameters);
            entities.push(...extractionResult.entities);
        }

        const result: IntentAnalysisResult = {
            intent: primaryIntent,
            secondaryIntents,
            confidence,
            entities,
            parameters,
            raw: {
                intentScores: Object.fromEntries(intentScores),
                sortedIntents: sortedIntents.map(([intent, score]) => ({ intent, score }))
            }
        };

        logger.debug('Intent analysis completed', {
            intent: primaryIntent,
            confidence,
            secondaryCount: secondaryIntents.length,
            entityCount: entities.length
        });

        return result;
    }

    /**
     * Calcule les scores pour chaque intention
     * @param text Texte à analyser
     * @returns Map des scores par intention
     * @private
     */
    private scoreIntents(text: string): Map<IntentType, number> {
        const scores = new Map<IntentType, number>();

        // Normaliser le texte pour l'analyse
        const normalizedText = text.toLowerCase().trim();

        // Évaluer chaque modèle d'intention
        for (const intentPattern of this.intentPatterns) {
            let score = 0;

            // Vérifier chaque expression régulière du modèle
            for (const pattern of intentPattern.patterns) {
                const matches = normalizedText.match(pattern);
                if (matches) {
                    // Le score dépend du nombre de correspondances et de leur position
                    const matchScore = matches.length * 0.2;

                    // Les correspondances au début du texte ont plus de poids
                    const positionBonus = matches.index === 0 ? 0.3 : 0;

                    score += matchScore + positionBonus;
                }
            }

            // Appliquer le poids du modèle
            if (score > 0) {
                score *= intentPattern.weight;
                scores.set(intentPattern.type, score);
            }
        }

        // Si aucune intention n'est détectée, utiliser l'intention par défaut
        if (scores.size === 0) {
            scores.set(this.options.defaultIntent, 0.3);
        }

        return scores;
    }

    /**
     * Extrait les paramètres liés à une intention
     * @param text Texte à analyser
     * @param intent Intention détectée
     * @returns Paramètres extraits et entités détectées
     * @private
     */
    private extractParameters(
        text: string,
        intent: IntentType
    ): { parameters: Record<string, unknown>; entities: IntentEntity[] } {
        const parameters: Record<string, unknown> = {};
        const entities: IntentEntity[] = [];

        // Trouver le modèle d'intention correspondant
        const intentPattern = this.intentPatterns.find(pattern => pattern.type === intent);

        if (!intentPattern || !intentPattern.parameterExtractors) {
            return { parameters, entities };
        }

        // Extraire les paramètres selon les extracteurs définis
        for (const extractor of intentPattern.parameterExtractors) {
            const match = text.match(extractor.pattern);

            if (match && match[1]) {
                const rawValue = match[1];
                const value = extractor.transform ? extractor.transform(rawValue) : rawValue;

                parameters[extractor.name] = value;

                // Ajouter également comme entité
                entities.push({
                    type: extractor.name,
                    value: String(value),
                    parameter: extractor.name,
                    confidence: 0.9
                });
            }
        }

        return { parameters, entities };
    }

    /**
     * Libère les ressources de l'analyseur
     */
    public dispose(): void {
        this.intentPatterns.length = 0;
        this.initialized = false;

        logger.debug('IntentAnalyzer disposed');
    }
}