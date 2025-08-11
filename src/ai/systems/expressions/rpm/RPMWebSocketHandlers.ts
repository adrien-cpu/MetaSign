/**
 * @class RPMWebSocketHandlers
 * @brief Handles WebSocket messages for RPM avatars, including acknowledgment, error, and synchronization messages.
 */
export class RPMWebSocketHandlers {
  // Constante pour la latence maximale acceptable (50ms)
  private readonly MAX_ACCEPTABLE_LATENCY = 50;

  // Pour stocker les données d'état
  private currentMorphTargets: Record<string, number> = {};

  // Gestionnaires d'événements
  private eventHandlers: Map<string, ((data: Record<string, unknown>) => void)[]> = new Map();

  /**
   * @brief Initialise le gestionnaire de WebSocket
   * @param url URL du WebSocket à connecter
   */
  constructor(private url: string) {
    this.setupWebSocket();
  }

  /**
   * @brief Configure la connexion WebSocket
   */
  private setupWebSocket(): void {
    const ws = new WebSocket(this.url);

    ws.onmessage = this.handleMessage.bind(this);
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('connection-error', { error: 'Connection failed or interrupted' });
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.emit('connection-closed', { timestamp: Date.now() });
    };
    ws.onopen = () => {
      console.log('WebSocket connection established');
      this.emit('connection-open', { timestamp: Date.now() });
    };
  }

  /**
   * @brief Enregistre un gestionnaire d'événement
   * @param event Nom de l'événement
   * @param handler Fonction de gestion
   */
  public on(event: string, handler: (data: Record<string, unknown>) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  /**
   * @brief Déclenche un événement
   * @param event Nom de l'événement
   * @param data Données de l'événement
   */
  private emit(event: string, data: Record<string, unknown>): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  /**
   * @brief Handles incoming WebSocket messages and dispatches them based on type.
   * @param event The message event containing the data.
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data as string);

      switch (message.type) {
        case 'ack':
          this.handleAck(message);
          break;
        case 'error':
          this.handleWSError(message);
          break;
        case 'sync':
          this.handleSync(message);
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * @brief Handles acknowledgment messages from the WebSocket.
   * @param message The message containing sequence and timestamp.
   */
  private handleAck(message: { sequence?: number; timestamp?: number }): void {
    // Utilisation de message.sequence pour éviter l'erreur de variable non utilisée
    if (message.sequence !== undefined) {
      console.log(`Received acknowledgment for sequence ${message.sequence}`);
    }

    // Validation de la latence si un timestamp est fourni
    if (message.timestamp) {
      this.validateLatency(message.timestamp);
    }
  }

  /**
   * @brief Handles error messages from the WebSocket.
   * @param message The error message.
   */
  private handleWSError(message: { error?: string; code?: number }): void {
    const errorCode = message.code || 0;
    const errorMessage = message.error || 'Unknown error';

    console.error(`WebSocket error: [${errorCode}] ${errorMessage}`);
    this.emit('ws-error', {
      code: errorCode,
      message: errorMessage,
      timestamp: Date.now()
    });
  }

  /**
   * @brief Handles synchronization messages to update morph targets.
   * @param message The message containing morph targets and timestamp.
   */
  private handleSync(message: { morphTargets?: Record<string, number>; timestamp?: number }): void {
    // Utilisation de message.timestamp pour éviter l'erreur de variable non utilisée
    const receivedAt = message.timestamp ?
      new Date(message.timestamp).toISOString() :
      new Date().toISOString();

    console.log(`Received sync message at ${receivedAt}`);

    // Synchronisation de l'état si des morphTargets sont fournis
    if (message.morphTargets) {
      this.synchronizeState(message.morphTargets);
    }
  }

  /**
   * @brief Synchronizes the internal state with new morph targets.
   * @param morphTargets The new morph targets to apply.
   */
  private synchronizeState(morphTargets: Record<string, number>): void {
    // Mise à jour des cibles morph
    this.currentMorphTargets = { ...this.currentMorphTargets, ...morphTargets };

    // Notification du changement d'état
    this.emit('state-updated', {
      morphTargets: this.currentMorphTargets,
      timestamp: Date.now()
    });
  }

  /**
   * @brief Validates the latency of a message based on its timestamp.
   * @param timestamp The timestamp of the message.
   */
  private validateLatency(timestamp: number): void {
    const latency = Date.now() - timestamp;
    if (latency > this.MAX_ACCEPTABLE_LATENCY) {
      this.emit('latency-warning', {
        latency,
        threshold: this.MAX_ACCEPTABLE_LATENCY,
        timestamp: Date.now()
      });
    }
  }

  /**
   * @brief Gets the current morph targets.
   * @return The current morph targets.
   */
  public getMorphTargets(): Record<string, number> {
    return { ...this.currentMorphTargets };
  }
}