//src/ai/api/security/ids/IntrusionDetectionSystem.ts

import { SecurityAuditor } from '../types/SecurityTypes';

export interface IDSConfig {
    // Configuration de l'analyse comportementale
    behavioral: {
        requestThreshold: number;      // Nombre de requêtes par minute avant alerte
        errorThreshold: number;        // Pourcentage d'erreurs avant alerte
        scanningThreshold: number;     // Nombre de paths différents avant détection de scan
        bruteForceThreshold: number;   // Nombre de tentatives de connexion échouées
        timeWindow: number;            // Fenêtre de temps pour l'analyse (ms)
    };
    // Configuration de la détection des patterns
    patterns: {
        enabled: Record<string, boolean>;  // Activer/désactiver certains patterns
        customPatterns: Record<string, RegExp>;  // Patterns personnalisés
        sensitivity: 'low' | 'medium' | 'high';
    };
    // Configuration des réponses automatiques
    responses: {
        autoBlock: boolean;            // Bloquer automatiquement les menaces
        blockDuration: number;         // Durée du blocage (ms)
        notifyAdmin: boolean;          // Notifier l'administrateur
        preventiveMode: boolean;       // Mode préventif (bloquer au moindre doute)
    };
}

// Interface pour les requêtes analysées par l'IDS
export interface IDSRequest {
    ip: string;
    path: string;
    query: Record<string, string>;
    body: unknown;
    headers: Record<string, string>;
    status?: number;
}

// Interface pour le log de menace
export interface ThreatLog {
    type: ThreatType;
    confidence: number;
    evidence: string[];
    ip: string;
    timestamp: number;
}

// Étendre l'interface SecurityAuditor pour inclure logThreat
declare module '../types/SecurityTypes' {
    interface SecurityAuditor {
        logThreat(threat: ThreatLog): Promise<void>;
    }
}

export interface DetectionResult {
    detected: boolean;
    threat: ThreatType;
    confidence: number;
    evidence: string[];
    recommendedAction: 'monitor' | 'warn' | 'block';
}

export type ThreatType =
    | 'scanning'
    | 'brute-force'
    | 'injection'
    | 'anomaly'
    | 'dos'
    | 'data-theft'
    | 'unauthorized-access';

interface RequestMetrics {
    timestamp: number;
    count: number;
    errors: number;
    paths: Set<string>;
    ips: Map<string, number>;
    userAgents: Map<string, number>;
}

// Interface pour les patterns d'en-têtes suspects
interface SuspiciousHeaderPatterns {
    [key: string]: RegExp;
    'x-forwarded-for': RegExp;
    'user-agent': RegExp;
    'referer': RegExp;
    'cookie': RegExp;
}

export class IntrusionDetectionSystem {
    private metrics: Map<string, RequestMetrics> = new Map();
    private blockedIPs: Set<string> = new Set();
    private knownPatterns: Map<string, RegExp> = new Map();
    private anomalyScores: Map<string, number> = new Map();

    constructor(
        private readonly config: IDSConfig,
        private readonly securityAuditor: SecurityAuditor
    ) {
        this.initializePatterns();
        this.startPeriodicCleanup();
    }

    public async analyzeRequest(request: IDSRequest): Promise<DetectionResult> {
        try {
            // Vérifier si l'IP est déjà bloquée
            if (this.blockedIPs.has(request.ip)) {
                return this.createDetectionResult('unauthorized-access', 1.0, ['IP blocked']);
            }

            // Mettre à jour les métriques
            this.updateMetrics(request);

            // Analyses parallèles
            const [
                behavioralAnalysis,
                patternAnalysis,
                anomalyAnalysis
            ] = await Promise.all([
                this.analyzeBehavior(request),
                this.analyzePatterns(request),
                this.analyzeAnomalies(request)
            ]);

            // Consolider les résultats
            const detections = [behavioralAnalysis, patternAnalysis, anomalyAnalysis]
                .filter(result => result.detected);

            if (detections.length === 0) {
                return {
                    detected: false,
                    threat: 'anomaly',
                    confidence: 0,
                    evidence: [],
                    recommendedAction: 'monitor'
                };
            }

            // Prendre le résultat avec la plus haute confiance
            const highestConfidence = detections.reduce(
                (prev, current) => prev.confidence > current.confidence ? prev : current
            );

            // Actions automatiques si configurées
            if (this.shouldTakeAction(highestConfidence)) {
                await this.takeAction(request, highestConfidence);
            }

            return highestConfidence;

        } catch (error) {
            await this.securityAuditor.logError({
                operation: 'intrusion_detection',
                error: error instanceof Error ? error.message : 'Unknown error',
                context: { ip: request.ip },
                timestamp: Date.now()
            });

            return this.createDetectionResult('anomaly', 0.5, ['Analysis error']);
        }
    }

