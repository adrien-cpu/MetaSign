// src/ai/systems/expressions/rpm/RPMRetryPolicy.ts
import { RPMError } from './types/RPMError';

/**
 * @interface RetryOptions
 * @brief Options for configuring retry behavior
 */
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

/**
 * @class RPMRetryPolicy
 * @brief Implements configurable retry policies with exponential backoff and jitter
 */
export class RPMRetryPolicy {
  private defaultOptions: RetryOptions = {
    maxAttempts: 3,
    baseDelay: 300,
    maxDelay: 3000,
    backoffFactor: 2,
    jitter: true
  };

  /**
   * @brief Creates a new retry policy with optional custom settings
   * @param options Custom retry options (optional)
   */
  constructor(private options: RetryOptions = {} as RetryOptions) {
    // Merge provided options with defaults
    this.options = {
      ...this.defaultOptions,
      ...options
    };
  }

  /**
   * @brief Executes a function with retry logic
   * @param fn Function to execute with retry
   * @param customOptions Custom options for this specific retry (optional)
   * @return Promise resolving to the function's result
   * @throws Last error encountered after all retry attempts fail
   */
  async retry<T>(
    fn: () => Promise<T>,
    customOptions?: Partial<RetryOptions>
  ): Promise<T> {
    // Merge options for this specific retry
    const options = {
      ...this.options,
      ...customOptions
    };

    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < options.maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error
          ? error
          : new Error(String(error));

        attempt++;

        // If we've exhausted all attempts, throw the last error
        if (attempt >= options.maxAttempts) {
          break;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, options);

        // Wait before the next attempt
        await this.wait(delay);
      }
    }

    throw new RPMError(
      `Operation failed after ${options.maxAttempts} attempts`,
      lastError
    );
  }

  /**
   * @brief Calculate delay using exponential backoff with optional jitter
   * @param attempt Current attempt number (0-based)
   * @param options Retry options
   * @return Delay in milliseconds
   */
  private calculateDelay(attempt: number, options: RetryOptions): number {
    // Calculate exponential backoff
    const exponentialDelay = options.baseDelay * Math.pow(options.backoffFactor, attempt);

    // Apply maximum delay constraint
    let delay = Math.min(exponentialDelay, options.maxDelay);

    // Apply jitter to prevent thundering herd
    if (options.jitter) {
      // Add random jitter between 0-25% of the delay
      delay = delay * (0.75 + Math.random() * 0.25);
    }

    return delay;
  }

  /**
   * @brief Wait for the specified delay
   * @param delay Time to wait in milliseconds
   * @return Promise that resolves after the delay
   */
  private wait(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}