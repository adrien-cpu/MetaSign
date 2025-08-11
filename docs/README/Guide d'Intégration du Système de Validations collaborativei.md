# Guide d'Intégration du Système de Validation Collaborative

Ce guide vous aidera à intégrer le Système de Validation Collaborative dans vos applications existantes.Il couvre l'installation, la configuration, et plusieurs scénarios d'intégration courants.

## Table des matières

1.[Prérequis](#prérequis)
2.[Installation](#installation)
3.[Configuration de base](#configuration - de - base)
4.[Scénarios d'intégration](#scénarios-dintégration)
    - [Intégration backend](#intégration - backend)
    - [Intégration frontend](#intégration - frontend)
    - [Intégration avec une base de données](#intégration - avec - une - base - de - données)
5.[Migration depuis des systèmes existants](#migration - depuis - des - systèmes - existants)
6.[Exemples d'intégration](#exemples-dintégration)
7.[Dépannage](#dépannage)
8.[Bonnes pratiques](#bonnes - pratiques)

## Prérequis

    - Node.js >= 16.x
        - TypeScript >= 4.5
        - npm ou yarn

## Installation

### Via npm

    ```bash
npm install validation-collaborative-system
```

### Via yarn

    ```bash
yarn add validation-collaborative-system
```

### À partir des sources

    ```bash
git clone https://github.com/votre-organisation/validation-collaborative-system.git
cd validation-collaborative-system
npm install
npm run build
```

## Configuration de base

### Configuration minimale

    ```typescript
import { getValidationSystem } from 'validation-collaborative-system';

async function initSystem() {
  const system = await getValidationSystem({
    enableLogging: true
  });
  
  return system;
}
```

### Configuration complète

    ```typescript
import { getValidationSystem } from 'validation-collaborative-system';

async function initSystem() {
  const system = await getValidationSystem({
    enableLogging: true,
    logLevel: 'info',
    enableRestApi: true,
    restApiPort: 3000,
    collaborationManagerConfig: {
      defaultMinFeedbackRequired: 3,
      enableAutoConsensusCalculation: true,
      defaultConsensusOptions: {
        algorithm: 'weighted',
        approvalThreshold: 0.7
      }
    },
    autoSavePath: './data/backup.json',
    autoSaveInterval: 3600000 // 1 heure
  });
  
  return system;
}
```

## Scénarios d'intégration

### Intégration backend

#### Express.js

    ```typescript
import express from 'express';
import { getValidationSystem } from 'validation-collaborative-system';
import { CollaborativeValidationRequest } from 'validation-collaborative-system/types';

const app = express();
app.use(express.json());

let validationSystem: any;

// Initialiser le système au démarrage
(async () => {
  validationSystem = await getValidationSystem({
    enableLogging: true
  });
  
  console.log('Validation system initialized');
})();

// Route pour soumettre une validation
app.post('/api/validations', async (req, res) => {
  try {
    const manager = validationSystem.getCollaborationManager();
    const request: CollaborativeValidationRequest = req.body;
    
    const result = await manager.submitProposal(request);
    
    if (result.success) {
      res.status(201).json({ id: result.data });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route pour récupérer les validations
app.get('/api/validations', async (req, res) => {
  try {
    const manager = validationSystem.getCollaborationManager();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await manager.searchValidations(
      {}, // Pas de critères = tous les résultats
      { page, limit }
    );
    
    if (result.success) {
      res.status(200).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Arrêt propre
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  
  if (validationSystem) {
    await validationSystem.shutdown();
  }
  
  process.exit(0);
});
```

#### NestJS

    ```typescript
// validation.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { getValidationSystem, ValidationSystemFacade } from 'validation-collaborative-system';
import { 
  CollaborativeValidationRequest, 
  ValidationFeedback 
} from 'validation-collaborative-system/types';

@Injectable()
export class ValidationService implements OnModuleInit, OnModuleDestroy {
  private validationSystem: ValidationSystemFacade;
  
  async onModuleInit() {
    this.validationSystem = await getValidationSystem({
      enableLogging: true
    });
  }
  
  async onModuleDestroy() {
    if (this.validationSystem) {
      await this.validationSystem.shutdown();
    }
  }
  
  async submitValidation(request: CollaborativeValidationRequest) {
    const manager = this.validationSystem.getCollaborationManager();
    return manager.submitProposal(request);
  }
  
  async addFeedback(validationId: string, feedback: ValidationFeedback) {
    const manager = this.validationSystem.getCollaborationManager();
    return manager.addFeedback(validationId, feedback);
  }
  
  async searchValidations(criteria: any, pagination: any) {
    const manager = this.validationSystem.getCollaborationManager();
    return manager.searchValidations(criteria, pagination);
  }
  
  // Autres méthodes selon vos besoins...
}

// validation.controller.ts
import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ValidationService } from './validation.service';

@Controller('validations')
export class ValidationController {
  constructor(private validationService: ValidationService) {}
  
  @Post()
  async createValidation(@Body() request: any) {
    const result = await this.validationService.submitValidation(request);
    
    if (result.success) {
      return { id: result.data };
    } else {
      // Gérer l'erreur selon vos conventions NestJS
    }
  }
  
  @Get()
  async listValidations(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const result = await this.validationService.searchValidations(
      {}, 
      { page, limit }
    );
    
    if (result.success) {
      return result.data;
    } else {
      // Gérer l'erreur selon vos conventions NestJS
    }
  }
  
  // Autres endpoints...
}
```

### Intégration frontend

#### React

    ```typescript
// ValidationContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Définir l'interface pour le contexte
interface ValidationContextType {
  submitValidation: (data: any) => Promise<any>;
  addFeedback: (validationId: string, feedback: any) => Promise<any>;
  searchValidations: (criteria: any, pagination: any) => Promise<any>;
  // Autres méthodes...
}

// Créer le contexte
const ValidationContext = createContext<ValidationContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const useValidation = () => {
  const context = useContext(ValidationContext);
  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }
  return context;
};

// Provider pour le contexte
export const ValidationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api] = useState(() => {
    const instance = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return instance;
  });
  
  // Fonctions d'API
  const submitValidation = async (data: any) => {
    try {
      const response = await api.post('/validations', data);
      return response.data;
    } catch (error) {
      console.error('Error submitting validation:', error);
      throw error;
    }
  };
  
  const addFeedback = async (validationId: string, feedback: any) => {
    try {
      const response = await api.post(`/ validations / ${ validationId }/feedback`, feedback);
return response.data;
    } catch (error) {
    console.error('Error adding feedback:', error);
    throw error;
}
  };

const searchValidations = async (criteria: any, pagination: any) => {
    try {
        const response = await api.post('/validations/search', {
            criteria,
            pagination
        });
        return response.data;
    } catch (error) {
        console.error('Error searching validations:', error);
        throw error;
    }
};

// Valeur du contexte
const value = {
    submitValidation,
    addFeedback,
    searchValidations
    // Autres méthodes...
};

return (
    <ValidationContext.Provider value= { value } >
    { children }
    </ValidationContext.Provider>
  );
};

// Exemple d'utilisation dans un composant
// ValidationForm.tsx
import React, { useState } from 'react';
import { useValidation } from './ValidationContext';

export const ValidationForm: React.FC = () => {
    const { submitValidation } = useValidation();
    const [formData, setFormData] = useState({
        type: 'sign',
        content: {
            type: 'sign',
            signId: '',
            parameters: {
                handshape: '',
                location: '',
                movement: '',
                orientation: ''
            }
        },
        requester: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await submitValidation(formData);
            console.log('Validation submitted:', result);
            // Réinitialiser le formulaire ou rediriger...
        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    // Rendu du formulaire...
};
```

#### Vue.js

```typescript
// validation-service.ts
import axios from 'axios';

export class ValidationService {
    private api;

    constructor(baseURL = 'http://localhost:3000/api') {
        this.api = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    async submitValidation(data) {
        try {
            const response = await this.api.post('/validations', data);
            return response.data;
        } catch (error) {
            console.error('Error submitting validation:', error);
            throw error;
        }
    }

    async addFeedback(validationId, feedback) {
        try {
            const response = await this.api.post(`/validations/${validationId}/feedback`, feedback);
            return response.data;
        } catch (error) {
            console.error('Error adding feedback:', error);
            throw error;
        }
    }

    async searchValidations(criteria, pagination) {
        try {
            const response = await this.api.post('/validations/search', {
                criteria,
                pagination
            });
            return response.data;
        } catch (error) {
            console.error('Error searching validations:', error);
            throw error;
        }
    }

    // Autres méthodes...
}

// main.js
import { createApp } from 'vue';
import App from './App.vue';
import { ValidationService } from './validation-service';

const app = createApp(App);

// Injecter le service
app.provide('validationService', new ValidationService());

app.mount('#app');

// ValidationForm.vue
<template>
    <form @submit.prevent="handleSubmit" >
        <!--Champs du formulaire... -->
            <button type="submit" > Soumettre </button>
                </form>
                </template>

                <script>
import { inject, reactive } from 'vue';

export default {
    name: 'ValidationForm',
    setup() {
        const validationService = inject('validationService');

        const formData = reactive({
            type: 'sign',
            content: {
                type: 'sign',
                signId: '',
                parameters: {
                    handshape: '',
                    location: '',
                    movement: '',
                    orientation: ''
                }
            },
            requester: ''
        });

        const handleSubmit = async () => {
            try {
                const result = await validationService.submitValidation(formData);
                console.log('Validation submitted:', result);
                // Réinitialiser le formulaire ou rediriger...
            } catch (error) {
                console.error('Submission failed:', error);
            }
        };

        return {
            formData,
            handleSubmit
        };
    }
};
</script>
    ```

### Intégration avec une base de données

Notre système utilise par défaut une implémentation en mémoire, mais vous pouvez facilement l'adapter pour utiliser une base de données.

#### MongoDB

```typescript
import { EnhancedCollaborationManager } from 'validation-collaborative-system';
import {
    ValidationState,
    ValidationStateChange,
    CollaborativeValidationRequest,
    ValidationFeedback
} from 'validation-collaborative-system/types';
import { MongoClient, Db, Collection } from 'mongodb';

/**
 * Implémentation du gestionnaire de collaboration avec MongoDB
 */
export class MongoCollaborationManager extends EnhancedCollaborationManager {
    private client: MongoClient;
    private db: Db;
    private validationsCollection: Collection<CollaborativeValidationRequest>;
    private feedbackCollection: Collection<ValidationFeedback>;
    private stateCollection: Collection<{ validationId: string; state: ValidationState }>;
    private historyCollection: Collection<ValidationStateChange>;

    constructor(connectionString: string, dbName: string) {
        super();

        this.client = new MongoClient(connectionString);
    }

    async initialize() {
        try {
            // Connexion à MongoDB
            await this.client.connect();
            this.db = this.client.db(this.dbName);

            // Initialisation des collections
            this.validationsCollection = this.db.collection('validations');
            this.feedbackCollection = this.db.collection('feedback');
            this.stateCollection = this.db.collection('states');
            this.historyCollection = this.db.collection('stateHistory');

            // Créer des index
            await this.validationsCollection.createIndex({ type: 1 });
            await this.validationsCollection.createIndex({ submissionDate: 1 });
            await this.feedbackCollection.createIndex({ validationId: 1 });
            await this.stateCollection.createIndex({ validationId: 1 }, { unique: true });
            await this.historyCollection.createIndex({ validationId: 1 });

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'INITIALIZATION_FAILED',
                    message: 'Failed to initialize MongoDB connection',
                    details: { error: String(error) }
                }
            };
        }
    }

    async submitProposal(request) {
        try {
            // Générer un ID unique
            if (!request.id) {
                request.id = new ObjectId().toString();
            }

            // Ajouter la date de soumission
            if (!request.submissionDate) {
                request.submissionDate = new Date();
            }

            // Insérer la validation
            await this.validationsCollection.insertOne(request);

            // Initialiser l'état
            await this.stateCollection.insertOne({
                validationId: request.id,
                state: ValidationState.SUBMITTED
            });

            // Enregistrer l'état initial dans l'historique
            const stateChange = {
                validationId: request.id,
                previousState: ValidationState.UNKNOWN,
                newState: ValidationState.SUBMITTED,
                changedBy: 'system',
                changedAt: new Date(),
                reason: 'Initial submission'
            };

            await this.historyCollection.insertOne(stateChange);

            return { success: true, data: request.id };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'OPERATION_FAILED',
                    message: 'Failed to submit proposal',
                    details: { error: String(error) }
                }
            };
        }
    }

    // Autres méthodes surchargées...

    async shutdown() {
        try {
            await this.client.close();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'OPERATION_FAILED',
                    message: 'Failed to shutdown MongoDB connection',
                    details: { error: String(error) }
                }
            };
        }
    }
}
```

#### PostgreSQL

```typescript
import { EnhancedCollaborationManager } from 'validation-collaborative-system';
import {
    ValidationState,
    ValidationStateChange,
    CollaborativeValidationRequest,
    ValidationFeedback
} from 'validation-collaborative-system/types';
import { Pool } from 'pg';

/**
 * Implémentation du gestionnaire de collaboration avec PostgreSQL
 */
export class PostgresCollaborationManager extends EnhancedCollaborationManager {
    private pool: Pool;

    constructor(connectionConfig) {
        super();

        this.pool = new Pool(connectionConfig);
    }

    async initialize() {
        try {
            // Vérifier la connexion
            const client = await this.pool.connect();
            client.release();

            // Créer les tables si nécessaire
            await this.pool.query(`
        CREATE TABLE IF NOT EXISTS validations (
          id VARCHAR(50) PRIMARY KEY,
          data JSONB NOT NULL,
          type VARCHAR(50) NOT NULL,
          requester VARCHAR(50) NOT NULL,
          submission_date TIMESTAMP NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS feedback (
          id VARCHAR(50) PRIMARY KEY,
          validation_id VARCHAR(50) REFERENCES validations(id),
          data JSONB NOT NULL,
          expert_id VARCHAR(50) NOT NULL,
          approved BOOLEAN NOT NULL,
          created_at TIMESTAMP NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS validation_states (
          validation_id VARCHAR(50) PRIMARY KEY REFERENCES validations(id),
          state VARCHAR(50) NOT NULL,
          updated_at TIMESTAMP NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS state_history (
          id SERIAL PRIMARY KEY,
          validation_id VARCHAR(50) REFERENCES validations(id),
          previous_state VARCHAR(50) NOT NULL,
          new_state VARCHAR(50) NOT NULL,
          changed_by VARCHAR(50) NOT NULL,
          changed_at TIMESTAMP NOT NULL,
          reason TEXT
        );
      `);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'INITIALIZATION_FAILED',
                    message: 'Failed to initialize PostgreSQL connection',
                    details: { error: String(error) }
                }
            };
        }
    }

    // Implémenter les méthodes surchargées...

    async shutdown() {
        try {
            await this.pool.end();
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'OPERATION_FAILED',
                    message: 'Failed to shutdown PostgreSQL connection',
                    details: { error: String(error) }
                }
            };
        }
    }
}

// Utilisation avec getValidationSystem
import { getValidationSystem } from 'validation-collaborative-system';

async function createSystemWithPostgres() {
    const pgManager = new PostgresCollaborationManager({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'password',
        database: 'validation_system'
    });

    // Initialisation manuelle du gestionnaire
    await pgManager.initialize();

    // Création du système avec notre implémentation personnalisée
    const system = await getValidationSystem({
        collaborationManagerConfig: pgManager
    });

    return system;
}
```

## Migration depuis des systèmes existants

### Import de données existantes

```typescript
import { getValidationSystem } from 'validation-collaborative-system';
import { ImportOptions } from 'validation-collaborative-system/types';
import fs from 'fs/promises';

async function importExistingData(filePath: string) {
    try {
        // Initialiser le système
        const system = await getValidationSystem();

        // Lire le fichier JSON
        const data = await fs.readFile(filePath, 'utf8');

        // Options d'import
        const options: ImportOptions = {
            conflictStrategy: 'skip', // ou 'replace' ou 'merge'
            transformIds: true,       // générer de nouveaux IDs
            idPrefix: 'imported_'    // préfixe pour les nouveaux IDs
        };

        // Importer les données
        const success = await system.importSystem(data, options);

        if (success) {
            console.log('Data imported successfully');
        } else {
            console.error('Failed to import data');
        }

        return success;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}
```

### Adapter des formats de données existants

```typescript
import { CollaborativeValidationRequest, ValidationFeedback } from 'validation-collaborative-system/types';

/**
 * Convertit des données d'un ancien système au format du nouveau système
 */
function convertLegacyData(legacyData) {
    // Convertir les validations
    const validations: CollaborativeValidationRequest[] = legacyData.items.map(item => ({
        type: mapLegacyType(item.itemType),
        content: convertContent(item),
        requester: item.createdBy,
        submissionDate: new Date(item.createdAt),
        context: {
            domain: item.category,
            purpose: item.purpose,
            formality: mapLegacyFormality(item.formalityLevel)
        },
        metadata: {
            legacyId: item.id,
            priority: mapLegacyPriority(item.priority),
            tags: item.tags || []
        }
    }));

    // Convertir les feedbacks
    const feedbacks: ValidationFeedback[] = legacyData.reviews.map(review => ({
        expertId: review.reviewerId,
        validationId: review.itemId,
        isNativeValidator: review.isNative || false,
        approved: review.score >= 6,
        score: review.score,
        comments: review.comments,
        timestamp: new Date(review.reviewDate)
    }));

    return { validations, feedbacks };
}

/**
 * Fonctions auxiliaires pour la conversion
 */
function mapLegacyType(legacyType) {
    switch (legacyType) {
        case 'SIGN':
            return 'sign';
        case 'TRANSLATION':
            return 'translation';
        case 'EXPR':
            return 'expression';
        default:
            return 'document';
    }
}

function mapLegacyFormality(legacyFormality) {
    switch (legacyFormality) {
        case 'HIGH':
            return 'formal';
        case 'LOW':
            return 'informal';
        default:
            return 'neutral';
    }
}

function mapLegacyPriority(legacyPriority) {
    switch (legacyPriority) {
        case 'HIGH':
            return 'high';
        case 'LOW':
            return 'low';
        default:
            return 'medium';
    }
}

function convertContent(legacyItem) {
    switch (legacyItem.itemType) {
        case 'SIGN':
            return {
                type: 'sign',
                signId: legacyItem.signId || `legacy_${legacyItem.id}`,
                parameters: {
                    handshape: legacyItem.handshape || 'unknown',
                    location: legacyItem.location || 'unknown',
                    movement: legacyItem.movement || 'unknown',
                    orientation: legacyItem.orientation || 'unknown'
                }
            };
        case 'TRANSLATION':
            return {
                type: 'translation',
                sourceText: legacyItem.source || '',
                targetSign: legacyItem.target || '',
                context: legacyItem.context || ''
            };
        // Autres types...
        default:
            return {
                type: 'document',
                title: legacyItem.title || 'Unknown',
                content: legacyItem.content || '',
                language: legacyItem.language || 'fr',
                format: 'text'
            };
    }
}
```

## Exemples d'intégration

### Application web complète (Next.js)

```typescript
// services/validation-service.ts
import { getValidationSystem, ValidationSystemFacade } from 'validation-collaborative-system';

let validationSystem: ValidationSystemFacade | null = null;

export async function initValidationSystem() {
    if (!validationSystem) {
        validationSystem = await getValidationSystem({
            enableLogging: true,
            collaborationManagerConfig: {
                defaultMinFeedbackRequired: 3
            }
        });
    }

    return validationSystem;
}

export async function shutdownValidationSystem() {
    if (validationSystem) {
        await validationSystem.shutdown();
        validationSystem = null;
    }
}

export function getValidationManager() {
    if (!validationSystem) {
        throw new Error('Validation system not initialized');
    }

    return validationSystem.getCollaborationManager();
}

// pages/api/validations/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { initValidationSystem, getValidationManager } from '../../../services/validation-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await initValidationSystem();

    if (req.method === 'POST') {
        try {
            const manager = getValidationManager();
            const result = await manager.submitProposal(req.body);

            if (result.success) {
                res.status(201).json({ id: result.data });
            } else {
                res.status(400).json({ error: result.error });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        try {
            const manager = getValidationManager();
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await manager.searchValidations(
                {},
                { page, limit }
            );

            if (result.success) {
                res.status(200).json(result.data);
            } else {
                res.status(400).json({ error: result.error });
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

// pages/api/validations/[id]/index.ts, etc.
// ...
```

### Worker pour le traitement en arrière-plan

```typescript
import { getValidationSystem } from 'validation-collaborative-system';
import { ValidationEventType } from 'validation-collaborative-system/types';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
    // Code du thread principal
    const worker = new Worker(__filename, {
        workerData: {
            // Configuration...
        }
    });

    worker.on('message', (message) => {
        console.log('Message from worker:', message);
    });

    worker.on('error', (error) => {
        console.error('Worker error:', error);
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
} else {
    // Code du worker
    (async () => {
        try {
            // Initialiser le système
            const system = await getValidationSystem({
                enableLogging: true,
                // Autres options...
            });

            const manager = system.getCollaborationManager();

            // S'abonner aux événements
            manager.subscribeToEvents(ValidationEventType.CONSENSUS_REACHED, async (validationId, eventType, data) => {
                try {
                    // Traiter le consensus atteint
                    console.log(`Processing consensus for validation ${validationId}`);

                    // Effectuer des opérations en arrière-plan
                    // ...

                    // Envoyer un message au thread principal
                    if (parentPort) {
                        parentPort.postMessage({
                            type: 'consensus_processed',
                            validationId,
                            result: 'success'
                        });
                    }
                } catch (error) {
                    console.error('Error processing consensus:', error);

                    if (parentPort) {
                        parentPort.postMessage({
                            type: 'error',
                            validationId,
                            error: String(error)
                        });
                    }
                }
            });

            // Signaler que le worker est prêt
            if (parentPort) {
                parentPort.postMessage({ type: 'ready' });
            }
        } catch (error) {
            console.error('Worker initialization error:', error);

            if (parentPort) {
                parentPort.postMessage({
                    type: 'initialization_error',
                    error: String(error)
                });
            }

            process.exit(1);
        }
    })();
}
```

## Dépannage

### Problèmes courants et solutions

#### Le système ne s'initialise pas

**Problème :** L'appel à `getValidationSystem()` échoue ou ne se termine pas.

**Solutions :**
1. Vérifiez les erreurs dans la console
2. Assurez-vous que toutes les dépendances sont installées
3. Vérifiez la connexion à la base de données si vous utilisez une implémentation personnalisée
4. Utilisez un timeout pour éviter les blocages

```typescript
// Avec timeout
const initWithTimeout = async (timeoutMs = 5000) => {
    return Promise.race([
        getValidationSystem(),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Initialization timeout')), timeoutMs)
        )
    ]);
};
```

#### Les événements ne sont pas déclenchés

**Problème :** Les callbacks d'événements ne sont pas appelés.

**Solutions :**
1. Vérifiez que vous vous êtes abonné au bon type d'événement
2. Assurez-vous que l'événement est bien déclenché (par exemple, vérifiez l'état de la validation)
3. Vérifiez que le callback ne génère pas d'erreur

```typescript
// Abonnement avec gestion d'erreur
const subscriptionId = manager.subscribeToEvents(
    ValidationEventType.STATE_CHANGED,
    (validationId, eventType, data) => {
        try {
            console.log(`Event: ${eventType} for validation ${validationId}`);
            // Traitement...
        } catch (error) {
            console.error('Error in event handler:', error);
        }
    }
);
```

#### Problèmes de performance

**Problème :** Le système devient lent avec un grand nombre de validations.

**Solutions :**
1. Utilisez toujours la pagination
2. Utilisez des critères de recherche spécifiques
3. Implémentez une version avec une base de données optimisée
4. Considérez l'utilisation de caches

```typescript
// Utilisation d'un cache simple
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getValidationWithCache(validationId) {
    const cacheKey = `validation_${validationId}`;
    const cachedValue = cache.get(cacheKey);

    if (cachedValue && cachedValue.timestamp > Date.now() - CACHE_TTL) {
        return cachedValue.data;
    }

    const manager = getValidationManager();
    const result = await manager.getValidationState(validationId);

    if (result.success) {
        cache.set(cacheKey, {
            data: result.data,
            timestamp: Date.now()
        });
    }

    return result;
}
```

## Bonnes pratiques

### Structure de code recommandée

```
project /
├── src /
│   ├── services /
│   │   └── validation - service.ts  # Point d'entrée principal
│   ├── models /
│   │   └── validation - models.ts   # Types / interfaces
│   ├── controllers /
│   │   └── validation - controller.ts  # Logique métier
│   ├── routes /
│   │   └── validation - routes.ts   # Routes API
│   └── utils /
│       └── validation - utils.ts    # Utilitaires
├── config /
│   └── validation - config.ts       # Configuration
└── tests /
    └── validation.test.ts         # Tests
    ```

### Validation des données

Toujours valider les données d'entrée, particulièrement pour les requêtes de validation et les feedbacks.

```typescript
import { ValidationRequestValidator, ValidationFeedbackValidator } from 'validation-collaborative-system/utils/validation-helpers';

function validateInput(data, type) {
    let validator;

    switch (type) {
        case 'request':
            validator = new ValidationRequestValidator();
            break;
        case 'feedback':
            validator = new ValidationFeedbackValidator();
            break;
        default:
            throw new Error(`Unknown validator type: ${type}`);
    }

    const result = validator.validate(data);

    if (!result.success) {
        throw new Error(`Validation error: ${result.error?.message}`);
    }

    return result.data;
}

// Utilisation
app.post('/api/validations', (req, res) => {
    try {
        const validatedRequest = validateInput(req.body, 'request');
        // Suite du traitement...
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
```

### Gestion des erreurs

Utilisez le type `Result<T>` pour une gestion cohérente des erreurs.

```typescript
// Wrapper pour les contrôleurs
function controllerWrapper(handler) {
    return async (req, res) => {
        try {
            const result = await handler(req, res);

            if (result.success) {
                res.status(200).json({ data: result.data });
            } else {
                const status =
                    result.error?.code === 'RESOURCE_NOT_FOUND' ? 404 :
                        result.error?.code === 'PERMISSION_DENIED' ? 403 :
                            result.error?.code === 'INVALID_DATA' ? 400 :
                                500;

                res.status(status).json({ error: result.error });
            }
        } catch (error) {
            res.status(500).json({
                error: {
                    code: 'INTERNAL_ERROR',
                    message: error.message
                }
            });
        }
    };
}

// Utilisation
app.get('/api/validations/:id', controllerWrapper(async (req) => {
    const manager = getValidationManager();
    return await manager.getValidationState(req.params.id);
}));
```

### Tests

Utilisez des tests unitaires et d'intégration pour valider votre intégration.

```typescript
// validation.test.ts
import { getValidationSystem } from 'validation-collaborative-system';

describe('Validation System Integration', () => {
    let system;

    beforeAll(async () => {
        system = await getValidationSystem({
            // Configuration de test...
        });
    });

    afterAll(async () => {
        if (system) {
            await system.shutdown();
        }
    });

    test('Should submit a validation request', async () => {
        const manager = system.getCollaborationManager();

        const request = {
            type: 'sign',
            content: {
                type: 'sign',
                signId: 'test-sign',
                parameters: {
                    handshape: 'flat',
                    location: 'chest',
                    movement: 'circular',
                    orientation: 'palm-up'
                }
            },
            requester: 'test-user'
        };

        const result = await manager.submitProposal(request);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();

        // Plus de tests...
    });
});
```

Ce guide d'intégration vous fournit les bases pour intégrer le Système de Validation Collaborative dans vos applications. N'hésitez pas à personnaliser ces exemples selon vos besoins spécifiques.