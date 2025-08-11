import axios, { AxiosError } from 'axios';
import dotenv from 'dotenv';
import http from 'http';

dotenv.config();

// Types
interface CreateUserResponse {
  data: {
    id: string;
  };
}

interface RPMError {
  code: string;
  message: string;
}

interface RPMConfig {
  apiKey: string;
  appId: string;
  subdomain: string;
}

// Fonction utilitaire de logging
const log = {
  error: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${message}`, data);
    }
  },
  info: (message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`);
    }
  },
};

const API_KEY = process.env.NEXT_PUBLIC_RPM_API_KEY || '';
const SUBDOMAIN = process.env.RPM_SUBDOMAIN || '';

export class ReadyPlayerMeService {
  private readonly baseUrl = 'https://models.readyplayer.me/v1';
  private readonly apiUrl = 'https://api.readyplayer.me/v1';
  private readonly config: RPMConfig = {
    apiKey: API_KEY,
    appId: process.env.RPM_APP_ID || '',
    subdomain: SUBDOMAIN,
  };

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.config.apiKey}`,
      'X-APP-ID': this.config.appId,
      'Content-Type': 'application/json',
    };
  }

  async createUser(): Promise<CreateUserResponse> {
    try {
      const response = await axios.post<CreateUserResponse>(
        `${this.baseUrl}/users`,
        { subdomain: this.config.subdomain },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        log.error('Erreur RPM:', error.response?.data);
        throw new Error(`Erreur API RPM: ${error.response?.status}`);
      }
      throw error;
    }
  }

  async createAvatar(): Promise<unknown> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/avatars`,
        {
          subdomain: this.config.subdomain,
          application: this.config.appId,
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const rpmError = error.response?.data as RPMError;
        throw new Error(`RPM API Error: ${rpmError?.message || error.message}`);
      }
      throw error;
    }
  }

  // Méthode utilisant apiUrl
  async getAvatarMetadata(avatarId: string): Promise<unknown> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/avatars/${avatarId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        log.error('Erreur RPM:', error.response?.data);
        throw new Error(`Erreur API RPM: ${error.response?.status}`);
      }
      throw error;
    }
  }
}

// Fonction utilitaire pour démarrer un serveur HTTP sur un port disponible
export const findAvailablePort = async (startPort: number): Promise<number> => {
  return new Promise((resolve, reject) => {
    const server = http.createServer();

    server.listen(startPort, () => {
      server.close(() => {
        resolve(startPort);
      });
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
  });
};

export class RPMService {
  async createUser(): Promise<string> {
    const service = new ReadyPlayerMeService();
    const userResponse = await service.createUser();
    return userResponse.data.id;
  }
}