    private async analyzeBehavior(request: IDSRequest): Promise<DetectionResult> {
        const metrics = this.getMetrics(request.ip);
        const evidence: string[] = [];

        // Détecter le scanning
        if (metrics.paths.size > this.config.behavioral.scanningThreshold) {
            evidence.push(`High path diversity: ${metrics.paths.size} different paths`);
        }

        // Détecter les attaques par force brute
        const errorRate = metrics.errors / metrics.count;
        if (errorRate > this.config.behavioral.errorThreshold) {
            evidence.push(`High error rate: ${(errorRate * 100).toFixed(2)}%`);
        }

        // Détecter les DoS
        if (metrics.count > this.config.behavioral.requestThreshold) {
            evidence.push(`High request rate: ${metrics.count} requests`);
        }

        // Détecter les anomalies de User-Agent
        if (metrics.userAgents.size > 5) {
            evidence.push(`Multiple User-Agents: ${metrics.userAgents.size}`);
        }

        if (evidence.length > 0) {
            const confidence = Math.min(evidence.length * 0.25, 1);
            return this.createDetectionResult('anomaly', confidence, evidence);
        }

        return this.createDetectionResult('anomaly', 0, []);
    }

    private async analyzePatterns(request: IDSRequest): Promise<DetectionResult> {
        const evidence: string[] = [];

        // Analyser les patterns connus
        for (const [name, pattern] of this.knownPatterns) {
            if (!this.config.patterns.enabled[name]) continue;

            const content = JSON.stringify({
                path: request.path,
                query: request.query,
                body: request.body,
                headers: request.headers
            });

            if (pattern.test(content)) {
                evidence.push(`Pattern match: ${name}`);
            }
        }

        if (evidence.length > 0) {
            const confidence = Math.min(evidence.length * 0.3, 1);
            return this.createDetectionResult('injection', confidence, evidence);
        }

        return this.createDetectionResult('injection', 0, []);
    }

    private async analyzeAnomalies(request: IDSRequest): Promise<DetectionResult> {
        const evidence: string[] = [];
        let anomalyScore = this.anomalyScores.get(request.ip) || 0;

        // Vérifier les en-têtes suspects
        const suspiciousHeaders = this.checkSuspiciousHeaders(request.headers);
        if (suspiciousHeaders.length > 0) {
            evidence.push(...suspiciousHeaders);
            anomalyScore += 0.2;
        }

        // Vérifier les patterns de données sensibles
        const dataLeaks = this.checkDataLeaks(request);
        if (dataLeaks.length > 0) {
            evidence.push(...dataLeaks);
            anomalyScore += 0.3;
        }

        // Vérifier les séquences d'actions suspectes
        const suspiciousSequence = this.checkActionSequence(request);
        if (suspiciousSequence) {
            evidence.push(suspiciousSequence);
            anomalyScore += 0.25;
        }

        this.anomalyScores.set(request.ip, anomalyScore);

        if (anomalyScore > 0.5) {
            return this.createDetectionResult('anomaly', anomalyScore, evidence);
        }

        return this.createDetectionResult('anomaly', 0, []);
    }

    private checkSuspiciousHeaders(headers: Record<string, string>): string[] {
        const suspicious: string[] = [];

        // En-têtes couramment utilisés dans les attaques
        const suspiciousHeaderPatterns: SuspiciousHeaderPatterns = {
            'x-forwarded-for': /^(?:\d{1,3}\.){3}\d{1,3},\s*(?:\d{1,3}\.){3}\d{1,3}/,
            'user-agent': /(curl|wget|python|sqlmap|nikto|burp|postman)/i,
            'referer': /(\.php|\.asp|\.aspx|\.jsp)$/i,
            'cookie': /(admin|session|auth|token)=/i
        };

        for (const [header, value] of Object.entries(headers)) {
            const lowerHeader = header.toLowerCase();
            // Vérifier si l'en-tête est dans notre liste de modèles suspects
            if (lowerHeader in suspiciousHeaderPatterns) {
                const pattern = suspiciousHeaderPatterns[lowerHeader];
                if (pattern.test(value)) {
                    suspicious.push(`Suspicious header ${header}: ${value}`);
                }
            }
        }

        return suspicious;
    }

