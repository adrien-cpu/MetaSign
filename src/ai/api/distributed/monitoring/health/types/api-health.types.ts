// src/ai/api/distributed/monitoring/health/types/api-health.types.ts

/**
 * Represents an API endpoint to monitor
 */
export interface APIEndpoint {
    /** Endpoint URL */
    url: string;

    /** HTTP method (GET, POST, etc.) */
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

    /** Request headers */
    headers?: Record<string, string>;

    /** Request body (for POST, PUT, etc.) */
    body?: string | Record<string, unknown>;

    /** Timeout in milliseconds */
    timeout?: number;

    /** Name/ID of the endpoint (for reporting) */
    name?: string;

    /** Expected response status codes that indicate health */
    expectedStatus?: number[];

    /** Maximum acceptable latency in milliseconds */
    maxLatency?: number;
}

/**
 * API response structure
 */
export interface APIResponse {
    /** HTTP status code */
    status: number;

    /** Response headers */
    headers: Record<string, string>;

    /** Response body */
    body: unknown;

    /** Whether the request was successful */
    success: boolean;

    /** Error message if request failed */
    error?: string;
}

/**
 * Health status of a specific endpoint
 */
export interface EndpointHealth {
    /** Endpoint URL */
    endpoint: string;

    /** Endpoint name/ID if available */
    name?: string;

    /** HTTP status code */
    status: number;

    /** Response time in milliseconds */
    latency: number;

    /** Whether the endpoint is considered healthy */
    healthy: boolean;

    /** Error message if not healthy */
    error?: string;

    /** Additional metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Options for API health check
 */
export interface APIHealthCheckOptions {
    /** Timeout for individual endpoint checks in milliseconds */
    endpointTimeout?: number;

    /** Default maximum latency in milliseconds */
    defaultMaxLatency?: number;

    /** Default expected status codes */
    defaultExpectedStatus?: number[];

    /** Whether to continue checking other endpoints if one fails */
    continueOnFailure?: boolean;

    /** Whether to retry failed requests */
    retryFailedRequests?: boolean;

    /** Maximum number of retry attempts */
    maxRetryAttempts?: number;

    /** Whether this health check is enabled by default */
    enabled?: boolean;

    /** Tags for categorizing this health check */
    tags?: string[];
}

/**
 * Interface for HTTP client
 */
export interface HTTPClient {
    /**
     * Send an HTTP request
     * @param endpoint API endpoint configuration
     * @returns API response
     */
    request(endpoint: APIEndpoint): Promise<APIResponse>;
}