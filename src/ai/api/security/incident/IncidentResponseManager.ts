// src/api/security/incident/IncidentResponseManager.ts
import { AuditTrailManager } from '../audit/AuditTrailManager';
import { SecurityMetricsCollector } from '../metrics/SecurityMetricsCollector';
import { NotificationService } from '../notification/NotificationService';
import { SecurityEventSeverity } from '../types/SecurityTypes';

interface SecurityIncident {
    id: string;
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    description: string;
    detectedAt: Date;
    resolvedAt?: Date;
    affectedSystems: string[];
    actions: IncidentAction[];
}

interface IncidentAction {
    id: string;
    timestamp: Date;
    type: string;
    description: string;
    performer: string;
    result: string;
}

export class IncidentResponseManager {
    private auditManager: AuditTrailManager;
    private metricsCollector: SecurityMetricsCollector;
    private notificationService: NotificationService;
    private activeIncidents: Map<string, SecurityIncident>;

    constructor() {
        this.auditManager = new AuditTrailManager();
        this.metricsCollector = new SecurityMetricsCollector();
        this.notificationService = new NotificationService();
        this.activeIncidents = new Map();
    }

    public async reportIncident(incident: Omit<SecurityIncident, 'id' | 'detectedAt' | 'actions'>): Promise<string> {
        const newIncident: SecurityIncident = {
            id: this.generateIncidentId(),
            detectedAt: new Date(),
            actions: [],
            ...incident
        };

        this.activeIncidents.set(newIncident.id, newIncident);

        await this.auditManager.logSecurityEvent({
            type: 'INCIDENT_REPORTED',
            severity: this.mapToSecurityEventSeverity(incident.severity),
            details: newIncident,
            source: 'IncidentResponseManager'
        });

        await this.notifyIncident(newIncident);
        await this.initiateResponse(newIncident);

        return newIncident.id;
    }

    public async updateIncidentStatus(id: string, status: SecurityIncident['status'], action: Omit<IncidentAction, 'id' | 'timestamp'>): Promise<void> {
        const incident = this.activeIncidents.get(id);
        if (!incident) {
            throw new Error('Incident non trouvé');
        }

        const newAction: IncidentAction = {
            id: this.generateActionId(),
            timestamp: new Date(),
            ...action
        };

        incident.status = status;
        incident.actions.push(newAction);

        if (status === 'RESOLVED') {
            incident.resolvedAt = new Date();
        }

        await this.auditManager.logSecurityEvent({
            type: 'INCIDENT_UPDATED',
            severity: this.mapToSecurityEventSeverity(incident.severity),
            details: { incident, action: newAction },
            source: 'IncidentResponseManager'
        });

        await this.notifyIncidentUpdate(incident, newAction);
    }

    public async getIncidentTimeline(id: string): Promise<IncidentAction[]> {
        const incident = this.activeIncidents.get(id);
        if (!incident) {
            throw new Error('Incident non trouvé');
        }
        return [...incident.actions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    private async initiateResponse(incident: SecurityIncident): Promise<void> {
        // Initialiser les procédures de réponse selon le type et la sévérité
        const procedures = await this.getResponseProcedures();

        for (const procedure of procedures) {
            await this.executeProcedure(incident, procedure);
        }
    }

    // Modifié pour supprimer entièrement le paramètre non utilisé
    private async getResponseProcedures(): Promise<string[]> {
        // Récupérer les procédures standard
        // Dans une implémentation réelle, on pourrait passer l'incident en paramètre
        // et adapter les procédures en fonction du type et de la sévérité
        return [
            'ISOLATE_AFFECTED_SYSTEMS',
            'GATHER_FORENSICS',
            'NOTIFY_STAKEHOLDERS'
        ];
    }

    private async executeProcedure(incident: SecurityIncident, procedure: string): Promise<void> {
        // Exécuter une procédure spécifique
        const action: IncidentAction = {
            id: this.generateActionId(),
            timestamp: new Date(),
            type: 'PROCEDURE_EXECUTION',
            description: `Exécution de la procédure: ${procedure}`,
            performer: 'SYSTEM',
            result: 'COMPLETED'
        };

        incident.actions.push(action);
    }

    private async notifyIncident(incident: SecurityIncident): Promise<void> {
        await this.notificationService.sendNotification({
            type: 'SECURITY_INCIDENT',
            severity: incident.severity, // Utilisation directe car les types correspondent
            message: `Nouvel incident de sécurité détecté: ${incident.description}`,
            details: this.convertToRecord(incident)
        });
    }

    private async notifyIncidentUpdate(incident: SecurityIncident, action: IncidentAction): Promise<void> {
        await this.notificationService.sendNotification({
            type: 'INCIDENT_UPDATE',
            severity: incident.severity, // Utilisation directe car les types correspondent 
            message: `Mise à jour de l'incident #${incident.id}: ${action.description}`,
            details: this.convertToRecord({ incident, action })
        });
    }

    private generateIncidentId(): string {
        return `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateActionId(): string {
        return `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Convertit un objet en Record<string, unknown>
     */
    private convertToRecord<T>(obj: T): Record<string, unknown> {
        return { ...obj as object } as Record<string, unknown>;
    }

    /**
     * Mappez les valeurs de sévérité de l'incident vers les valeurs SecurityEventSeverity
     */
    private mapToSecurityEventSeverity(severity: SecurityIncident['severity']): SecurityEventSeverity {
        switch (severity) {
            case 'LOW':
                return SecurityEventSeverity.INFO;
            case 'MEDIUM':
                return SecurityEventSeverity.WARNING;
            case 'HIGH':
                return SecurityEventSeverity.ERROR;
            case 'CRITICAL':
                return SecurityEventSeverity.CRITICAL;
            default:
                // Si jamais on reçoit une valeur inattendue
                return SecurityEventSeverity.INFO;
        }
    }
}