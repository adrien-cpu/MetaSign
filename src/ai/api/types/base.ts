// Types de base pour l'API

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata: APIMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean | null>;
}

export interface APIMetadata {
  timestamp: number;
  version: string;
  processingTime: number;
}

export interface APIContext {
  session: SessionContext;
  request: RequestContext;
  validation: ValidationContext;
}

export interface SessionContext {
  id: string;
  user: string;
  permissions: string[];
  startTime: number;
}

export interface RequestContext {
  id: string;
  type: string;
  priority: number;
  source: string;
}

export interface ValidationContext {
  rules: ValidationRule[];
  thresholds: Record<string, number>;
  strictMode: boolean;
}

export interface ValidationRule {
  id: string;
  type: string;
  priority: number;
  parameters: ValidationRuleParameters;
}

// Type sécurisé pour les paramètres de règle de validation
export interface ValidationRuleParameters {
  [key: string]: string | number | boolean | null | undefined;
}