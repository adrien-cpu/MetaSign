// src/ai/ethics/compliance/AuditTracker.ts

import {
    EthicsAudit,
    EthicsContext,
    EthicsDecision,
    EthicsResult,
    AuditTrailEntry // Ajoutez ce type s'il n'existe pas déjà dans les imports
} from '../types';

export class AuditTracker {
    private audits: Map<string, EthicsAudit>;
    private readonly retentionPeriod: number;

    constructor(retentionPeriodDays: number = 365) {
        this.audits = new Map();
        this.retentionPeriod = retentionPeriodDays * 24 * 60 * 60 * 1000;
    }

    async trackAudit(context: EthicsContext, result: EthicsResult): Promise<string> {
        const auditId = this.generateAuditId();
        const audit: EthicsAudit = {
            id: auditId,
            timestamp: Date.now(),
            decision: result.decision,
            context: { ...context },
            validators: result.metadata.validatedBy,
            evidence: [{
                type: 'validation_result',
                data: result,
                timestamp: Date.now()
            }],
            trail: [{
                stage: 'initial_validation',
                timestamp: Date.now(),
                decision: result.decision,
                validator: result.metadata.validatedBy[0],
                notes: this.generateAuditNotes(result)
            }]
        };

        this.audits.set(auditId, audit);
        await this.persistAudit(audit);
        return auditId;
    }

    async updateAuditTrail(
        auditId: string,
        stage: string,
        decision: EthicsDecision,
        validator: string,
        notes?: string
    ): Promise<void> {
        const audit = this.audits.get(auditId);
        if (!audit) {
            throw new Error(`Audit ${auditId} not found`);
        }

        // Construction de l'entrée de trail avec un type approprié
        const trailEntry: AuditTrailEntry = {
            stage,
            timestamp: Date.now(),
            decision,
            validator
        };

        // Ajout conditionnel de notes uniquement si définie
        if (notes !== undefined) {
            trailEntry.notes = notes;
        }

        audit.trail.push(trailEntry);
        audit.decision = decision;
        await this.persistAudit(audit);
    }

    async addEvidence(
        auditId: string,
        evidenceType: string,
        data: unknown
    ): Promise<void> {
        const audit = this.audits.get(auditId);
        if (!audit) {
            throw new Error(`Audit ${auditId} not found`);
        }

        audit.evidence.push({
            type: evidenceType,
            data,
            timestamp: Date.now()
        });

        await this.persistAudit(audit);
    }

    async getAudit(auditId: string): Promise<EthicsAudit | undefined> {
        return this.audits.get(auditId);
    }

    async getAuditsByContext(context: Partial<EthicsContext>): Promise<EthicsAudit[]> {
        return Array.from(this.audits.values()).filter(audit =>
            this.matchContext(audit.context, context)
        );
    }

    async getAuditsByDateRange(startDate: number, endDate: number): Promise<EthicsAudit[]> {
        return Array.from(this.audits.values()).filter(audit =>
            audit.timestamp >= startDate && audit.timestamp <= endDate
        );
    }

    async cleanup(): Promise<number> {
        const now = Date.now();
        const expiredCount = Array.from(this.audits.entries())
            .filter(([, audit]) => now - audit.timestamp > this.retentionPeriod)
            .length;

        this.audits = new Map(
            Array.from(this.audits.entries())
                .filter(([, audit]) => now - audit.timestamp <= this.retentionPeriod)
        );

        return expiredCount;
    }

    private generateAuditId(): string {
        return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateAuditNotes(result: EthicsResult): string {
        const notes = [];
        if (result.violations.length > 0) {
            notes.push(`Violations found: ${result.violations.length}`);
            notes.push(...result.violations.map(v => v.message));
        }
        if (result.recommendations && result.recommendations.length > 0) {
            notes.push('Recommendations:');
            notes.push(...result.recommendations);
        }
        return notes.join('\n');
    }

    private matchContext(auditContext: EthicsContext, searchContext: Partial<EthicsContext>): boolean {
        return Object.entries(searchContext).every(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                // Cast explicite pour satisfaire le compilateur TypeScript
                const contextValue = auditContext[key as keyof EthicsContext];
                // Vérifiez si la valeur est un objet avant d'appeler matchContext récursivement
                if (typeof contextValue === 'object' && contextValue !== null) {
                    return this.matchContext(
                        contextValue as unknown as EthicsContext,
                        value as Partial<EthicsContext>
                    );
                }
                return false;
            }
            return auditContext[key as keyof EthicsContext] === value;
        });
    }

    private async persistAudit(audit: EthicsAudit): Promise<void> {
        // Dans une implémentation réelle, on persisterait dans une base de données
        // Pour l'instant, on garde en mémoire
        this.audits.set(audit.id, { ...audit });
    }

    getAuditCount(): number {
        return this.audits.size;
    }

    getRetentionPeriod(): number {
        return this.retentionPeriod;
    }
}