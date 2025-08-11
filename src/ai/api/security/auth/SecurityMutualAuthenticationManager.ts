// src/ai/api/security/auth/SecurityMutualAuthenticationManager.ts

import { EncryptionManager } from '../core/EncryptionManager';
import { SecurityContext } from '../types/SecurityTypes';

interface AuthenticationRequest {
    clientId: string;
    clientCert: string;
    timestamp: number;
    nonce: string;
    signature: string;
}

interface AuthenticationResponse {
    serverCert: string;
    sessionId: string;
    timestamp: number;
    nonce: string;
    signature: string;
    expiration: number;
}

interface Certificate {
    subject: string;
    issuer: string;
    validFrom: number;
    validTo: number;
    publicKey: string;
    extensions: Record<string, unknown>;
    serialNumber: string;
    signature: string;
}

interface CertificateVerificationResult {
    isValid: boolean;
    subject: string;
    issuer: string;
    validTo: number;
    error?: string;
}

interface AuthenticationResult {
    success: boolean;
    sessionId?: string;
    context?: SecurityContext;
    expiration?: number;
    error?: string;
}

/**
 * Gestionnaire d'authentification mutuelle basé sur les certificats
 * Permet l'authentification bidirectionnelle entre le client et le serveur
 */
export class SecurityMutualAuthenticationManager {
    private readonly trustedIssuers: Set<string> = new Set();
    private readonly revokedCerts: Set<string> = new Set();
    private readonly activeSessions: Map<string, {
        clientId: string;
        context: SecurityContext;
        expiration: number;
    }> = new Map();

    constructor(
        private readonly encryptionManager: EncryptionManager,
        private readonly serverCertificate: Certificate,
        private readonly serverPrivateKey: string,
        trustedIssuers: string[] = []
    ) {
        // Initialiser les émetteurs de confiance
        trustedIssuers.forEach(issuer => this.trustedIssuers.add(issuer));

        // Planifier le nettoyage des sessions
        this.scheduleSessionCleanup();
    }

    /**
     * Ajoute un émetteur de certificat à la liste de confiance
     */
    public addTrustedIssuer(issuer: string): void {
        this.trustedIssuers.add(issuer);
    }

    /**
     * Supprime un émetteur de certificat de la liste de confiance
     */
    public removeTrustedIssuer(issuer: string): void {
        this.trustedIssuers.delete(issuer);
    }

    /**
     * Révoque un certificat
     */
    public revokeCertificate(serialNumber: string): void {
        this.revokedCerts.add(serialNumber);

        // Révoquer également toutes les sessions associées à ce certificat
        for (const [sessionId, session] of this.activeSessions.entries()) {
            // Note: implémentation simplifiée, une implémentation réelle
            // nécessiterait de conserver la relation entre certificat et session
            if (session.clientId.includes(serialNumber)) {
                this.activeSessions.delete(sessionId);
            }
        }
    }

    /**
     * Authentifie un client à partir d'une demande d'authentification
     */
    public async authenticateClient(request: AuthenticationRequest): Promise<AuthenticationResponse | null> {
        try {
            // Vérifier la validité de la demande
            if (!this.isValidRequest(request)) {
                console.error('Invalid authentication request');
                return null;
            }

            // Parser et vérifier le certificat client
            const clientCert = this.parseCertificate(request.clientCert);
            if (!clientCert) {
                console.error('Failed to parse client certificate');
                return null;
            }

            // Vérifier la validité du certificat
            const certVerification = this.verifyCertificate(clientCert);
            if (!certVerification.isValid) {
                console.error(`Certificate validation failed: ${certVerification.error}`);
                return null;
            }

            // Vérifier la signature de la demande
            const isSignatureValid = await this.verifyRequestSignature(request, clientCert.publicKey);
            if (!isSignatureValid) {
                console.error('Request signature validation failed');
                return null;
            }

            // Générer une réponse
            const response = await this.generateAuthResponse();

            // Créer et stocker une session
            this.createSession(response.sessionId, clientCert.subject, response.expiration);

            return response;
        } catch (error) {
            console.error('Authentication error:', error);
            return null;
        }
    }

    /**
     * Valide une session existante
     */
    public validateSession(sessionId: string): AuthenticationResult {
        const session = this.activeSessions.get(sessionId);

        if (!session) {
            return {
                success: false,
                error: 'Session not found'
            };
        }

        const now = Date.now();
        if (session.expiration < now) {
            // Session expirée
            this.activeSessions.delete(sessionId);
            return {
                success: false,
                error: 'Session expired'
            };
        }

        return {
            success: true,
            sessionId,
            context: session.context,
            expiration: session.expiration
        };
    }

    /**
     * Termine une session
     */
    public endSession(sessionId: string): boolean {
        return this.activeSessions.delete(sessionId);
    }

    /**
     * Vérifie qu'une demande d'authentification est valide
     */
    private isValidRequest(request: AuthenticationRequest): boolean {
        // Vérifier que tous les champs requis sont présents
        if (!request.clientId || !request.clientCert || !request.timestamp ||
            !request.nonce || !request.signature) {
            return false;
        }

        // Vérifier la fraîcheur de la demande (éviter replay attacks)
        const now = Date.now();
        const requestAge = now - request.timestamp;
        const maxRequestAge = 5 * 60 * 1000; // 5 minutes

        if (requestAge > maxRequestAge || requestAge < 0) {
            console.warn(`Request timestamp out of acceptable range: ${requestAge}ms`);
            return false;
        }

        return true;
    }

