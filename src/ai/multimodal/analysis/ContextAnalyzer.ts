/**
 * @file: src/ai/multimodal/analysis/ContextAnalyzer.ts
 * 
 * Analyseur de contexte pour les entrées multimodales
 * Permet d'extraire des informations contextuelles à partir des requêtes
 */

import { logger } from '@/utils/Logger';
import { ModalityType } from '@ai-types/index';

/**
 * Résultat d'analyse de contexte
 */
export interface ContextAnalysisResult {
    /** Contexte principal détecté */
    primaryContext: string;
    /** Contextes secondaires détectés */
    secondaryContexts: string[];
    /** Score de confiance (0-1) */
    confidence: number;
    /** Entités détectées dans le contexte */
    entities: ContextEntity[];
    /** Action suggérée en fonction du contexte */
    suggestedAction?: string;
    /** Priorité suggérée */
    suggestedPriority?: 'high' | 'medium' | 'low';
    /** Données brutes de l'analyse */
    rawData?: Record<string, unknown>;
}

/**
 * Entité détectée dans un contexte
 */
export interface ContextEntity {
    /** Type d'entité */
    type: string;
    /** Valeur de l'entité */
    value: string;
    /** Position de début (si applicable) */
    startPos?: number;
    /** Position de fin (si applicable) */
    endPos?: number;
    /** Score de confiance (0-1) */
    confidence: number;
    /** Métadonnées associées */
    metadata?: Record<string, unknown>;
}

/**
 * Options pour l'analyse contextuelle
 */
export interface ContextAnalyzerOptions {
    /** Activer la détection d'entités */
    enableEntityDetection?: boolean;
    /** Niveau de profondeur d'analyse (1-5) */
    analysisDepth?: number;
    /** Seuil de confiance minimal (0-1) */
    confidenceThreshold?: number;
    /** Activer les suggestions d'action */
    enableActionSuggestion?: boolean;
    /** Priorité par défaut */
    defaultPriority?: 'high' | 'medium' | 'low';
    /** Niveau de journalisation */
    logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Analyseur de contexte pour les entrées multimodales
 */
export class ContextAnalyzer {
    private initialized = false;
    private readonly options: Required<ContextAnalyzerOptions>;

    // Référentiels pour l'analyse contextuelle
    private readonly contextPatterns: Map<string, RegExp[]> = new Map();
    private readonly entityPatterns: Map<string, RegExp[]> = new Map();
    private readonly actionMappings: Map<string, string[]> = new Map();

    /**
     * Crée une nouvelle instance de l'analyseur de contexte
     * @param options Options de configuration
     */
    constructor(options: ContextAnalyzerOptions = {}) {
        this.options = {
            enableEntityDetection: options.enableEntityDetection !== false,
            analysisDepth: options.analysisDepth || 3,
            confidenceThreshold: options.confidenceThreshold || 0.6,
            enableActionSuggestion: options.enableActionSuggestion !== false,
            defaultPriority: options.defaultPriority || 'medium',
            logLevel: options.logLevel || 'info'
        };

        logger.debug('ContextAnalyzer created', {
            options: this.options
        });
    }

    /**
     * Initialise l'analyseur de contexte
     */
    public async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        logger.info('Initializing ContextAnalyzer...');

        try {
            // Initialisation des patterns de contexte
            this.initializeContextPatterns();

            // Initialisation des patterns d'entités
            if (this.options.enableEntityDetection) {
                this.initializeEntityPatterns();
            }

            // Initialisation des mappings d'actions
            if (this.options.enableActionSuggestion) {
                this.initializeActionMappings();
            }

            this.initialized = true;
            logger.info('ContextAnalyzer initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize ContextAnalyzer', {
                error: error instanceof Error ? error.message : String(error)
            });
            throw new Error('ContextAnalyzer initialization failed');
        }
    }

    /**
     * Initialise les patterns de contexte
     * @private
     */
    private initializeContextPatterns(): void {
        // Contexte d'apprentissage
        this.contextPatterns.set('learning', [
            /apprendre|appren(tissage|dre)|cours|leçon|exercice|étudier|formation/i,
            /learn(ing)?|study(ing)?|course|lesson|exercise|train(ing)?/i
        ]);

        // Contexte de traduction
        this.contextPatterns.set('translation', [
            /tradui(re|t|s)|traduction|convertir|interpreter/i,
            /translat(e|ion)|convert|interpret/i
        ]);

        // Contexte d'analyse
        this.contextPatterns.set('analysis', [
            /analy(se|ser)|comprendre|comprend|évalue/i,
            /analy(ze|sis)|understand|evaluate/i
        ]);

        // Contexte émotionnel
        this.contextPatterns.set('emotional', [
            /émotion|sentiment|ressent|exprime/i,
            /emotion|feeling|express/i
        ]);

        // Contexte culturel
        this.contextPatterns.set('cultural', [
            /cultur(e|el)|tradition|communauté|identité/i,
            /cultur(e|al)|tradition|community|identity/i
        ]);

        logger.debug(`${this.contextPatterns.size} context patterns initialized`);
    }

