//src/api/distributed/cognition/types/CognitionErrorTypes.ts
/**
 * CognitionErrorTypes.ts
 * 
 * Defines error type constants for the Cognition subsystem.
 */

export enum CognitionErrorTypes {
    // Task errors
    TASK_NOT_FOUND = 'COGNITION_ERROR_001: Task not found',
    INVALID_TASK = 'COGNITION_ERROR_002: Invalid task configuration',
    DISTRIBUTION_FAILED = 'COGNITION_ERROR_003: Task distribution failed',
    ANALYSIS_FAILED = 'COGNITION_ERROR_004: Task analysis failed',

    // Supervisor errors
    SUPERVISOR_NOT_FOUND = 'COGNITION_ERROR_101: Supervisor not found',
    INVALID_SUPERVISOR = 'COGNITION_ERROR_102: Invalid supervisor configuration',
    NO_AVAILABLE_SUPERVISORS = 'COGNITION_ERROR_103: No supervisors available',
    SUPERVISOR_OVERLOADED = 'COGNITION_ERROR_104: Supervisor has reached maximum concurrent tasks',

    // Resource errors
    INSUFFICIENT_RESOURCES = 'COGNITION_ERROR_201: Insufficient resources available',
    NODE_OVERLOADED = 'COGNITION_ERROR_202: Computation node overloaded',
    RESOURCE_ESTIMATION_FAILED = 'COGNITION_ERROR_203: Failed to estimate resource requirements',

    // Validation errors
    VALIDATION_FAILED = 'COGNITION_ERROR_301: Task validation failed',
    ETHICAL_VALIDATION_REQUIRED = 'COGNITION_ERROR_302: Ethical validation required but not provided',
    INVALID_DISTRIBUTION = 'COGNITION_ERROR_303: Invalid task distribution',

    // Communication errors
    COMMUNICATION_ERROR = 'COGNITION_ERROR_401: Communication with distributed nodes failed',
    TIMEOUT = 'COGNITION_ERROR_402: Operation timed out',
    NODE_UNREACHABLE = 'COGNITION_ERROR_403: Computation node unreachable',

    // General system errors
    INTERNAL_ERROR = 'COGNITION_ERROR_501: Internal system error',
    CONFIG_ERROR = 'COGNITION_ERROR_502: Configuration error',
    DEPENDENCY_ERROR = 'COGNITION_ERROR_503: Dependency resolution failed'
}