    /**
     * Parse un certificat à partir de sa représentation en chaîne
     */
    private parseCertificate(certStr: string): Certificate | null {
        try {
            // Implémentation simplifiée, dans un cas réel nous ferions
            // du parsing ASN.1/X.509 proprement dit
            const cert = JSON.parse(certStr) as Certificate;

            // Vérifier la présence des champs obligatoires
            if (!cert.subject || !cert.issuer || !cert.validFrom ||
                !cert.validTo || !cert.publicKey || !cert.signature) {
                return null;
            }

            return cert;
        } catch (error) {
            console.error('Certificate parsing error:', error);
            return null;
        }
    }

    /**
     * Vérifie un certificat
     */
    private verifyCertificate(cert: Certificate): CertificateVerificationResult {
        // Vérifier si le certificat est révoqué
        if (this.revokedCerts.has(cert.serialNumber)) {
            return {
                isValid: false,
                subject: cert.subject,
                issuer: cert.issuer,
                validTo: cert.validTo,
                error: 'Certificate has been revoked'
            };
        }

        // Vérifier la validité temporelle
        const now = Date.now();
        if (cert.validFrom > now || cert.validTo < now) {
            return {
                isValid: false,
                subject: cert.subject,
                issuer: cert.issuer,
                validTo: cert.validTo,
                error: 'Certificate is not valid at current time'
            };
        }

        // Vérifier l'émetteur
        if (!this.trustedIssuers.has(cert.issuer)) {
            return {
                isValid: false,
                subject: cert.subject,
                issuer: cert.issuer,
                validTo: cert.validTo,
                error: 'Certificate issuer is not trusted'
            };
        }

        // Vérifier la signature du certificat
        // Note: simplifié pour l'exemple, une implémentation réelle vérifierait
        // cryptographiquement la signature avec la clé publique de l'émetteur

        return {
            isValid: true,
            subject: cert.subject,
            issuer: cert.issuer,
            validTo: cert.validTo
        };
    }

    /**
     * Vérifie la signature d'une requête
     */
    private async verifyRequestSignature(request: AuthenticationRequest, publicKey: string): Promise<boolean> {
        try {
            // Créer la chaîne à vérifier
            const signatureData = `${request.clientId}:${request.nonce}:${request.timestamp}`;

            // Vérifier la signature
            return await this.encryptionManager.verify(signatureData, request.signature, publicKey);
        } catch (error) {
            console.error('Signature verification error:', error);
            return false;
        }
    }

    /**
     * Génère une réponse d'authentification
     */
    private async generateAuthResponse(): Promise<AuthenticationResponse> {
        const sessionId = this.generateSessionId();
        const timestamp = Date.now();
        const nonce = this.generateNonce();
        const expiration = timestamp + 24 * 60 * 60 * 1000; // 24 heures

        // Créer la chaîne à signer
        const signatureData = `${sessionId}:${nonce}:${timestamp}:${expiration}`;

        // Signer la réponse
        const signature = await this.encryptionManager.sign(signatureData, this.serverPrivateKey);

        return {
            serverCert: JSON.stringify(this.serverCertificate),
            sessionId,
            timestamp,
            nonce,
            signature,
            expiration
        };
    }

    /**
     * Crée une session pour un client authentifié
     * @param sessionId Identifiant de la session
     * @param subjectId Identifiant du sujet (valeur du champ 'subject' du certificat)
     * @param expiration Date d'expiration de la session
     */
    private createSession(sessionId: string, subjectId: string, expiration: number): void {
        // Dans une implémentation réelle, on dériverait le contexte de sécurité
        // à partir des informations du certificat client
        const context: SecurityContext = {
            userId: subjectId,
            roles: ['user'],
            permissions: ['READ']
        };

        this.activeSessions.set(sessionId, {
            clientId: subjectId,
            context,
            expiration
        });
    }

    /**
     * Génère un identifiant de session
     */
    private generateSessionId(): string {
        // Implémentation simplifiée, une implémentation réelle utiliserait
        // une méthode cryptographiquement sûre
        return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Génère un nonce
     */
    private generateNonce(): string {
        // Implémentation simplifiée, une implémentation réelle utiliserait
        // une méthode cryptographiquement sûre
        return Math.random().toString(36).substring(2, 15);
    }

    /**
     * Planifie le nettoyage périodique des sessions expirées
     */
    private scheduleSessionCleanup(): void {
        const CLEANUP_INTERVAL = 15 * 60 * 1000; // 15 minutes

        setInterval(() => {
            this.cleanupExpiredSessions();
        }, CLEANUP_INTERVAL);
    }

    /**
     * Nettoie les sessions expirées
     */
    private cleanupExpiredSessions(): void {
        const now = Date.now();
        let expiredCount = 0;

        for (const [sessionId, session] of this.activeSessions.entries()) {
            if (session.expiration < now) {
                this.activeSessions.delete(sessionId);
                expiredCount++;
            }
        }

        if (expiredCount > 0) {
            console.log(`Cleaned up ${expiredCount} expired sessions`);
        }
    }

    /**
     * Récupère des informations de diagnostic sur l'état actuel
     */
    public getDiagnosticInfo(): {
        activeSessions: number;
        trustedIssuers: number;
        revokedCertificates: number;
    } {
        return {
            activeSessions: this.activeSessions.size,
            trustedIssuers: this.trustedIssuers.size,
            revokedCertificates: this.revokedCerts.size
        };
    }
}