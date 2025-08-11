// src/ai/systems/expressions/rpm/RPMErrorHandling.ts
export class RPMError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RPMAPIError extends RPMError {
  constructor(message: string, cause?: unknown) {
    super(`API Error: ${message}`, cause);
  }
}

export class RPMMorphTargetError extends RPMError {
  constructor(message: string, cause?: unknown) {
    super(`Morph Target Error: ${message}`, cause);
  }
}