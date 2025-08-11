/**
 * src/ai/api/distributed/monitoring/optimization/NodeManager.ts
 * Gestionnaire de nœuds pour le système distribué
 */

import { Logger } from '@/ai/api/common/monitoring/LogService';
import { Node, NodeStatus } from './types';

/**
 * Gère les nœuds disponibles dans le système distribué
 */
export class NodeManager {
    private readonly logger: Logger;
    private readonly nodes: Node[] = [];

    /**
     * Crée une nouvelle instance du gestionnaire de nœuds
     */
    constructor() {
        this.logger = new Logger('NodeManager');
    }

    /**
     * Récupère tous les nœuds actuels
     * @returns Liste des nœuds disponibles
     */
    public async getNodes(): Promise<Node[]> {
        return [...this.nodes]; // Retourne une copie pour éviter les modifications externes
    }

    /**
     * Récupère un nœud spécifique par ID
     * @param nodeId Identifiant du nœud
     * @returns Le nœud correspondant ou undefined si non trouvé
     */
    public async getNode(nodeId: string): Promise<Node | undefined> {
        return this.nodes.find(node => node.id === nodeId);
    }

    /**
     * Ajoute un nouveau nœud
     * @param node Nœud à ajouter
     * @throws {Error} Si un nœud avec le même ID existe déjà
     */
    public async addNode(node: Node): Promise<void> {
        if (this.nodes.some(existingNode => existingNode.id === node.id)) {
            const errorMsg = `Node with ID ${node.id} already exists`;
            this.logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        this.nodes.push(node);
        this.logger.info(`Node added: ${node.id} (${node.nodeType})`);
    }

    /**
     * Supprime un nœud
     * @param nodeId Identifiant du nœud à supprimer
     * @returns true si le nœud a été supprimé, false s'il n'existait pas
     */
    public async removeNode(nodeId: string): Promise<boolean> {
        const index = this.nodes.findIndex(node => node.id === nodeId);

        if (index >= 0) {
            const node = this.nodes[index];
            this.nodes.splice(index, 1);
            this.logger.info(`Node removed: ${nodeId} (${node.nodeType})`);
            return true;
        }

        this.logger.warn(`Attempted to remove non-existent node: ${nodeId}`);
        return false;
    }

    /**
     * Met à jour le statut d'un nœud
     * @param nodeId Identifiant du nœud
     * @param status Nouveau statut
     * @throws {Error} Si le nœud n'existe pas
     */
    public async updateNodeStatus(nodeId: string, status: NodeStatus): Promise<void> {
        const node = this.nodes.find(node => node.id === nodeId);

        if (!node) {
            const errorMsg = `Cannot update status: Node ${nodeId} not found`;
            this.logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        const previousStatus = node.status;
        node.status = status;
        this.logger.info(`Node ${nodeId} status updated from ${previousStatus} to ${status}`);
    }

    /**
     * Récupère tous les nœuds ayant un statut spécifique
     * @param status Statut à rechercher
     * @returns Liste des nœuds correspondants
     */
    public async getNodesByStatus(status: NodeStatus): Promise<Node[]> {
        return this.nodes.filter(node => node.status === status);
    }

    /**
     * Vérifie si un nœud existe
     * @param nodeId Identifiant du nœud
     * @returns true si le nœud existe, false sinon
     */
    public async nodeExists(nodeId: string): Promise<boolean> {
        return this.nodes.some(node => node.id === nodeId);
    }
}