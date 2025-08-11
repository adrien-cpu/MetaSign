import { RPMRetryPolicy } from './RPMRetryPolicy';
import { RPMError } from './types/RPMError';
import { RecoveryStep, RecoveryStrategy, RecoveryType } from './types/RecoveryTypes';

/**
 * @class RPMRecoverySystem
 * @brief Handles error recovery using a defined retry policy and recovery strategies.
 */
export class RPMRecoverySystem {
  private retryPolicy = new RPMRetryPolicy();

  /**
   * @brief Attempts to recover from a given error using a recovery strategy.
   * @param error The RPMError that needs recovery.
   * @throws RPMError if recovery fails after all attempts.
   */
  async recoverFromError(error: RPMError): Promise<void> {
    const recoveryStrategy = this.determineStrategy(error);

    try {
      await this.retryPolicy.retry(() => this.executeRecovery(recoveryStrategy));
    } catch (recoveryError) {
      throw new RPMError('Recovery failed', recoveryError);
    }
  }

  /**
   * @brief Determines the recovery strategy based on the error.
   * @param error The RPMError to analyze.
   * @return RecoveryStrategy The strategy to be used for recovery.
   */
  private determineStrategy(error: RPMError): RecoveryStrategy {
    return {
      type: this.getRecoveryType(error),
      steps: this.buildRecoverySteps(error),
      maxAttempts: this.calculateMaxAttempts(error),
      timeout: this.getTimeout(error)
    };
  }

  /**
   * @brief Executes the recovery steps defined in the strategy.
   * @param strategy The RecoveryStrategy containing steps to execute.
   */
  private async executeRecovery(strategy: RecoveryStrategy): Promise<void> {
    for (const step of strategy.steps) {
      await this.executeStep(step);
    }
  }

  /**
   * @brief Executes a single recovery step and validates its result.
   * @param step The RecoveryStep to execute.
   */
  private async executeStep(step: RecoveryStep): Promise<void> {
    await step.execute();
    await this.validateStepResult(step);
  }

  /**
   * @brief Determines the appropriate recovery type based on the error
   * @param error The error to analyze
   * @return The recovery type to use
   */
  private getRecoveryType(error: RPMError): RecoveryType {
    const errorType = error.getErrorType();

    switch (errorType) {
      case 'CONNECTION':
        return 'RESET_CONNECTION';
      case 'TIMEOUT':
        return 'RETRY_WITH_FALLBACK';
      case 'RESOURCE':
        return 'CLEAN_RESOURCES';
      default:
        return 'RETRY_SIMPLE';
    }
  }

  /**
   * @brief Builds the recovery steps based on the error and recovery type
   * @param error The error to recover from
   * @return Array of recovery steps
   */
  private buildRecoverySteps(error: RPMError): RecoveryStep[] {
    const recoveryType = this.getRecoveryType(error);
    const steps: RecoveryStep[] = [];

    // Add diagnostic step first
    steps.push({
      id: 'diagnostic',
      name: 'Diagnose Error',
      critical: true,
      execute: async () => {
        // Log diagnostic information
        console.log(`Diagnosing error: ${error.message}`);
      }
    });

    // Add specific steps based on recovery type
    switch (recoveryType) {
      case 'RESET_CONNECTION':
        steps.push({
          id: 'close_connection',
          name: 'Close Existing Connection',
          critical: true,
          execute: async () => {
            // Close connection implementation
            console.log('Closing connection...');
          }
        });
        steps.push({
          id: 'wait',
          name: 'Wait Before Reconnect',
          critical: false,
          execute: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        });
        steps.push({
          id: 'reconnect',
          name: 'Establish New Connection',
          critical: true,
          execute: async () => {
            // Reconnect implementation
            console.log('Establishing new connection...');
          }
        });
        break;

      case 'CLEAN_RESOURCES':
        steps.push({
          id: 'resource_cleanup',
          name: 'Clean Up Resources',
          critical: true,
          execute: async () => {
            // Resource cleanup implementation
            console.log('Cleaning up resources...');
          }
        });
        break;

      case 'RETRY_WITH_FALLBACK':
        steps.push({
          id: 'fallback',
          name: 'Switch to Fallback Mode',
          critical: true,
          execute: async () => {
            // Fallback implementation
            console.log('Switching to fallback mode...');
          }
        });
        break;

      default:
        steps.push({
          id: 'simple_retry',
          name: 'Simple Retry',
          critical: true,
          execute: async () => {
            // Simple retry implementation
            console.log('Preparing for simple retry...');
          }
        });
    }

    // Add verification step last
    steps.push({
      id: 'verify',
      name: 'Verify Recovery',
      critical: true,
      execute: async () => {
        // Verification implementation
        console.log('Verifying recovery...');
      }
    });

    return steps;
  }

  /**
   * @brief Calculates the maximum number of recovery attempts based on error severity
   * @param error The error to analyze
   * @return Maximum number of attempts
   */
  private calculateMaxAttempts(error: RPMError): number {
    const severity = error.getSeverity();

    // More severe errors get fewer attempts
    switch (severity) {
      case 5: // Critical
        return 1;
      case 4: // Severe
        return 2;
      case 3: // Moderate
        return 3;
      case 2: // Low
        return 4;
      case 1: // Info
        return 5;
      default:
        return 3;
    }
  }

  /**
   * @brief Determines appropriate timeout based on error type
   * @param error The error to analyze
   * @return Timeout in milliseconds
   */
  private getTimeout(error: RPMError): number {
    const errorType = error.getErrorType();

    switch (errorType) {
      case 'CONNECTION':
        return 10000; // 10s for connection issues
      case 'TIMEOUT':
        return 5000;  // 5s for timeout issues
      case 'RESOURCE':
        return 3000;  // 3s for resource issues
      default:
        return 5000;  // 5s default
    }
  }

  /**
   * @brief Validates the result of a recovery step
   * @param step The step to validate
   */
  private async validateStepResult(step: RecoveryStep): Promise<void> {
    // Mark step as successful by default
    step.successful = true;

    if (step.result === false) {
      step.successful = false;
    }

    // If critical step failed, throw error
    if (step.critical && !step.successful) {
      throw new RPMError(`Critical recovery step '${step.name}' failed`);
    }

    // Log result
    console.log(`Recovery step '${step.name}' ${step.successful ? 'succeeded' : 'failed'}`);
  }
}