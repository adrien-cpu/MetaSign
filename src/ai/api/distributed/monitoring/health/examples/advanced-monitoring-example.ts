/**
 * Exemple d'utilisation du système de monitoring avancé
 */
import { AdvancedHealthMonitoring } from '../advanced-health-monitoring';
import { MonitoringConfiguration } from '../types/monitoring.types';
import { Logger } from '@common/monitoring/LogService';

/**
 * Fonction principale d'exemple
 */
async function main(): Promise<void> {
    try {
        // Initialiser le logger
        const logger = new Logger('AdvancedMonitoringExample');
        logger.info('Démarrage de l\'exemple de monitoring avancé');

        // Configuration avancée
        const monitoringConfig: MonitoringConfiguration = {
            checkInterval: 30000, // 30 secondes

            // Seuils CPU
            cpuThresholds: {
                critical: 90,
                warning: 75
            },

            // Seuils mémoire
            memoryThresholds: {
                critical: 85,
                warning: 70
            },

            // Points d'extrémité à surveiller
            endpoints: [
                {
                    name: 'api-gateway',
                    url: 'https://api.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: true,
                    timeout: 5000,
                    retries: 2
                },
                {
                    name: 'database-service',
                    url: 'https://db.example.com/health',
                    method: 'GET',
                    expectedStatus: [200, 203],
                    critical: true,
                    timeout: 3000,
                    retries: 3
                },
                {
                    name: 'auth-service',
                    url: 'https://auth.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: true,
                    timeout: 3000
                },
                {
                    name: 'analytics-service',
                    url: 'https://analytics.example.com/health',
                    method: 'GET',
                    expectedStatus: [200],
                    critical: false, // Service non critique
                    timeout: 10000
                }
            ],

            // Vérifications personnalisées
            customChecks: [
                {
                    name: 'business-logic',
                    description: 'Vérifie la logique métier critique',
                    critical: true,
                    checkFn: async () => {
                        // Simuler une vérification de logique métier
                        const isHealthy = Math.random() > 0.1; // 90% de chance d'être en bonne santé

                        return {
                            status: isHealthy ? 'healthy' : 'unhealthy',
                            message: isHealthy
                                ? 'La logique métier fonctionne correctement'
                                : 'Problèmes détectés dans la logique métier',
                            details: {
                                lastVerified: Date.now(),
                                responseTime: Math.random() * 500 + 50 // 50-550ms
                            }
                        };
                    }
                },
                {
                    name: 'data-integrity',
                    description: 'Vérifie l\'intégrité des données',
                    critical: false,
                    checkFn: async () => {
                        // Simuler une vérification d'intégrité des données
                        const integrity = Math.random();
                        let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
                        let message = '';

                        if (integrity < 0.05) {
                            status = 'unhealthy';
                            message = 'Corruption de données détectée';
                        } else if (integrity < 0.15) {
                            status = 'degraded';
                            message = 'Incohérences mineures détectées';
                        } else {
                            message = 'Intégrité des données vérifiée avec succès';
                        }

                        return {
                            status,
                            message,
                            details: {
                                integrityScore: integrity * 100,
                                recordsChecked: Math.floor(Math.random() * 10000 + 1000)
                            }
                        };
                    }
                }
            ],

            // Configuration des alertes
            alerting: {
                email: {
                    enabled: true,
                    recipients: ['sysadmin@example.com', 'oncall@example.com'],
                    throttling: 15 // 15 minutes entre les alertes
                },
                slack: {
                    enabled: true,
                    webhookUrl: 'https://hooks.slack.com/services/TXXXXXXXX/BXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXX',
                    channel: '#system-alerts',
                    throttling: 5 // 5 minutes entre les alertes
                },
                pagerDuty: {
                    enabled: true,
                    serviceKey: 'a1b2c3d4e5f6g7h8i9j0',
                    throttling: 30 // 30 minutes entre les alertes
                }
            },

            // Configuration des métriques
            metrics: {
                retention: 24, // 24 heures
                aggregationInterval: 5, // 5 minutes
                exportEnabled: true,
                exportPath: './health_metrics.json'
            }
        };

        // Créer et initialiser le moniteur avancé
        const monitor = new AdvancedHealthMonitoring(monitoringConfig, logger);
        await monitor.initialize();

        logger.info("Système de monitoring démarré. Appuyez sur Ctrl+C pour quitter.");

        // Forcer une vérification après 10 secondes et afficher des statistiques
        setTimeout(async () => {
            await monitor.checkNow();

            logger.info("--- Statistiques de monitoring ---");

            const kpis = monitor.getKPIs();
            logger.info(`Uptime: ${kpis.uptime.toFixed(2)}%`);
            logger.info(`MTBF: ${(kpis.mtbf / (3600 * 1000)).toFixed(2)} heures`);
            logger.info(`MTTR: ${(kpis.mttr / (60 * 1000)).toFixed(2)} minutes`);
            logger.info(`Nombre de pannes: ${kpis.failureCount}`);

            logger.info("--- Dernières métriques ---");
            const metrics = monitor.getMetrics();

            for (const [metricName, metricValues] of Object.entries(metrics)) {
                if (metricValues.length > 0) {
                    const lastMetric = metricValues[metricValues.length - 1];
                    logger.info(`${metricName}: ${lastMetric.value.toFixed(2)} (${new Date(lastMetric.timestamp).toISOString()})`);
                }
            }

            logger.info("Surveillance en cours...");
        }, 10000);

        // Gérer l'arrêt propre
        process.on('SIGINT', async () => {
            logger.info("Arrêt en cours...");
            await monitor.shutdown();
            process.exit(0);
        });

    } catch (error) {
        console.error("Erreur lors de l'initialisation du monitoring:", error);
        process.exit(1);
    }
}

// Exécuter le programme si ce fichier est exécuté directement
if (require.main === module) {
    main().catch(console.error);
}

// Exporter la fonction principale pour les tests
export { main };