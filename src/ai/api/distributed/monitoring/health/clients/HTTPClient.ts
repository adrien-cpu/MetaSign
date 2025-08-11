// src/ai/api/distributed/monitoring/health/clients/HTTPClient.ts
import { Logger } from '@api/common/monitoring/LogService';
import { APIEndpoint, APIResponse, HTTPClient } from '../types/api-health.types';

/**
 * Default HTTP client implementation using fetch API
 */
export class FetchHTTPClient implements HTTPClient {
    private readonly logger: Logger;

    constructor() {
        this.logger = new Logger('FetchHTTPClient');
    }

    /**
     * Send an HTTP request
     * @param endpoint API endpoint configuration
     * @returns API response
     */
    public async request(endpoint: APIEndpoint): Promise<APIResponse> {
        try {
            this.logger.debug(`Sending ${endpoint.method} request to ${endpoint.url}`);

            const timeout = endpoint.timeout || 30000; // Default 30 second timeout

            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            // Prepare fetch options
            const options: RequestInit = {
                method: endpoint.method,
                headers: endpoint.headers as Record<string, string>,
                signal: controller.signal
            };

            // Add body for appropriate methods
            if (endpoint.method !== 'GET' && endpoint.method !== 'HEAD' && endpoint.body) {
                if (typeof endpoint.body === 'string') {
                    options.body = endpoint.body;
                } else {
                    options.body = JSON.stringify(endpoint.body);
                    // Set content-type if not specified
                    if (!options.headers || !options.headers['Content-Type']) {
                        options.headers = {
                            ...options.headers,
                            'Content-Type': 'application/json'
                        };
                    }
                }
            }

            // Perform the request
            const response = await fetch(endpoint.url, options);

            // Clear timeout
            clearTimeout(timeoutId);

            let body;
            try {
                // Try to parse as JSON first
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    body = await response.json();
                } else {
                    body = await response.text();
                }
            } catch (e) {
                this.logger.warn(`Failed to parse response body: ${e instanceof Error ? e.message : String(e)}`);
                body = null;
            }

            // Convert response headers to a plain object
            const headers: Record<string, string> = {};
            response.headers.forEach((value, key) => {
                headers[key] = value;
            });

            const apiResponse: APIResponse = {
                status: response.status,
                headers,
                body,
                success: response.ok
            };

            this.logger.debug(`Received response from ${endpoint.url}`, {
                status: apiResponse.status,
                success: apiResponse.success
            });

            return apiResponse;
        } catch (error) {
            // Handle fetch errors (network issues, timeouts, etc.)
            const isTimeout = error instanceof Error && error.name === 'AbortError';
            const errorMessage = isTimeout
                ? `Request timed out after ${endpoint.timeout || 30000}ms`
                : `Request failed: ${error instanceof Error ? error.message : String(error)}`;

            this.logger.error(`Error requesting ${endpoint.url}: ${errorMessage}`);

            return {
                status: 0,
                headers: {},
                body: null,
                success: false,
                error: errorMessage
            };
        }
    }
}