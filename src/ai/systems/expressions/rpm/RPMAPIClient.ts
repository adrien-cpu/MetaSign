// src/ai/systems/expressions/rpm/RPMAPIClient.ts
import { RPMAPIError } from './RPMErrorHandling';

export interface RPMAvatarStatus {
  id: string;
  status: string;
  lastUpdated: string;
  [key: string]: unknown;
}

export class RPMClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_RPM_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_RPM_API_URL || '';
  }

  async sendMorphTargets(avatarId: string, morphTargets: Record<string, number>): Promise<void> {
    const endpoint = `${this.baseUrl}/avatars/${avatarId}/morphs`;

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ morphTargets })
      });
    } catch (error) {
      throw new RPMAPIError('Failed to send morph targets', error);
    }
  }

  async getAvatarStatus(avatarId: string): Promise<RPMAvatarStatus> {
    const endpoint = `${this.baseUrl}/avatars/${avatarId}`;
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${this.apiKey}` }
    });

    if (!response.ok) {
      throw new RPMAPIError('Failed to get avatar status');
    }

    return await response.json();
  }
}