    private checkDataLeaks(request: IDSRequest): string[] {
        const leaks: string[] = [];
        const content = JSON.stringify(request);

        // Patterns de données sensibles
        const sensitivePatterns: Record<string, RegExp> = {
            'credit_card': /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
            'email': /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/,
            'ssn': /\b\d{3}-\d{2}-\d{4}\b/,
            'api_key': /\b[A-Za-z0-9]{32,}\b/
        };

        for (const [type, pattern] of Object.entries(sensitivePatterns)) {
            if (pattern.test(content)) {
                leaks.push(`Potential ${type} leak detected`);
            }
        }

        return leaks;
    }

    private checkActionSequence(_request: IDSRequest): string | null {
        // Préfixe du paramètre avec un underscore pour indiquer qu'il n'est pas utilisé
        // Implémentation de la détection de séquences suspectes
        return null;
    }

    private createDetectionResult(
        threat: ThreatType,
        confidence: number,
        evidence: string[]
    ): DetectionResult {
        return {
            detected: confidence > 0,
            threat,
            confidence,
            evidence,
            recommendedAction: this.getRecommendedAction(confidence)
        };
    }

    private getRecommendedAction(confidence: number): 'monitor' | 'warn' | 'block' {
        if (confidence > 0.8) return 'block';
        if (confidence > 0.5) return 'warn';
        return 'monitor';
    }

    private shouldTakeAction(result: DetectionResult): boolean {
        if (!this.config.responses.autoBlock) return false;
        if (this.config.responses.preventiveMode && result.confidence > 0.5) return true;
        return result.confidence > 0.8;
    }

    private async takeAction(request: IDSRequest, result: DetectionResult): Promise<void> {
        if (result.recommendedAction === 'block') {
            this.blockedIPs.add(request.ip);
            setTimeout(() => {
                this.blockedIPs.delete(request.ip);
            }, this.config.responses.blockDuration);
        }

        if (this.config.responses.notifyAdmin) {
            await this.securityAuditor.logThreat({
                type: result.threat,
                confidence: result.confidence,
                evidence: result.evidence,
                ip: request.ip,
                timestamp: Date.now()
            });
        }
    }

    private initializePatterns(): void {
        this.knownPatterns = new Map([
            ['sql_injection', /(\%27)|(\')|(\-\-)|(\%23)|(#)/i],
            ['xss', /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/i],
            ['path_traversal', /\.\.|%2e%2e|%252e/i],
            ['command_injection', /[;&|`]/],
            ['file_inclusion', /\.\.(\/|\\)|\.\.%2f|\.\.%5c/i],
            ...Object.entries(this.config.patterns.customPatterns)
        ]);
    }

    private startPeriodicCleanup(): void {
        setInterval(() => {
            const cutoff = Date.now() - this.config.behavioral.timeWindow;

            // Nettoyer les anciennes métriques
            for (const [ip, metrics] of this.metrics.entries()) {
                if (metrics.timestamp < cutoff) {
                    this.metrics.delete(ip);
                }
            }

            // Réinitialiser les scores d'anomalie
            this.anomalyScores.clear();

        }, this.config.behavioral.timeWindow);
    }

    private getMetrics(ip: string): RequestMetrics {
        if (!this.metrics.has(ip)) {
            this.metrics.set(ip, {
                timestamp: Date.now(),
                count: 0,
                errors: 0,
                paths: new Set(),
                ips: new Map(),
                userAgents: new Map()
            });
        }
        return this.metrics.get(ip)!;
    }

    private updateMetrics(request: IDSRequest): void {
        const metrics = this.getMetrics(request.ip);
        metrics.count++;
        metrics.paths.add(request.path);

        if (request.status && request.status >= 400) {
            metrics.errors++;
        }

        const userAgent = request.headers['user-agent'];
        if (userAgent) {
            metrics.userAgents.set(
                userAgent,
                (metrics.userAgents.get(userAgent) || 0) + 1
            );
        }
    }
}