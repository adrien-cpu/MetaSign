import {
    DetectionResult,
    GestureFrame,
    OriginConfidence,
    OriginSignal
} from '../types';

/**
 * Interface pour la détection d'origine dialectale
 * Responsable de l'identification de l'origine régionale d'un signant
 */
export interface IOriginDetector {
    /**
     * Détecte l'origine régionale probable d'une séquence de gestes LSF
     * @param gestureFrames Séquence de gestes à analyser
     * @returns Code régional détecté
     */
    detectOrigin(gestureFrames: GestureFrame[]): Promise<string>;

    /**
     * Détecte l'origine à partir du contexte utilisateur
     * @param userContext Contexte de l'utilisateur
     * @returns Code régional détecté
     */
    detectOrigin(userContext: Record<string, unknown>): Promise<string>;

    /**
     * Obtient le résultat détaillé de la détection
     * @param gestureFrames Séquence de gestes à analyser
     * @returns Détails sur l'origine avec niveau de confiance
     */
    detectOriginWithDetails(gestureFrames: GestureFrame[]): Promise<DetectionResult>;

    /**
     * Calcule la confiance de la détection d'origine
     * @param gestureFrames Séquence de gestes
     * @param region Région supposée
     * @returns Score de confiance entre 0 et 1
     */
    calculateConfidence(gestureFrames: GestureFrame[], region: string): Promise<number>;

    /**
     * Identifie les signes caractéristiques d'une région
     * @param gestureFrames Séquence de gestes
     * @returns Carte des signes caractéristiques par région avec score de confiance
     */
    identifyRegionalMarkers(gestureFrames: GestureFrame[]): Promise<Map<string, Map<string, number>>>;

    /**
     * Détecte les régions possibles avec leur probabilité
     * @param gestureFrames Séquence de gestes
     * @param threshold Seuil minimal de confiance (0 à 1)
     * @returns Carte des régions avec leur probabilité
     */
    detectPossibleOrigins(gestureFrames: GestureFrame[], threshold?: number): Promise<Map<string, number>>;

    /**
     * Renvoie des informations détaillées sur l'origine détectée
     * @param gestureFrames Séquence de gestes à analyser
     * @returns Détails sur l'origine avec niveau de confiance et signaux
     */
    getDetailedOrigin(gestureFrames: GestureFrame[]): Promise<OriginConfidence>;

    /**
     * Ajoute un signal d'origine supplémentaire pour améliorer la détection
     * @param signal Signal d'origine à prendre en compte
     */
    addOriginSignal(signal: OriginSignal): void;

    /**
     * Entraîne le détecteur avec de nouvelles données annotées
     * @param samples Exemples d'entraînement
     * @param options Options d'entraînement
     * @returns Score d'amélioration après entraînement
     */
    train(samples: Array<{ frames: GestureFrame[], region: string }>, options?: Record<string, unknown>): Promise<number>;
}