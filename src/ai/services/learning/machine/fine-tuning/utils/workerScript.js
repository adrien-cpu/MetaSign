// src/ai/learning/fine-tuning/utils/workerScript.js

const { parentPort } = require('worker_threads');

// S'assurer que le port parent est disponible
if (!parentPort) {
    throw new Error('This script must be run as a worker thread');
}

// Informer le parent que le worker est prêt
parentPort.postMessage({ type: 'worker_ready' });

// Écouter les messages du parent
parentPort.on('message', async (message) => {
    if (message.type === 'execute_task') {
        const { taskId, code, args } = message;

        try {
            // Créer une fonction à partir du code
            // Note: Dans un contexte de production, l'évaluation de code arbitraire
            // pourrait présenter des risques de sécurité. Utilisez avec prudence.
            const fn = new Function('args', `
        ${code}
        return fn(...args);
      `);

            // Exécuter la fonction et obtenir le résultat
            const resultPromise = fn(args);
            const result = await resultPromise;

            // Envoyer le résultat au parent
            parentPort.postMessage({
                type: 'task_completed',
                taskId,
                result
            });
        } catch (error) {
            // Envoyer l'erreur au parent
            parentPort.postMessage({
                type: 'task_failed',
                taskId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    } else if (message.type === 'shutdown') {
        // Terminer proprement le worker
        process.exit(0);
    }
});

// Gérer les erreurs
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception in worker:', error);

    // Informer le parent
    if (parentPort) {
        parentPort.postMessage({
            type: 'worker_error',
            error: error.message
        });
    }

    // Terminer le worker avec un code d'erreur
    process.exit(1);
});

// Gérer les rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled rejection in worker:', reason);

    // Informer le parent
    if (parentPort) {
        parentPort.postMessage({
            type: 'worker_error',
            error: reason instanceof Error ? reason.message : String(reason)
        });
    }
});