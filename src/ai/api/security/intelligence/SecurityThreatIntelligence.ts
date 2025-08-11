// src/ai/api/security/intelligence/SecurityThreatIntelligence.ts

import { SecurityContext, SecuritySeverity } from '@security/types/SecurityTypes';
import { SecurityAuditor } from '@security/audit/SecurityAuditor';

interface ThreatFeed {
    id: string;
    name: string;
    type: 'cve' | 'exploit' | 'malware' | 'phishing' | 'threat-actor';
    provider: string;
    updateInterval: number;
    lastUpdate: number;
    credentials?: {
        apiKey?: string;
        username?: string;
        certificate?: string;
    };
}

// Remplacer any par un type plus précis
interface ThreatIndicatorAttributes {
    tags?: string[];
    malwareFamily?: string;
    ipInfo?: {
        asn?: string;
        country?: string;
        organization?: string;
    };
    domainInfo?: {
        registrar?: string;
        creationDate?: number;
        expirationDate?: number;
    };
    fileInfo?: {
        hash?: string;
        size?: number;
        fileType?: string;
    };
    [key: string]: unknown;
}

interface ThreatIndicator {
    id: string;
    type: string;
    value: string;
    confidence: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    firstSeen: number;
    lastSeen: number;
    attributes: ThreatIndicatorAttributes;
    relatedIndicators?: string[];
    source: string;
}

interface Vulnerability {
    cveId: string;
    description: string;
    cvssScore: number;
    affectedSystems: string[];
    status: 'new' | 'analyzing' | 'confirmed' | 'mitigated' | 'resolved';
    discoveryDate: number;
    patchAvailable: boolean;
    exploitAvailable: boolean;
    mitigationSteps: string[]; // Obligatoire mais peut être un tableau vide
}

interface ThreatPattern {
    id: string;
    name: string;
    description: string;
    indicators: ThreatIndicator[];
    detectionRules: DetectionRule[];
    mitigationSteps: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
}

interface DetectionRule {
    id: string;
    name: string;
    type: 'signature' | 'behavior' | 'anomaly' | 'correlation';
    condition: string;
    threshold?: number;
    timeWindow?: number;
    actions: ThreatAction[];
}

interface ThreatActionParameters {
    recipient?: string;
    message?: string;
    channel?: string;
    ipAddress?: string;
    domain?: string;
    systemId?: string;
    monitoringLevel?: string;
    duration?: number;
    format?: string;
    [key: string]: unknown;
}

interface ThreatAction {
    type: 'alert' | 'block' | 'monitor' | 'isolate' | 'report';
    parameters: ThreatActionParameters;
    priority: number;
    automated: boolean;
}

interface ThreatReport {
    id: string;
    timestamp: number;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    indicators: ThreatIndicator[];
    affectedSystems: string[];
    analysis: {
        confidence: number;
        impact: string;
        recommendations: string[];
    };
    status: 'new' | 'analyzing' | 'confirmed' | 'mitigated' | 'resolved';
}

// Interface pour les données de feed
interface FeedData {
    indicators?: ThreatIndicator[];
    vulnerabilities?: Vulnerability[];
    patterns?: ThreatPattern[];
    [key: string]: unknown;
}

/**
 * Système d'intelligence des menaces de sécurité
 * 
 * Cette classe gère la collecte, l'analyse et la réponse aux menaces de sécurité
 * en s'intégrant avec différentes sources de données et en fournissant des mécanismes
 * automatisés de détection et de réponse.
 */
export class SecurityThreatIntelligence {
    private readonly threatFeeds = new Map<string, ThreatFeed>();
    private readonly indicators = new Map<string, ThreatIndicator>();
    private readonly vulnerabilities = new Map<string, Vulnerability>();
    private readonly patterns = new Map<string, ThreatPattern>();
    private readonly reports = new Map<string, ThreatReport>();

    private readonly updateIntervals: NodeJS.Timeout[] = [];

    constructor(
        private readonly securityAuditor: SecurityAuditor
    ) {
        this.initializeDefaultFeeds();
        this.startFeedUpdates();
    }