    /**
     * Initialise les patterns d'entités
     * @private
     */
    private initializeEntityPatterns(): void {
        // Entités temporelles
        this.entityPatterns.set('time', [
            /\b\d{1,2}[h:]\d{2}\b/,
            /\b(?:lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)\b/i,
            /\b(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\b/i,
            /\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
            /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i
        ]);

        // Entités numériques
        this.entityPatterns.set('number', [
            /\b\d+(?:[.,]\d+)?\b/
        ]);

        // Entités de lieu
        this.entityPatterns.set('location', [
            /\b(?:Paris|Lyon|Marseille|Toulouse|Bordeaux|Lille|Nice|Nantes|Strasbourg)\b/i
        ]);

        logger.debug(`${this.entityPatterns.size} entity patterns initialized`);
    }

    /**
     * Initialise les mappings d'actions
     * @private
     */
    private initializeActionMappings(): void {
        // Mapping de contexte vers actions
        this.actionMappings.set('learning', [
            'LEARNING_MODULE',
            'LEARNING_PROGRESS',
            'LEARNING_RECOMMENDATION'
        ]);

        this.actionMappings.set('translation', [
            'TEXT_TO_LSF',
            'LSF_TO_TEXT',
            'LSF_TRANSLATION'
        ]);

        this.actionMappings.set('analysis', [
            'ANALYZE_EXPRESSION',
            'CONTEXT_ANALYSIS',
            'EMOTION_ANALYSIS'
        ]);

        this.actionMappings.set('emotional', [
            'EMOTION_ANALYSIS',
            'GENERATE_EXPRESSION'
        ]);

        this.actionMappings.set('cultural', [
            'CULTURAL_VALIDATION',
            'LSF_TRANSLATION'
        ]);

        logger.debug(`${this.actionMappings.size} action mappings initialized`);
    }

    /**
     * Analyse le contexte d'une requête textuelle
     * @param text Texte à analyser
     * @returns Résultat de l'analyse contextuelle
     */
    public async analyzeText(text: string): Promise<ContextAnalysisResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug('Analyzing text context', { textLength: text.length });

        // Détecter les contextes
        const contextScores = this.detectContexts(text);

        // Trier les contextes par score
        const sortedContexts = [...contextScores.entries()]
            .sort((a, b) => b[1] - a[1]);

        // Sélectionner le contexte principal et les contextes secondaires
        const primaryContext = sortedContexts.length > 0 ?
            sortedContexts[0][0] : 'general';

        const secondaryContexts = sortedContexts
            .slice(1, 3)
            .filter(([, score]) => score > this.options.confidenceThreshold / 2)
            .map(([context]) => context);

        // Calculer la confiance
        const confidence = sortedContexts.length > 0 ?
            Math.min(sortedContexts[0][1], 1.0) : 0.5;

        // Détecter les entités si activé
        const entities = this.options.enableEntityDetection ?
            this.detectEntities(text) : [];

        // Suggérer une action si activé
        const suggestedAction = this.options.enableActionSuggestion ?
            this.suggestAction(primaryContext, secondaryContexts) : undefined;

        // Suggérer une priorité
        const suggestedPriority = this.suggestPriority(
            primaryContext,
            confidence,
            text.length
        );

        const result: ContextAnalysisResult = {
            primaryContext,
            secondaryContexts,
            confidence,
            entities,
            suggestedAction,
            suggestedPriority,
            rawData: {
                contextScores: Object.fromEntries(contextScores)
            }
        };

        logger.debug('Text context analysis completed', {
            primaryContext,
            confidence,
            entityCount: entities.length
        });

        return result;
    }

