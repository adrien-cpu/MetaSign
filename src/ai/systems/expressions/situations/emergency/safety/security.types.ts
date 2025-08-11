// src/ai/systems/expressions/situations/emergency/safety/security.types.ts

export interface PreventionFuites {
    analyseComportement: () => Promise<void>;
    detectionAnomalies: () => Promise<void>;
    protectionAcces: () => Promise<void>;
}

export interface VerrouillageEthique {
    valeursFondamentales: string[];
    verifieValeurs: () => Promise<boolean>;
    verifieRegles: () => Promise<boolean>;
}

export interface AuditContinu {
    logsInalterables: () => Promise<void>;
    rapportsAudit: () => Promise<string>;
}

export interface SystemeSecuriteRenforcee {
    preventionFuites: PreventionFuites;
    verrouillageEthique: VerrouillageEthique;
    auditContinu: AuditContinu;
    getSecurityStatus: () => Promise<SecurityStatus>;
}

export interface SecurityStatus {
    level: number;
    issues: string[];
    recommendations: string[];
}

export interface SecurityContext {
    threatLevel: number;
    securityMeasures: string[];
    accessControls: string[];
}