    /**
     * Analyse une potentielle menace basée sur des indicateurs
     * @param context Contexte de sécurité de la requête
     * @param indicators Indicateurs de menace à analyser
     * @returns Rapport de menace généré
     */
    async analyzeThreat(
        context: SecurityContext,
        indicators: Partial<ThreatIndicator>[]
    ): Promise<ThreatReport> {
        try {
            // Enrichir les indicateurs avec les données connues
            const enrichedIndicators = await this.enrichIndicators(indicators);

            // Identifier les patterns correspondants
            const matchedPatterns = await this.identifyPatterns(enrichedIndicators);

            // Analyser les systèmes affectés
            const affectedSystems = await this.analyzeAffectedSystems(enrichedIndicators);

            // Créer le rapport
            const report: ThreatReport = {
                id: this.generateReportId(),
                timestamp: Date.now(),
                type: this.determineType(enrichedIndicators),
                severity: this.calculateSeverity(enrichedIndicators, matchedPatterns),
                indicators: enrichedIndicators,
                affectedSystems,
                analysis: {
                    confidence: this.calculateThreatConfidence(enrichedIndicators, matchedPatterns),
                    impact: this.determineThreatImpact(affectedSystems),
                    recommendations: this.generateActionRecommendations(matchedPatterns)
                },
                status: 'new'
            };

            // Sauvegarder et auditer le rapport
            this.reports.set(report.id, report);
            await this.auditThreatAnalysis(context, report);

            // Déclencher les actions automatiques si nécessaire
            await this.executeAutomatedActions(report, matchedPatterns);

            return report;

        } catch (error) {
            throw new Error(`Threat analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Met à jour les sources d'intelligence de menaces
     */
    async updateThreatIntelligence(): Promise<void> {
        try {
            for (const feed of this.threatFeeds.values()) {
                if (this.shouldUpdateFeed(feed)) {
                    await this.updateFeed(feed);
                }
            }
        } catch (error) {
            console.error('Failed to update threat intelligence:', error);
        }
    }

    /**
     * Ajoute un indicateur de menace à la base de connaissances
     * @param indicator Indicateur à ajouter
     */
    async addThreatIndicator(indicator: ThreatIndicator): Promise<void> {
        // Valider et enrichir l'indicateur
        const enrichedIndicator = await this.validateAndEnrich(indicator);

        // Sauvegarder l'indicateur
        this.indicators.set(enrichedIndicator.id, enrichedIndicator);

        // Mettre à jour les patterns associés
        await this.updatePatterns(enrichedIndicator);
    }

    /**
     * Ajoute une vulnérabilité à la base de connaissances
     * @param vulnerability Vulnérabilité à ajouter
     */
    async addVulnerability(vulnerability: Vulnerability): Promise<void> {
        // Valider et enrichir la vulnérabilité
        const enrichedVulnerability = await this.validateVulnerability(vulnerability);

        // Sauvegarder la vulnérabilité
        this.vulnerabilities.set(enrichedVulnerability.cveId, enrichedVulnerability);

        // Créer un rapport si nécessaire
        if (this.isHighRisk(enrichedVulnerability)) {
            await this.generateVulnerabilityReport(enrichedVulnerability);
        }
    }

    // ========== Méthodes privées d'implémentation ==========

    /**
     * Enrichit des indicateurs partiels avec des données supplémentaires
     */
    private async enrichIndicators(
        partialIndicators: Partial<ThreatIndicator>[]
    ): Promise<ThreatIndicator[]> {
        const enrichedIndicators: ThreatIndicator[] = [];

        for (const partialIndicator of partialIndicators) {
            // Rechercher des indicateurs similaires connus
            const knownIndicators = Array.from(this.indicators.values())
                .filter(i => this.checkSimilarIndicators(i, partialIndicator));

            // Enrichir avec les données connues
            const enriched: ThreatIndicator = {
                id: partialIndicator.id || this.generateIndicatorId(),
                type: partialIndicator.type || this.determineIndicatorType(partialIndicator),
                value: partialIndicator.value || '',
                confidence: this.calculateIndicatorConfidence(partialIndicator, knownIndicators),
                severity: this.determineIndicatorSeverity(partialIndicator, knownIndicators),
                firstSeen: partialIndicator.firstSeen || Date.now(),
                lastSeen: Date.now(),
                attributes: this.mergeAttributes(partialIndicator.attributes, knownIndicators),
                source: partialIndicator.source || 'internal',
                relatedIndicators: this.correlateIndicators([partialIndicator as ThreatIndicator]).relatedIndicators.map(i => i.id)
            };

            enrichedIndicators.push(enriched);
        }

        return enrichedIndicators;
    }

    /**
     * Identifie les patterns correspondant à un ensemble d'indicateurs
     */
    private async identifyPatterns(
        indicators: ThreatIndicator[]
    ): Promise<ThreatPattern[]> {
        const matchedPatterns: ThreatPattern[] = [];

        for (const pattern of this.patterns.values()) {
            if (this.doesPatternMatch(pattern, indicators)) {
                matchedPatterns.push(pattern);
            }
        }

        return matchedPatterns;
    }

    /**
     * Vérifie si un pattern correspond à un ensemble d'indicateurs
     */
    private doesPatternMatch(pattern: ThreatPattern, threatIndicators: ThreatIndicator[]): boolean {
        // Implémentation simplifiée: vérifier si au moins un indicateur du pattern
        // correspond à un indicateur fourni
        const patternValues = pattern.indicators.map(i => i.value);
        return threatIndicators.some(indicator => patternValues.includes(indicator.value));
    }

    /**
     * Analyse les systèmes potentiellement affectés par des indicateurs
     */
    private async analyzeAffectedSystems(threatIndicators: ThreatIndicator[]): Promise<string[]> {
        const affectedSystems = new Set<string>();

        // Parcourir les vulnérabilités connues et voir si elles sont liées aux indicateurs
        for (const vulnerability of this.vulnerabilities.values()) {
            // Vérifier si cette vulnérabilité est liée à un des indicateurs
            const isRelated = threatIndicators.some(indicator =>
                vulnerability.description.includes(indicator.value) ||
                (indicator.type === 'cve' && vulnerability.cveId === indicator.value)
            );

            if (isRelated) {
                // Ajouter les systèmes affectés
                vulnerability.affectedSystems.forEach(system =>
                    affectedSystems.add(system)
                );
            }
        }

        // Si aucun système n'est identifié, ajouter des systèmes génériques
        if (affectedSystems.size === 0) {
            affectedSystems.add("unknown-system");
        }

        return Array.from(affectedSystems);
    }

    /**
     * Exécute les actions automatisées définies dans les règles de détection
     */
    private async executeAutomatedActions(
        report: ThreatReport,
        patterns: ThreatPattern[]
    ): Promise<void> {
        for (const pattern of patterns) {
            for (const rule of pattern.detectionRules) {
                for (const action of rule.actions) {
                    if (action.automated) {
                        await this.executeAction(action, report);
                    }
                }
            }
        }
    }

    /**
     * Exécute une action de réponse à une menace
     */
    private async executeAction(action: ThreatAction, report: ThreatReport): Promise<void> {
        switch (action.type) {
            case 'alert':
                await this.executeAlertAction(action.parameters, report);
                break;
            case 'block':
                await this.executeBlockAction(action.parameters, report);
                break;
            case 'isolate':
                await this.executeIsolateAction(action.parameters, report);
                break;
            case 'monitor':
                await this.executeMonitorAction(action.parameters, report);
                break;
            case 'report':
                await this.executeReportAction(action.parameters, report);
                break;
        }
    }

    /**
     * Exécute une action d'alerte
     */
    private async executeAlertAction(parameters: ThreatActionParameters, report: ThreatReport): Promise<void> {
        // Implémenter l'envoi d'alerte
        console.log(`Sending alert for report ${report.id} with severity ${report.severity}`, parameters);

        // Exemple d'implémentation potentielle
        const recipient = parameters.recipient || 'security-team';
        const channel = parameters.channel || 'email';
        const message = parameters.message || `Security alert: ${report.type} threat detected`;

        console.log(`Alert sent to ${recipient} via ${channel}: ${message}`);
    }

    /**
     * Exécute une action de blocage
     */
    private async executeBlockAction(parameters: ThreatActionParameters, report: ThreatReport): Promise<void> {
        // Implémenter le blocage de menace
        console.log(`Blocking threat for report ${report.id}`, parameters);

        // Exemple d'implémentation potentielle
        if (parameters.ipAddress) {
            console.log(`Blocking IP address: ${parameters.ipAddress}`);
        }

        if (parameters.domain) {
            console.log(`Blocking domain: ${parameters.domain}`);
        }

        // Bloquer les indicateurs du rapport
        report.indicators.forEach(indicator => {
            console.log(`Blocking indicator: ${indicator.type}:${indicator.value}`);
        });
    }

    /**
     * Exécute une action d'isolation
     */
    private async executeIsolateAction(parameters: ThreatActionParameters, report: ThreatReport): Promise<void> {
        // Implémenter l'isolation du système
        const systemId = parameters.systemId || report.affectedSystems[0] || 'unknown';
        console.log(`Isolating system ${systemId} for report ${report.id}`);

        // Exemple d'implémentation potentielle
        const duration = parameters.duration || 3600; // Durée par défaut: 1 heure
        console.log(`System ${systemId} isolated for ${duration} seconds`);

        // Logging des systèmes isolés
        report.affectedSystems.forEach(system => {
            if (system !== systemId) {
                console.log(`Additional system that may need isolation: ${system}`);
            }
        });
    }

    /**
     * Exécute une action de monitoring
     */
    private async executeMonitorAction(parameters: ThreatActionParameters, report: ThreatReport): Promise<void> {
        // Implémenter le monitoring renforcé
        const level = parameters.monitoringLevel || 'enhanced';
        console.log(`Enhancing monitoring to level ${level} for report ${report.id}`);

        // Exemple d'implémentation potentielle
        report.affectedSystems.forEach(system => {
            console.log(`Enhanced monitoring activated for system: ${system}`);
        });

        report.indicators.forEach(indicator => {
            console.log(`Setting up monitoring for indicator: ${indicator.type}:${indicator.value}`);
        });
    }

    /**
     * Exécute une action de génération de rapport
     */
    private async executeReportAction(parameters: ThreatActionParameters, report: ThreatReport): Promise<void> {
        // Implémenter la génération de rapport détaillé
        const format = parameters.format || 'pdf';
        console.log(`Generating detailed ${format} report for ${report.id}`);

        // Exemple d'implémentation potentielle
        const reportDetails = {
            title: `Threat Report: ${report.type}`,
            generatedAt: new Date().toISOString(),
            severity: report.severity,
            indicators: report.indicators.map(i => `${i.type}: ${i.value}`),
            affectedSystems: report.affectedSystems,
            recommendations: report.analysis.recommendations,
            confidenceScore: report.analysis.confidence
        };

        console.log(`Report generated successfully:`, reportDetails);
    }

    /**
     * Met à jour une source de données de menaces
     */
    private async updateFeed(feed: ThreatFeed): Promise<void> {
        try {
            // Récupérer les nouvelles données
            const newData = await this.fetchFeedData(feed);

            // Traiter les nouvelles données
            await this.processFeedData(feed, newData);

            // Mettre à jour le timestamp
            const updatedFeed = { ...feed, lastUpdate: Date.now() };
            this.threatFeeds.set(feed.id, updatedFeed);

            // Auditer la mise à jour réussie
            await this.auditFeedUpdate(feed, true);
        } catch (error) {
            console.error(`Failed to update feed ${feed.id}:`, error);

            // Convertir error en Error pour la compatibilité
            const typedError = error instanceof Error ? error : new Error(String(error));
            await this.auditFeedUpdate(feed, false, typedError);
        }
    }

    /**
     * Récupère les données d'une source de menaces
     */
    private async fetchFeedData(feed: ThreatFeed): Promise<FeedData> {
        console.log(`Fetching data from feed: ${feed.name} (${feed.id})`);

        // Simuler les différents types de feeds
        switch (feed.type) {
            case 'cve':
                return this.fetchCVEData(feed);
            case 'threat-actor':
                return this.fetchThreatActorData(feed);
            case 'malware':
                return this.fetchMalwareData(feed);
            case 'phishing':
                return this.fetchPhishingData(feed);
            case 'exploit':
                return this.fetchExploitData(feed);
            default:
                return {};
        }
    }

    /**
     * Récupère les données de vulnérabilités CVE
     */
    private async fetchCVEData(feed: ThreatFeed): Promise<FeedData> {
        // Simuler la récupération de données CVE
        console.log(`Fetching CVE data from ${feed.provider}`);

        // En production, cela ferait un appel API à NVD ou autre source
        return {
            vulnerabilities: [
                {
                    cveId: `CVE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    description: "Example vulnerability for demonstration purposes",
                    cvssScore: 7.5 + Math.random() * 2.5,
                    affectedSystems: ["system-1", "system-2"],
                    status: "new",
                    discoveryDate: Date.now() - 86400000, // 1 jour
                    patchAvailable: Math.random() > 0.5,
                    exploitAvailable: Math.random() > 0.7,
                    mitigationSteps: [] // Ajouter un tableau vide pour respecter le type
                }
            ]
        };
    }


    /**
     * Récupère les données d'acteurs malveillants
     */
    private async fetchThreatActorData(feed: ThreatFeed): Promise<FeedData> {
        // Simuler la récupération de données d'acteurs malveillants
        console.log(`Fetching threat actor data from ${feed.provider}`);

        return {
            indicators: [
                {
                    id: `indicator-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: "ip",
                    value: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
                    confidence: 0.75 + Math.random() * 0.25,
                    severity: "high",
                    firstSeen: Date.now() - 172800000, // 2 jours
                    lastSeen: Date.now(),
                    attributes: {
                        tags: ["APT", "Command & Control"]
                    },
                    source: feed.id
                }
            ]
        };
    }

    /**
     * Récupère les données de malware
     */
    private async fetchMalwareData(feed: ThreatFeed): Promise<FeedData> {
        console.log(`Fetching malware data from ${feed.provider}`);

        return {
            indicators: [
                {
                    id: `indicator-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: "hash",
                    value: Array.from({ length: 64 }, () =>
                        "0123456789abcdef"[Math.floor(Math.random() * 16)]
                    ).join(''),
                    confidence: 0.8 + Math.random() * 0.2,
                    severity: "critical",
                    firstSeen: Date.now() - 259200000, // 3 jours
                    lastSeen: Date.now(),
                    attributes: {
                        tags: ["Malware", "Ransomware"],
                        malwareFamily: "Example-Ransomware"
                    },
                    source: feed.id
                }
            ]
        };
    }

    /**
     * Récupère les données de phishing
     */
    private async fetchPhishingData(feed: ThreatFeed): Promise<FeedData> {
        console.log(`Fetching phishing data from ${feed.provider}`);

        return {
            indicators: [
                {
                    id: `indicator-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: "domain",
                    value: `phishing-${Math.floor(Math.random() * 1000)}.example.com`,
                    confidence: 0.7 + Math.random() * 0.3,
                    severity: "medium",
                    firstSeen: Date.now() - 86400000, // 1 jour
                    lastSeen: Date.now(),
                    attributes: {
                        tags: ["Phishing", "Credential Theft"],
                        domainInfo: {
                            registrar: "Example Registrar",
                            creationDate: Date.now() - 604800000, // 1 semaine
                            expirationDate: Date.now() + 31536000000 // 1 an
                        }
                    },
                    source: feed.id
                }
            ]
        };
    }

    /**
     * Récupère les données d'exploits
     */
    private async fetchExploitData(feed: ThreatFeed): Promise<FeedData> {
        console.log(`Fetching exploit data from ${feed.provider}`);

        return {
            indicators: [
                {
                    id: `indicator-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    type: "exploit",
                    value: `EDB-ID-${Math.floor(10000 + Math.random() * 90000)}`,
                    confidence: 0.85 + Math.random() * 0.15,
                    severity: "high",
                    firstSeen: Date.now() - 432000000, // 5 jours
                    lastSeen: Date.now(),
                    attributes: {
                        tags: ["Exploit", "Remote Code Execution"],
                        relatedCVE: `CVE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
                    },
                    source: feed.id
                }
            ]
        };
    }

    /**
     * Traite les données récupérées d'une source
     */
    private async processFeedData(feed: ThreatFeed, data: FeedData): Promise<void> {
        console.log(`Processing data from feed: ${feed.name} (${feed.id})`);

        // Traiter les indicateurs
        if (data.indicators && data.indicators.length > 0) {
            console.log(`Processing ${data.indicators.length} indicators from ${feed.id}`);

            for (const indicator of data.indicators) {
                // S'assurer que l'indicateur a un ID et une source
                const processedIndicator = {
                    ...indicator,
                    id: indicator.id || this.generateIndicatorId(),
                    source: indicator.source || feed.id
                };

                // Ajouter ou mettre à jour l'indicateur
                this.indicators.set(processedIndicator.id, processedIndicator);
            }
        }

        // Traiter les vulnérabilités
        if (data.vulnerabilities && data.vulnerabilities.length > 0) {
            console.log(`Processing ${data.vulnerabilities.length} vulnerabilities from ${feed.id}`);

            for (const vulnerability of data.vulnerabilities) {
                // Ajouter ou mettre à jour la vulnérabilité
                this.vulnerabilities.set(vulnerability.cveId, vulnerability);

                // Si c'est une vulnérabilité à haut risque, créer un rapport
                if (this.isHighRisk(vulnerability)) {
                    await this.generateVulnerabilityReport(vulnerability);
                }
            }
        }

        // Traiter les patterns
        if (data.patterns && data.patterns.length > 0) {
            console.log(`Processing ${data.patterns.length} patterns from ${feed.id}`);

            for (const pattern of data.patterns) {
                // Ajouter ou mettre à jour le pattern
                this.patterns.set(pattern.id, pattern);
            }
        }
    }

    /**
     * Initialise les sources de données par défaut
     */
    private initializeDefaultFeeds(): void {
        this.addFeed({
            id: 'cve-feed',
            name: 'CVE Database',
            type: 'cve',
            provider: 'nvd.nist.gov',
            updateInterval: 24 * 60 * 60 * 1000, // 24 heures
            lastUpdate: 0
        });

        this.addFeed({
            id: 'threat-intel',
            name: 'Threat Intelligence Feed',
            type: 'threat-actor',
            provider: 'internal',
            updateInterval: 6 * 60 * 60 * 1000, // 6 heures
            lastUpdate: 0
        });

        this.addFeed({
            id: 'malware-feed',
            name: 'Malware Analysis Feed',
            type: 'malware',
            provider: 'virustotal.com',
            updateInterval: 12 * 60 * 60 * 1000, // 12 heures
            lastUpdate: 0
        });

        this.addFeed({
            id: 'phishing-feed',
            name: 'Phishing Sites Database',
            type: 'phishing',
            provider: 'phishtank.org',
            updateInterval: 3 * 60 * 60 * 1000, // 3 heures
            lastUpdate: 0
        });
    }

    /**
     * Démarre les mises à jour automatiques des sources
     */
    private startFeedUpdates(): void {
        for (const feed of this.threatFeeds.values()) {
            const interval = setInterval(
                () => this.updateFeed(feed),
                feed.updateInterval
            );
            this.updateIntervals.push(interval);
        }
    }

    /**
     * Vérifie si une source doit être mise à jour
     */
    private shouldUpdateFeed(feed: ThreatFeed): boolean {
        return Date.now() - feed.lastUpdate >= feed.updateInterval;
    }

    /**
     * Journalise une analyse de menace
     */
    private async auditThreatAnalysis(
        _context: SecurityContext,
        report: ThreatReport
    ): Promise<void> {
        // Conversion des types pour correspondre à SecurityEvent
        const severityMap: Record<string, SecuritySeverity> = {
            'low': 'LOW',
            'medium': 'MEDIUM',
            'high': 'HIGH',
            'critical': 'CRITICAL'
        };

        await this.securityAuditor.logSecurityEvent({
            type: 'threat_analysis',
            severity: severityMap[report.severity],
            timestamp: new Date(), // Utilisation d'un objet Date au lieu d'un nombre
            details: {
                reportId: report.id,
                threatType: report.type,
                indicatorCount: report.indicators.length,
                affectedSystems: report.affectedSystems
            },
            source: 'SecurityThreatIntelligence'
            // Supprimé la propriété context qui n'existe pas dans SecurityEvent
        });
    }

    /**
     * Journalise une mise à jour de source
     */
    private async auditFeedUpdate(
        feed: ThreatFeed,
        success: boolean,
        error?: Error
    ): Promise<void> {
        // Conversion des types pour correspondre à SecurityEvent
        await this.securityAuditor.logSecurityEvent({
            type: 'feed_update',
            severity: success ? 'LOW' : 'HIGH',
            timestamp: new Date(), // Utilisation d'un objet Date au lieu d'un nombre
            details: {
                feedId: feed.id,
                success,
                error: error?.message
            },
            source: 'SecurityThreatIntelligence'
            // Supprimé la propriété context qui n'existe pas dans SecurityEvent
        });
    }

    // ========== Méthodes utilitaires ==========

    /**
     * Génère un identifiant unique pour un rapport
     */
    private generateReportId(): string {
        return `threat_report_${Date.now()}_${crypto.randomUUID()}`;
    }

    /**
     * Génère un identifiant unique pour un indicateur
     */
    private generateIndicatorId(): string {
        return `indicator_${Date.now()}_${crypto.randomUUID()}`;
    }

    /**
     * Valide et enrichit un indicateur de menace
     */
    private async validateAndEnrich(indicator: ThreatIndicator): Promise<ThreatIndicator> {
        // Validation de base
        if (!indicator.value) {
            throw new Error('Indicator value is required');
        }

        // S'assurer que tous les champs requis sont présents
        const enriched: ThreatIndicator = {
            ...indicator,
            id: indicator.id || this.generateIndicatorId(),
            type: indicator.type || this.determineIndicatorType({ value: indicator.value }),
            confidence: indicator.confidence || 0.5,
            severity: indicator.severity || 'medium',
            firstSeen: indicator.firstSeen || Date.now(),
            lastSeen: Date.now(),
            attributes: indicator.attributes || {},
            source: indicator.source || 'manual'
        };

        // Rechercher des indicateurs similaires pour enrichissement
        const similarIndicators = Array.from(this.indicators.values())
            .filter(i => this.checkSimilarIndicators(i, enriched));

        // Enrichir avec des informations additionnelles si disponibles
        if (similarIndicators.length > 0) {
            // Mettre à jour la confiance et la sévérité si les valeurs existantes sont faibles
            if (enriched.confidence < 0.7) {
                enriched.confidence = Math.max(
                    enriched.confidence,
                    this.calculateIndicatorConfidence(enriched, similarIndicators)
                );
            }

            // Fusionner les attributs
            enriched.attributes = this.mergeAttributes(
                enriched.attributes,
                similarIndicators
            );

            // Ajouter des indicateurs liés
            const relatedIds = new Set<string>(enriched.relatedIndicators || []);
            for (const similar of similarIndicators) {
                if (similar.id !== enriched.id) {
                    relatedIds.add(similar.id);
                }

                if (similar.relatedIndicators) {
                    for (const relatedId of similar.relatedIndicators) {
                        relatedIds.add(relatedId);
                    }
                }
            }

            enriched.relatedIndicators = Array.from(relatedIds);
        }

        return enriched;
    }

    /**
     * Met à jour les patterns associés à un indicateur
     */
    private async updatePatterns(indicator: ThreatIndicator): Promise<void> {
        // Parcourir tous les patterns existants
        for (const pattern of this.patterns.values()) {
            // Vérifier si l'indicateur pourrait faire partie de ce pattern
            const patternIndicatorValues = pattern.indicators.map(i => i.value);
            const patternIndicatorTypes = pattern.indicators.map(i => i.type);

            if (patternIndicatorValues.includes(indicator.value) ||
                (patternIndicatorTypes.includes(indicator.type) && indicator.severity === 'high')) {

                // Ajouter l'indicateur au pattern s'il n'y est pas déjà
                const exists = pattern.indicators.some(i => i.id === indicator.id);
                if (!exists) {
                    // Créer une copie pour éviter de modifier l'indicateur original
                    const patternIndicators = [...pattern.indicators, indicator];

                    // Mettre à jour le pattern
                    const updatedPattern = {
                        ...pattern,
                        indicators: patternIndicators
                    };

                    this.patterns.set(pattern.id, updatedPattern);
                }
            }
        }
    }

    /**
     * Valide et enrichit une vulnérabilité
     */
    private async validateVulnerability(vulnerability: Vulnerability): Promise<Vulnerability> {
        // Validation de base
        if (!vulnerability.cveId) {
            throw new Error('CVE ID is required');
        }

        // Vérifier si cette vulnérabilité existe déjà
        const existingVuln = this.vulnerabilities.get(vulnerability.cveId);

        if (existingVuln) {
            // Créer une copie des tableaux pour éviter les problèmes de readonly
            const updatedAffectedSystems = [...new Set([
                ...existingVuln.affectedSystems,
                ...vulnerability.affectedSystems
            ])];

            const updatedMitigationSteps = vulnerability.mitigationSteps.length > 0
                ? [...vulnerability.mitigationSteps]
                : [...existingVuln.mitigationSteps];

            // Fusionner avec les données existantes
            return {
                ...existingVuln,
                description: vulnerability.description || existingVuln.description,
                cvssScore: vulnerability.cvssScore || existingVuln.cvssScore,
                affectedSystems: updatedAffectedSystems,
                status: vulnerability.status || existingVuln.status,
                patchAvailable: vulnerability.patchAvailable !== undefined ?
                    vulnerability.patchAvailable : existingVuln.patchAvailable,
                exploitAvailable: vulnerability.exploitAvailable !== undefined ?
                    vulnerability.exploitAvailable : existingVuln.exploitAvailable,
                mitigationSteps: updatedMitigationSteps
            };
        }

        // S'assurer que tous les champs requis sont présents pour une nouvelle vulnérabilité
        return {
            ...vulnerability,
            discoveryDate: vulnerability.discoveryDate || Date.now(),
            status: vulnerability.status || 'new',
            affectedSystems: vulnerability.affectedSystems.length > 0
                ? [...vulnerability.affectedSystems]
                : [],
            patchAvailable: vulnerability.patchAvailable !== undefined
                ? vulnerability.patchAvailable
                : false,
            exploitAvailable: vulnerability.exploitAvailable !== undefined
                ? vulnerability.exploitAvailable
                : false,
            mitigationSteps: vulnerability.mitigationSteps.length > 0
                ? [...vulnerability.mitigationSteps]
                : []
        };
    }

    /**
     * Détermine si une vulnérabilité présente un risque élevé
     */
    private isHighRisk(vulnerability: Vulnerability): boolean {
        // Une vulnérabilité est considérée à haut risque si:
        // - Son score CVSS est élevé (≥ 7.0)
        // - ET/OU un exploit est disponible
        // - ET elle n'est pas déjà résolue
        return (
            (vulnerability.cvssScore >= 7.0 || vulnerability.exploitAvailable) &&
            vulnerability.status !== 'resolved' &&
            vulnerability.status !== 'mitigated'
        );
    }

    /**
     * Génère un rapport pour une vulnérabilité à haut risque
     */
    private async generateVulnerabilityReport(vulnerability: Vulnerability): Promise<void> {
        // Créer un rapport basé sur la vulnérabilité
        const reportId = this.generateReportId();

        // Créer un indicateur pour cette vulnérabilité
        const vulnIndicator: ThreatIndicator = {
            id: `indicator_${vulnerability.cveId}`,
            type: 'cve',
            value: vulnerability.cveId,
            confidence: 0.9, // Haute confiance pour les CVE confirmés
            severity: this.mapCVSSSeverity(vulnerability.cvssScore),
            firstSeen: vulnerability.discoveryDate,
            lastSeen: Date.now(),
            attributes: {
                description: vulnerability.description,
                patchAvailable: vulnerability.patchAvailable,
                exploitAvailable: vulnerability.exploitAvailable
            },
            source: 'cve-feed'
        };

        // Ajouter l'indicateur si nécessaire
        if (!this.indicators.has(vulnIndicator.id)) {
            this.indicators.set(vulnIndicator.id, vulnIndicator);
        }

        // Créer le rapport
        const vulnReport: ThreatReport = {
            id: reportId,
            timestamp: Date.now(),
            type: 'vulnerability',
            severity: this.mapCVSSSeverity(vulnerability.cvssScore),
            indicators: [vulnIndicator],
            affectedSystems: vulnerability.affectedSystems,
            analysis: {
                confidence: 0.9,
                impact: this.determineVulnerabilityImpact(vulnerability),
                recommendations: this.generateVulnerabilityRecommendations(vulnerability)
            },
            status: 'new'
        };

        // Sauvegarder le rapport
        this.reports.set(reportId, vulnReport);

        console.log(`Vulnerability report generated: ${reportId} for ${vulnerability.cveId}`);
    }

    /**
     * Convertit un score CVSS en niveau de sévérité
     */
    private mapCVSSSeverity(cvssScore: number): 'low' | 'medium' | 'high' | 'critical' {
        if (cvssScore >= 9.0) return 'critical';
        if (cvssScore >= 7.0) return 'high';
        if (cvssScore >= 4.0) return 'medium';
        return 'low';
    }

    /**
     * Détermine l'impact d'une vulnérabilité
     */
    private determineVulnerabilityImpact(vulnerability: Vulnerability): string {
        const { cvssScore, exploitAvailable, affectedSystems } = vulnerability;

        // Formater une description de l'impact
        let impact = `This vulnerability has a CVSS score of ${cvssScore.toFixed(1)}`;

        if (exploitAvailable) {
            impact += " and has known exploits in the wild, which increases the risk significantly";
        }

        if (affectedSystems.length > 0) {
            impact += `. It affects ${affectedSystems.length} system${affectedSystems.length > 1 ? 's' : ''} in your environment`;
        }

        // Ajouter des détails sur le niveau d'impact
        if (cvssScore >= 9.0) {
            impact += ". This is a CRITICAL vulnerability that could lead to system compromise with minimal interaction.";
        } else if (cvssScore >= 7.0) {
            impact += ". This is a HIGH severity issue that should be addressed promptly.";
        } else if (cvssScore >= 4.0) {
            impact += ". This is a MEDIUM severity issue that should be scheduled for remediation.";
        } else {
            impact += ". This is a LOW severity issue that should be tracked in your vulnerability management system.";
        }

        return impact;
    }

    /**
     * Génère des recommandations pour une vulnérabilité
     */
    private generateVulnerabilityRecommendations(vulnerability: Vulnerability): string[] {
        const recommendations: string[] = [];

        // Ajouter les étapes de mitigation fournies si elles existent
        if (vulnerability.mitigationSteps && vulnerability.mitigationSteps.length > 0) {
            // Créer une copie pour éviter les problèmes de readonly
            recommendations.push(...[...vulnerability.mitigationSteps]);
        } else {
            // Recommandations génériques basées sur les attributs de la vulnérabilité
            if (vulnerability.patchAvailable) {
                recommendations.push("Apply the vendor patch as soon as possible.");
            } else {
                recommendations.push("No patch is currently available. Consider implementing mitigating controls.");
            }

            if (vulnerability.exploitAvailable) {
                recommendations.push("Exploits are available. Consider implementing additional monitoring and network restrictions.");
            }

            // Ajouter des recommandations basées sur la gravité
            if (vulnerability.cvssScore >= 7.0) {
                recommendations.push("Prioritize remediation due to high severity.");
                recommendations.push("Temporarily isolate affected systems if patching is not immediately possible.");
            }
        }

        // Ajouter des recommandations générales
        recommendations.push("Update your vulnerability management system with the status of this issue.");
        recommendations.push("Conduct a thorough review of affected systems after remediation.");

        return recommendations;
    }

    /**
     * Détermine le type de menace en fonction des indicateurs
     */
    private determineType(indicators: ThreatIndicator[]): string {
        // Compter les types d'indicateurs
        const typeCounts: Record<string, number> = {};

        for (const indicator of indicators) {
            typeCounts[indicator.type] = (typeCounts[indicator.type] || 0) + 1;
        }

        // Trouver le type le plus fréquent
        let mostFrequentType = '';
        let highestCount = 0;

        for (const [type, count] of Object.entries(typeCounts)) {
            if (count > highestCount) {
                mostFrequentType = type;
                highestCount = count;
            }
        }

        // Mapper le type d'indicateur à un type de menace
        switch (mostFrequentType) {
            case 'ip':
                return 'network';
            case 'domain':
                return 'phishing';
            case 'hash':
                return 'malware';
            case 'cve':
                return 'vulnerability';
            case 'exploit':
                return 'exploit';
            default:
                return 'unknown';
        }
    }

    /**
     * Calcule la sévérité de la menace en fonction des indicateurs et patterns
     */
    private calculateSeverity(
        indicators: ThreatIndicator[],
        patterns: ThreatPattern[]
    ): 'low' | 'medium' | 'high' | 'critical' {
        // Compter les niveaux de sévérité
        const severityCounts: Record<string, number> = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        // Compter dans les indicateurs
        for (const indicator of indicators) {
            severityCounts[indicator.severity]++;
        }

        // Compter dans les patterns
        for (const pattern of patterns) {
            severityCounts[pattern.severity]++;
        }

        // Déterminer la sévérité en fonction des comptages
        if (severityCounts.critical > 0) return 'critical';
        if (severityCounts.high > 0) return 'high';
        if (severityCounts.medium > 0) return 'medium';
        return 'low';
    }

    /**
     * Calcule le niveau de confiance de l'analyse
     */
    private calculateThreatConfidence(
        indicators: ThreatIndicator[],
        patterns: ThreatPattern[]
    ): number {
        // Calculer la confiance moyenne des indicateurs
        const indicatorConfidences = indicators.map(i => i.confidence);

        // Calculer la confiance moyenne des patterns
        const patternConfidences = patterns.map(p => p.confidence);

        // Combiner les deux
        const allConfidences = [...indicatorConfidences, ...patternConfidences];

        // Calculer la moyenne, avec un minimum de 0.1 et un maximum de 1.0
        if (allConfidences.length === 0) return 0.5; // Valeur par défaut

        const avgConfidence = allConfidences.reduce((sum, val) => sum + val, 0) / allConfidences.length;
        return Math.min(1.0, Math.max(0.1, avgConfidence));
    }

    /**
     * Détermine l'impact de la menace
     */
    private determineThreatImpact(systems: string[]): string {
        // Formater une description de l'impact
        if (systems.length === 0) {
            return "No direct system impact detected.";
        }

        if (systems.length === 1) {
            return `This threat affects 1 system (${systems[0]}).`;
        }

        if (systems.length <= 3) {
            return `This threat affects ${systems.length} systems (${systems.join(', ')}).`;
        }

        return `This threat affects ${systems.length} systems, including ${systems.slice(0, 3).join(', ')} and others.`;
    }

    /**
     * Génère des recommandations d'action
     */
    private generateActionRecommendations(patterns: ThreatPattern[]): string[] {
        const recommendations = new Set<string>();

        // Ajouter les étapes de mitigation des patterns
        for (const pattern of patterns) {
            for (const step of pattern.mitigationSteps) {
                recommendations.add(step);
            }
        }

        // Si aucune recommandation spécifique n'est disponible, ajouter des recommandations génériques
        if (recommendations.size === 0) {
            recommendations.add("Monitor for additional indicators of compromise.");
            recommendations.add("Review logs for suspicious activities.");
            recommendations.add("Ensure all systems are fully patched and up to date.");
            recommendations.add("Verify that security controls are functioning properly.");
        }

        return Array.from(recommendations);
    }

    /**
     * Vérifie si deux indicateurs sont similaires
     */
    private checkSimilarIndicators(known: ThreatIndicator, current: Partial<ThreatIndicator>): boolean {
        // Vérifier si les indicateurs ont la même valeur
        if (current.value && known.value === current.value) return true;

        // Vérifier si les indicateurs ont le même type et des valeurs similaires
        if (current.type && known.type === current.type && current.value && known.value.includes(current.value)) return true;

        return false;
    }

    /**
     * Détermine le type d'un indicateur en fonction de sa valeur
     */
    private determineIndicatorType(indicator: Partial<ThreatIndicator>): string {
        // Déterminer le type d'indicateur
        if (!indicator.value) return 'unknown';

        if (indicator.value.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) return 'ip';
        if (indicator.value.match(/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) return 'domain';
        if (indicator.value.match(/^[a-fA-F0-9]{32,}$/)) return 'hash';
        if (indicator.value.match(/^CVE-\d{4}-\d{4,}$/)) return 'cve';

        return 'string';
    }

    /**
     * Calcule le niveau de confiance d'un indicateur
     */
    private calculateIndicatorConfidence(
        indicator: Partial<ThreatIndicator>,
        similarIndicators: ThreatIndicator[]
    ): number {
        // Si l'indicateur a déjà un niveau de confiance, l'utiliser
        if (indicator.confidence !== undefined) return indicator.confidence;

        // Sinon, utiliser la moyenne des indicateurs similaires
        if (similarIndicators.length === 0) return 0.5; // Confiance moyenne par défaut

        return similarIndicators.reduce((acc, ind) => acc + ind.confidence, 0) / similarIndicators.length;
    }

    /**
     * Détermine la sévérité d'un indicateur
     */
    private determineIndicatorSeverity(
        indicator: Partial<ThreatIndicator>,
        similarIndicators: ThreatIndicator[]
    ): 'low' | 'medium' | 'high' | 'critical' {
        // Si l'indicateur a déjà un niveau de sévérité, l'utiliser
        if (indicator.severity) return indicator.severity;

        // Sinon, utiliser la plus haute sévérité des indicateurs similaires
        if (similarIndicators.length === 0) return 'medium'; // Sévérité moyenne par défaut

        const severities = similarIndicators.map(i => i.severity);
        if (severities.includes('critical')) return 'critical';
        if (severities.includes('high')) return 'high';
        if (severities.includes('medium')) return 'medium';
        return 'low';
    }

    /**
     * Fusionne les attributs de plusieurs indicateurs
     */
    private mergeAttributes(
        currentAttributes?: ThreatIndicatorAttributes | Record<string, unknown>,
        similarIndicators: ThreatIndicator[] = []
    ): ThreatIndicatorAttributes {
        // Initialiser avec les attributs actuels
        const merged: ThreatIndicatorAttributes = currentAttributes ? { ...currentAttributes } : {};

        // Fusionner avec les attributs des indicateurs similaires
        for (const indicator of similarIndicators) {
            for (const [key, value] of Object.entries(indicator.attributes)) {
                if (!merged[key]) {
                    merged[key] = value;
                } else if (key === 'tags' && Array.isArray(merged[key]) && Array.isArray(value)) {
                    // Fusionner les tags sans duplication
                    merged[key] = [...new Set([...(merged[key] as string[]), ...(value as string[])])];
                }
            }
        }

        return merged;
    }

    // ========== Méthodes publiques utilitaires ==========
    /**
     * Ajoute une source de données
     */
    public addFeed(feed: ThreatFeed): void {
        this.threatFeeds.set(feed.id, feed);
    }

    /**
     * Supprime une source de données
     */
    public removeFeed(feedId: string): void {
        this.threatFeeds.delete(feedId);
    }

    /**
     * Récupère toutes les sources de données
     */
    public getFeeds(): ThreatFeed[] {
        return Array.from(this.threatFeeds.values());
    }

    /**
     * Récupère tous les indicateurs
     */
    public getIndicators(): ThreatIndicator[] {
        return Array.from(this.indicators.values());
    }

    /**
     * Récupère toutes les vulnérabilités
     */
    public getVulnerabilities(): Vulnerability[] {
        return Array.from(this.vulnerabilities.values());
    }

    /**
     * Récupère tous les patterns
     */
    public getPatterns(): ThreatPattern[] {
        return Array.from(this.patterns.values());
    }

    /**
     * Récupère tous les rapports
     */
    public getReports(): ThreatReport[] {
        return Array.from(this.reports.values());
    }

    /**
     * Récupère les menaces actives
     */
    public async getActiveThreats(): Promise<ThreatReport[]> {
        return this.getReports().filter(report =>
            report.status !== 'resolved' &&
            report.status !== 'mitigated'
        );
    }

    /**
     * Récupère les vulnérabilités à haute priorité
     */
    public async getHighPriorityVulnerabilities(): Promise<Vulnerability[]> {
        return this.getVulnerabilities().filter(vuln =>
            vuln.cvssScore >= 7.0 &&
            vuln.status !== 'resolved'
        );
    }

    /**
     * Recherche des indicateurs selon des critères
     */
    public async searchIndicators(criteria: Partial<ThreatIndicator>): Promise<ThreatIndicator[]> {
        return this.getIndicators().filter(indicator => {
            return Object.entries(criteria).every(([key, value]) => {
                const typedKey = key as keyof ThreatIndicator;
                return indicator[typedKey] === value;
            });
        });
    }

    /**
     * Corrèle des indicateurs pour trouver des relations
     */
    public correlateIndicators(
        threatIndicators: ThreatIndicator[]
    ): {
        relatedIndicators: ThreatIndicator[];
        patterns: ThreatPattern[];
        confidence: number;
    } {
        const relatedIndicators = new Set<ThreatIndicator>();
        const matchedPatterns = new Set<ThreatPattern>();
        let totalConfidence = 0;

        for (const indicator of threatIndicators) {
            // Trouver les indicateurs liés
            if (indicator.relatedIndicators) {
                for (const relatedId of indicator.relatedIndicators) {
                    const related = this.indicators.get(relatedId);
                    if (related) {
                        relatedIndicators.add(related);
                    }
                }
            }

            // Trouver les patterns correspondants
            for (const pattern of this.patterns.values()) {
                if (this.doesPatternMatch(pattern, [indicator])) {
                    matchedPatterns.add(pattern);
                    totalConfidence += pattern.confidence;
                }
            }
        }

        const averageConfidence = matchedPatterns.size > 0
            ? totalConfidence / matchedPatterns.size
            : 0;

        return {
            relatedIndicators: Array.from(relatedIndicators),
            patterns: Array.from(matchedPatterns),
            confidence: averageConfidence
        };
    }

    /**
     * Exporte les données d'intelligence de menaces
     */
    public async exportThreatIntelligence(
        format: 'json' | 'stix' = 'json'
    ): Promise<string> {
        const data = {
            indicators: this.getIndicators(),
            patterns: this.getPatterns(),
            vulnerabilities: this.getVulnerabilities(),
            reports: this.getReports()
        };

        if (format === 'stix') {
            return this.convertToStix(data);
        }

        return JSON.stringify(data, null, 2);
    }

    /**
     * Convertit les données au format STIX
     */
    private convertToStix(data: Record<string, unknown>): string {
        // Implémenter la conversion au format STIX
        // https://oasis-open.github.io/cti-documentation/
        return JSON.stringify(data);
    }

    /**
     * Nettoie les données obsolètes
     */
    public async cleanup(): Promise<void> {
        // Arrêter les mises à jour automatiques
        this.updateIntervals.forEach(interval => clearInterval(interval));

        // Nettoyer les données obsolètes
        const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 jours

        for (const [id, indicator] of this.indicators) {
            if (indicator.lastSeen < cutoffTime) {
                this.indicators.delete(id);
            }
        }

        for (const [id, report] of this.reports) {
            if (report.timestamp < cutoffTime && report.status === 'resolved') {
                this.reports.delete(id);
            }
        }
    }
}