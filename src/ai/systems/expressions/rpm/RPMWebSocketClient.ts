/**
 * @class RPMWebSocketClient
 * @brief Manages WebSocket connections for RPM avatars, including sending live updates and handling events.
 */

// Interface pour les données de message WebSocket
interface RPMWebSocketMessage {
  type: string;
  data?: Record<string, unknown>;
  error?: string;
  timestamp?: number;
  [key: string]: unknown;
}

// Type pour les gestionnaires d'événements
type MessageHandler = (data: RPMWebSocketMessage) => void;
type ErrorHandler = (error: Error) => void;
type CloseHandler = (code: number, reason: string) => void;
type OpenHandler = () => void;

// Type union pour tous les gestionnaires
type EventHandler = MessageHandler | ErrorHandler | CloseHandler | OpenHandler;

export class RPMWebSocketClient {
  /**
   * @brief The WebSocket instance for communication.
   */
  private ws: WebSocket | null = null;

  /**
   * @brief The retry policy for handling connection attempts.
   */
  private retryPolicy = new RPMRetryPolicy();

  /**
   * @brief Event handlers for different WebSocket events
   */
  private eventHandlers: {
    message: MessageHandler[];
    error: ErrorHandler[];
    close: CloseHandler[];
    open: OpenHandler[];
  } = {
      message: [],
      error: [],
      close: [],
      open: []
    };

  /**
   * @brief Connects to the WebSocket server for a specific avatar.
   * @param avatarId The ID of the avatar to connect to.
   * @return A promise that resolves when the connection is established.
   * @throws RPMError if the connection fails after all retry attempts.
   */
  async connect(avatarId: string): Promise<void> {
    const wsUrl = `wss://api.readyplayer.me/v1/avatars/${avatarId}/live`;

    await this.retryPolicy.retry(async () => {
      this.ws = new WebSocket(wsUrl);
      this.setupEventHandlers();
      await this.waitForConnection();
    });
  }

  /**
   * @brief Sends a live update with morph targets to the server.
   * @param morphTargets The morph targets to send in the update.
   * @throws RPMError if the WebSocket is not connected.
   */
  async sendLiveUpdate(morphTargets: Record<string, number>): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new RPMError('WebSocket not connected');
    }

    const message = {
      type: 'morph_update',
      data: morphTargets,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify(message));
  }

  /**
   * @brief Register an event handler
   * @param event The event type ('message', 'error', 'close', 'open')
   * @param handler The handler function
   */
  on(event: 'message', handler: MessageHandler): void;
  on(event: 'error', handler: ErrorHandler): void;
  on(event: 'close', handler: CloseHandler): void;
  on(event: 'open', handler: OpenHandler): void;
  on(event: string, handler: EventHandler): void {
    if (event in this.eventHandlers) {
      // @ts-expect-error - we know the event is valid
      this.eventHandlers[event].push(handler);
    }
  }

  /**
   * @brief Sets up event handlers for the WebSocket connection.
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onerror = this.handleError.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onopen = this.handleOpen.bind(this);
  }

  /**
   * @brief Waits for the WebSocket connection to be open.
   * @return A promise that resolves when the connection is open.
   * @throws RPMError if the WebSocket is not initialized.
   */
  private async waitForConnection(): Promise<void> {
    if (!this.ws) throw new RPMError('WebSocket not initialized');

    if (this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      // Capture the WebSocket instance to use in the handlers
      // This avoids the 'this.ws might be null' error
      const socket = this.ws;

      if (!socket) {
        reject(new RPMError('WebSocket not initialized'));
        return;
      }

      const openHandler = () => {
        socket.removeEventListener('open', openHandler);
        socket.removeEventListener('error', errorHandler);
        resolve();
      };

      const errorHandler = (error: Event) => {
        socket.removeEventListener('open', openHandler);
        socket.removeEventListener('error', errorHandler);
        reject(new RPMError(`WebSocket connection failed: ${error.type}`));
      };

      // Use the captured socket instance
      socket.addEventListener('open', openHandler);
      socket.addEventListener('error', errorHandler);
    });
  }

  /**
   * @brief Handles incoming messages from the WebSocket.
   * @param event The message event containing the data.
   */
  private handleMessage(messageEvent: MessageEvent): void {
    try {
      const data = JSON.parse(messageEvent.data) as RPMWebSocketMessage;
      this.eventHandlers.message.forEach(handler => handler(data));
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * @brief Handles errors that occur on the WebSocket.
   * @param event The error event.
   */
  private handleError(errorEvent: Event): void {
    const error = new RPMError(`WebSocket error: ${errorEvent.type}`);
    this.eventHandlers.error.forEach(handler => handler(error));
  }

  /**
   * @brief Handles the closure of the WebSocket connection.
   * @param event The close event.
   */
  private handleClose(closeEvent: CloseEvent): void {
    this.eventHandlers.close.forEach(handler =>
      handler(closeEvent.code, closeEvent.reason)
    );
  }

  /**
   * @brief Handles the opening of the WebSocket connection.
   */
  private handleOpen(): void {
    this.eventHandlers.open.forEach(handler => handler());
  }

  /**
   * @brief Closes the WebSocket connection.
   */
  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

/**
 * @class RPMRetryPolicy
 * @brief Implements a retry policy for operations that might fail.
 */
class RPMRetryPolicy {
  private maxRetries = 3;
  private baseDelay = 1000; // ms

  /**
   * @brief Retries an operation according to the policy.
   * @param operation The async operation to retry.
   * @return A promise that resolves with the operation result.
   * @throws RPMError if all retries fail.
   */
  async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Calculate delay with exponential backoff
        const delay = this.baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);

        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new RPMError(`Operation failed after ${this.maxRetries} retries: ${lastError?.message}`);
  }
}

/**
 * @class RPMError
 * @brief Custom error class for RPM-related errors.
 */
class RPMError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RPMError';
  }
}