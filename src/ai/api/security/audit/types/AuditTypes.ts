// src/ai/api/security/audit/types/AuditTypes.ts

import { SecurityContext } from '../../types/SecurityTypes';

export interface AuditRecord {
    id: string;
    timestamp: number;
    eventType: string;
    actor: {
        userId: string;
        roles: string[];
        ipAddress: string;
    };
    action: {
        type: string;
        target: string;
        details: Record<string, unknown>;
    };
    context: SecurityContext;
    metadata: {
        sequence: number;
        previousHash: string;
        hash: string;
        signature?: string;
    };
}

export interface AuditChain {
    records: AuditRecord[];
    lastHash: string;
    lastSequence: number;
}

export interface AuditQuery {
    startTime?: number;
    endTime?: number;
    eventTypes?: string[];
    actorIds?: string[];
    actionTypes?: string[];
    targets?: string[];
}

export interface AuditSummary {
    totalRecords: number;
    timeRange: {
        start: number;
        end: number;
    };
    eventTypeDistribution: Map<string, number>;
    actorDistribution: Map<string, number>;
    actionTypeDistribution: Map<string, number>;
    targetDistribution: Map<string, number>;
}

export interface AuditStatus {
    recordCount: number;
    lastSequence: number;
    lastUpdate: number;
}

export interface AuditExportOptions {
    query: AuditQuery;
    format: 'json' | 'csv';
}

export enum AuditEventType {
    AUTH_SUCCESS = 'AUTH_SUCCESS',
    AUTH_FAILURE = 'AUTH_FAILURE',
    LOGOUT = 'LOGOUT',
    DATA_ACCESS = 'DATA_ACCESS',
    DATA_MODIFICATION = 'DATA_MODIFICATION',
    ADMIN_ACTION = 'ADMIN_ACTION',
    SYSTEM_ERROR = 'SYSTEM_ERROR',
    SYSTEM_WARNING = 'SYSTEM_WARNING'
}

export interface SignatureVerificationResult {
    isValid: boolean;
    record: AuditRecord;
    error?: string;
}

export interface ChainVerificationResult {
    isValid: boolean;
    chainId: string;
    recordCount: number;
    invalidRecordIndices?: number[];
    error?: string;
}