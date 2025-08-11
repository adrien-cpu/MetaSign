import { Logger } from '@/ai/utils/Logger';

/**
 * Types possibles de méthodes HTTP
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Types d'authentifications supportés
 */
export type AuthType = 'bearer' | 'apiKey' | 'basic' | 'none';

/**
 * Structure pour les options d'un appel API
 */
export interface APIRequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  timeout?: number;
}

/**
 * Configuration pour une API externe
 */
export interface APIConfig {
  /** URL de base de l'API */
  endpoint: string;
  /** Informations d'authentification */
  auth: {
    /** Type d'authentification */
    type: AuthType;
    /** Token d'authentification (si applicable) */
    token?: string;
    /** Nom du header pour l'API key (si type=apiKey) */
    keyName?: string;
    /** Identifiants pour auth basic (si type=basic) */
    credentials?: {
      username: string;
      password: string;
    };
  };
  /** Headers par défaut pour toutes les requêtes à cette API */
  defaultHeaders?: Record<string, string>;
  /** Timeout par défaut en ms */
  defaultTimeout?: number | undefined;
}

/**
 * Erreur spécifique aux appels API
 */
export class APIError extends Error {
  public statusCode: number | undefined;
  public endpoint: string;
  public method: HttpMethod;

  constructor(message: string, endpoint: string, method: HttpMethod, statusCode?: number) {
    super(message);
    this.name = 'APIError';
    this.endpoint = endpoint;
    this.method = method;
    this.statusCode = statusCode;
  }
}

/**
 * Gestionnaire des appels aux APIs externes
 */
export class ExternalAPIManager {
  /** Map des configurations d'APIs */
  private apis: Map<string, APIConfig> = new Map();
  private logger: Logger;

  /**
   * Constructeur
   */
  constructor() {
    this.logger = new Logger('ExternalAPIManager');
    this.initializeAPIs();
  }

  /**
   * Initialise les configurations des APIs
   * @private
   */
  private initializeAPIs(): void {
    // Exemples de configuration d'APIs
    this.registerAPI('mistral', {
      endpoint: process.env.MISTRAL_API_ENDPOINT || 'https://api.mistral.ai/v1',
      auth: {
        type: 'bearer',
        token: process.env.MISTRAL_API_KEY || '',
      },
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      defaultTimeout: 30000, // 30 secondes
    });

    // Autres APIs...
  }

  /**
   * Enregistre une nouvelle API
   * @param apiName Nom unique de l'API
   * @param config Configuration de l'API
   */
  public registerAPI(apiName: string, config: APIConfig): void {
    if (this.apis.has(apiName)) {
      this.logger.warn(`API ${apiName} already registered, overwriting previous configuration`);
    }
    this.apis.set(apiName, config);
  }

  /**
   * Récupère la configuration d'une API
   * @param apiName Nom de l'API
   * @returns Configuration de l'API
   * @throws Error si l'API n'est pas trouvée
   * @private
   */
  private getAPIConfig(apiName: string): APIConfig {
    const config = this.apis.get(apiName);
    if (!config) {
      throw new Error(`API ${apiName} not found. Register it first using registerAPI method.`);
    }
    return config;
  }

  /**
   * Construit les headers d'authentification selon le type d'auth
   * @param config Configuration de l'API
   * @returns Headers d'authentification
   * @private
   */
  private buildAuthHeaders(config: APIConfig): Record<string, string> {
    const headers: Record<string, string> = {};
    const { auth } = config;

    switch (auth.type) {
      case 'bearer':
        if (!auth.token) {
          throw new Error('Bearer token is required but not provided');
        }
        headers['Authorization'] = `Bearer ${auth.token}`;
        break;
      case 'apiKey':
        if (!auth.token || !auth.keyName) {
          throw new Error('API key and key name are required but not provided');
        }
        headers[auth.keyName] = auth.token;
        break;
      case 'basic':
        if (!auth.credentials) {
          throw new Error('Credentials are required for basic authentication');
        }
        const credentials = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'none':
        // Pas d'authentification
        break;
    }

    return headers;
  }

  /**
   * Prépare les options pour un appel fetch
   * @param config Configuration de l'API
   * @param method Méthode HTTP
   * @param data Données à envoyer (pour POST, PUT, PATCH)
   * @param options Options supplémentaires
   * @returns Options pour fetch
   * @private
   */
  private prepareFetchOptions(
    config: APIConfig,
    method: HttpMethod,
    data?: unknown,
    options?: APIRequestOptions
  ): RequestInit {
    // Headers par défaut de l'API
    const headers: Record<string, string> = {
      ...(config.defaultHeaders || {})
    };

    // Ajout des headers d'authentification
    const authHeaders = this.buildAuthHeaders(config);
    Object.assign(headers, authHeaders);

    // Ajout des headers spécifiques à la requête
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }

    // Options de base
    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    // Ajout du body pour les méthodes qui le supportent
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }

    // Ajout du timeout - Correction pour exactOptionalPropertyTypes
    const timeoutValue: number | undefined = options?.timeout !== undefined
      ? options.timeout
      : config.defaultTimeout;

    if (timeoutValue !== undefined) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), timeoutValue);
      fetchOptions.signal = controller.signal;
    }

    return fetchOptions;
  }

  /**
   * Construction de l'URL avec les paramètres de requête
   * @param baseUrl URL de base
   * @param path Chemin relatif
   * @param params Paramètres à ajouter à l'URL
   * @returns URL complète
   * @private
   */
  private buildUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
    // Concaténation de l'URL de base et du chemin
    let url = `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    // Ajout des paramètres de requête
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value);
      }
      url += `?${searchParams.toString()}`;
    }

    return url;
  }

  /**
   * Appelle une API externe
   * @param apiName Nom de l'API à appeler
   * @param path Chemin relatif à l'endpoint de base
   * @param method Méthode HTTP à utiliser
   * @param data Données à envoyer (pour POST, PUT, PATCH)
   * @param options Options supplémentaires
   * @returns Promise avec le résultat typé
   * @template TResponse Type de retour attendu
   */
  public async call<TResponse, TData = unknown>(
    apiName: string,
    path: string,
    method: HttpMethod = 'GET',
    data?: TData,
    options?: APIRequestOptions
  ): Promise<TResponse> {
    try {
      const config = this.getAPIConfig(apiName);
      const url = this.buildUrl(config.endpoint, path, options?.params);
      const fetchOptions = this.prepareFetchOptions(config, method, data, options);

      this.logger.debug(`Calling ${method} ${url}`);

      // Exécution de l'appel
      const response = await fetch(url, fetchOptions);

      // Vérification du statut de la réponse
      if (!response.ok) {
        const errorText = await response.text();
        throw new APIError(
          `API call failed: ${errorText}`,
          url,
          method,
          response.status
        );
      }

      // Parsing du résultat
      const result = await response.json() as TResponse;
      return result;
    } catch (error) {
      // Propagation des erreurs APIError
      if (error instanceof APIError) {
        throw error;
      }

      // Conversion des autres erreurs
      const apiPath = path || '/';
      if (error instanceof Error) {
        throw new APIError(
          `API call to ${apiName} failed: ${error.message}`,
          apiPath,
          method
        );
      } else {
        throw new APIError(
          `Unknown error during API call to ${apiName}`,
          apiPath,
          method
        );
      }
    }
  }
}