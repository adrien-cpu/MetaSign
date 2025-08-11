export interface IA {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'TRAINING' | 'PAUSED' | 'ERROR';
  type: 'MASTER' | 'APPRENTICE' | 'DISTILLED';
}

export interface Metric {
  id: string;
  name: string;
  value: number;
}

export interface Alert {
  id: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  timestamp: number;
}