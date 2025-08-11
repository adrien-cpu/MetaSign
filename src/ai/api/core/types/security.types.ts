// src/ai/api/core/types/security.types.ts
/**
 * Types de sécurité pour le contexte API
 */
import { TokenValidationResult, RequestAnalysisResult, BehaviorAnalysisResult, ComplianceValidationResult } from '@security/types/SecurityTypes';

/**
 * Interface pour les informations de sécurité stockées dans le contexte API
 */
export interface SecurityContext {
    /**
     * Informations sur le token JWT validé
     */
    tokenInfo?: TokenValidationResult;
    /**
     * Résultat de l'analyse de détection d'intrusion
     */
    intrusionDetection?: RequestAnalysisResult;
    /**
     * Résultat de l'analyse comportementale
     */
    behaviorAnalysis?: BehaviorAnalysisResult;
    /**
     * Résultat de la validation de conformité
     */
    compliance?: ComplianceValidationResult;
    /**
     * Indique si les données manipulées requièrent un chiffrement
     */
    requireEncryption?: boolean;

    /**
     * Identifiant unique de la requête
     */
    requestId?: string;
}

// Exporter d'autres types nécessaires
export type { TokenValidationResult };

// Ne pas utiliser de déclaration de module qui crée un conflit
// avec la déclaration existante dans APIContext.ts