    /**
     * Analyse le contexte d'une entrée multimodale
     * @param data Données multimodales (peut être de différents types)
     * @returns Résultat de l'analyse contextuelle
     */
    public async analyzeMultimodal(data: unknown): Promise<ContextAnalysisResult> {
        if (!this.initialized) {
            await this.initialize();
        }

        logger.debug('Analyzing multimodal context');

        // Extraire le texte si présent
        let textContent = '';

        if (typeof data === 'string') {
            textContent = data;
        } else if (data && typeof data === 'object') {
            // Essayer d'extraire le texte des différentes modalités
            if ('text' in data && typeof data.text === 'string') {
                textContent = data.text;
            } else if ('textContent' in data && typeof data.textContent === 'string') {
                textContent = data.textContent;
            } else if ('content' in data && typeof data.content === 'string') {
                textContent = data.content;
            }
        }

        // Par défaut, on utilise l'analyse textuelle si du texte est disponible
        if (textContent) {
            return this.analyzeText(textContent);
        }

        // Analyse par défaut si aucun texte n'est disponible
        return {
            primaryContext: 'general',
            secondaryContexts: [],
            confidence: 0.5,
            entities: [],
            suggestedPriority: this.options.defaultPriority
        };
    }

    /**
     * Détecte les contextes présents dans un texte
     * @param text Texte à analyser
     * @returns Map des scores de contexte
     * @private
     */
    private detectContexts(text: string): Map<string, number> {
        const contextScores = new Map<string, number>();

        // Vérifier chaque pattern de contexte
        for (const [context, patterns] of this.contextPatterns.entries()) {
            let score = 0;

            for (const pattern of patterns) {
                const matches = text.match(pattern);
                if (matches) {
                    // Incrémenter le score en fonction du nombre de correspondances
                    score += matches.length * 0.2;
                }
            }

            if (score > 0) {
                contextScores.set(context, score);
            }
        }

        // Si aucun contexte n'est détecté, utiliser 'general'
        if (contextScores.size === 0) {
            contextScores.set('general', 0.5);
        }

        return contextScores;
    }

    /**
     * Détecte les entités dans un texte
     * @param text Texte à analyser
     * @returns Liste des entités détectées
     * @private
     */
    private detectEntities(text: string): ContextEntity[] {
        const entities: ContextEntity[] = [];

        // Vérifier chaque pattern d'entité
        for (const [entityType, patterns] of this.entityPatterns.entries()) {
            for (const pattern of patterns) {
                const matches = text.matchAll(new RegExp(pattern, 'g'));

                for (const match of matches) {
                    if (match.index !== undefined) {
                        entities.push({
                            type: entityType,
                            value: match[0],
                            startPos: match.index,
                            endPos: match.index + match[0].length,
                            confidence: 0.8 // Valeur par défaut
                        });
                    }
                }
            }
        }

        return entities;
    }

    /**
     * Suggère une action en fonction des contextes détectés
     * @param primaryContext Contexte principal
     * @param secondaryContexts Contextes secondaires
     * @returns Action suggérée ou undefined
     * @private
     */
    private suggestAction(
        primaryContext: string,
        secondaryContexts: string[]
    ): string | undefined {
        // Chercher une action pour le contexte principal
        const primaryActions = this.actionMappings.get(primaryContext);

        if (primaryActions && primaryActions.length > 0) {
            return primaryActions[0];
        }

        // Si aucune action n'est trouvée, chercher dans les contextes secondaires
        for (const context of secondaryContexts) {
            const actions = this.actionMappings.get(context);
            if (actions && actions.length > 0) {
                return actions[0];
            }
        }

        return undefined;
    }

    /**
     * Suggère une priorité en fonction du contexte et de la confiance
     * @param context Contexte principal
     * @param confidence Score de confiance
     * @param textLength Longueur du texte
     * @returns Priorité suggérée
     * @private
     */
    private suggestPriority(
        context: string,
        confidence: number,
        textLength: number
    ): 'high' | 'medium' | 'low' {
        // Contextes prioritaires
        const highPriorityContexts = ['emergency', 'critical', 'urgent'];

        // Contextes de priorité moyenne
        const mediumPriorityContexts = ['learning', 'translation', 'analysis'];

        // Contextes de priorité basse
        const lowPriorityContexts = ['general', 'cultural'];

        // Priorité basée sur le contexte
        if (highPriorityContexts.includes(context)) {
            return 'high';
        } else if (lowPriorityContexts.includes(context)) {
            return 'low';
        } else if (mediumPriorityContexts.includes(context)) {
            return 'medium';
        }

        // Priorité par défaut basée sur la confiance et la taille du texte
        if (confidence > 0.8 || textLength > 500) {
            return 'high';
        } else if (confidence < 0.4 && textLength < 50) {
            return 'low';
        }

        return this.options.defaultPriority;
    }

    /**
     * Libère les ressources de l'analyseur
     */
    public dispose(): void {
        this.contextPatterns.clear();
        this.entityPatterns.clear();
        this.actionMappings.clear();
        this.initialized = false;

        logger.debug('ContextAnalyzer disposed');
    }
}