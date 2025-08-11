// src/ai/api/security/authentication/RoleManager.ts
import { Logger } from '@/ai/utils/Logger';

/**
 * Structure d'un rôle
 */
export interface Role {
    /** Identifiant unique du rôle */
    id: string;
    /** Nom du rôle */
    name: string;
    /** Description du rôle */
    description: string;
    /** Permissions associées au rôle */
    permissions: string[];
    /** Indique si c'est un rôle système (non modifiable) */
    isSystem?: boolean;
    /** Date de création */
    createdAt: Date;
    /** Date de dernière modification */
    updatedAt: Date;
}

/**
 * Structure d'une permission
 */
export interface Permission {
    /** Identifiant unique de la permission */
    id: string;
    /** Nom de la permission */
    name: string;
    /** Description de la permission */
    description: string;
    /** Catégorie de la permission */
    category: string;
    /** Indique si c'est une permission système (non modifiable) */
    isSystem?: boolean;
    /** Date de création */
    createdAt: Date;
    /** Date de dernière modification */
    updatedAt: Date;
}

/**
 * Association entre un utilisateur et des rôles
 */
export interface UserRoleAssignment {
    /** Identifiant de l'utilisateur */
    userId: string;
    /** Identifiants des rôles assignés */
    roleIds: string[];
    /** Date d'attribution */
    assignedAt: Date;
    /** Date d'expiration (optionnelle) */
    expiresAt?: Date | undefined;
    /** Contexte d'attribution (e.g. 'projet-123', 'organisation-456') */
    context?: string | undefined;
}

/**
 * Options pour le gestionnaire de rôles
 */
export interface RoleManagerOptions {
    /** Mode de fonctionnement du cache */
    cacheMode?: 'none' | 'memory' | 'redis';
    /** Durée de validité du cache en secondes */
    cacheTTL?: number;
    /** Repository pour récupérer les données */
    repository?: RoleRepository;
}

/**
 * Interface pour l'accès aux données des rôles
 */
export interface RoleRepository {
    /** Récupère tous les rôles */
    getAllRoles(): Promise<Role[]>;
    /** Récupère un rôle par son ID */
    getRoleById(roleId: string): Promise<Role | null>;
    /** Récupère toutes les permissions */
    getAllPermissions(): Promise<Permission[]>;
    /** Récupère une permission par son ID */
    getPermissionById(permissionId: string): Promise<Permission | null>;
    /** Récupère les rôles d'un utilisateur */
    getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]>;
    /** Assigne des rôles à un utilisateur */
    assignRolesToUser(assignment: UserRoleAssignment): Promise<void>;
    /** Retire des rôles à un utilisateur */
    removeRolesFromUser(userId: string, roleIds: string[], context?: string): Promise<void>;
}

/**
 * Implémentation en mémoire du repository de rôles (pour le développement/tests)
 */
export class InMemoryRoleRepository implements RoleRepository {
    private roles: Map<string, Role> = new Map();
    private permissions: Map<string, Permission> = new Map();
    private userRoles: Map<string, UserRoleAssignment[]> = new Map();

    /**
     * Constructeur qui initialise des données par défaut
     */
    constructor() {
        // Initialiser quelques permissions par défaut
        const defaultPermissions: Permission[] = [
            {
                id: 'read_data',
                name: 'Lire des données',
                description: 'Permission de lire des données',
                category: 'data',
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'write_data',
                name: 'Écrire des données',
                description: 'Permission de modifier des données',
                category: 'data',
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'delete_data',
                name: 'Supprimer des données',
                description: 'Permission de supprimer des données',
                category: 'data',
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'manage_users',
                name: 'Gérer les utilisateurs',
                description: 'Permission de gérer les utilisateurs',
                category: 'admin',
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'manage_roles',
                name: 'Gérer les rôles',
                description: 'Permission de gérer les rôles et permissions',
                category: 'admin',
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Initialiser quelques rôles par défaut
        const defaultRoles: Role[] = [
            {
                id: 'admin',
                name: 'Administrateur',
                description: 'Accès complet au système',
                permissions: ['read_data', 'write_data', 'delete_data', 'manage_users', 'manage_roles'],
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'user',
                name: 'Utilisateur',
                description: 'Accès standard',
                permissions: ['read_data', 'write_data'],
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 'guest',
                name: 'Invité',
                description: 'Accès en lecture seule',
                permissions: ['read_data'],
                isSystem: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Stocker les permissions
        for (const permission of defaultPermissions) {
            this.permissions.set(permission.id, permission);
        }

        // Stocker les rôles
        for (const role of defaultRoles) {
            this.roles.set(role.id, role);
        }
    }

    public async getAllRoles(): Promise<Role[]> {
        return Array.from(this.roles.values());
    }

    public async getRoleById(roleId: string): Promise<Role | null> {
        return this.roles.get(roleId) || null;
    }

    public async getAllPermissions(): Promise<Permission[]> {
        return Array.from(this.permissions.values());
    }

    public async getPermissionById(permissionId: string): Promise<Permission | null> {
        return this.permissions.get(permissionId) || null;
    }

    public async getUserRoleAssignments(userId: string): Promise<UserRoleAssignment[]> {
        return this.userRoles.get(userId) || [];
    }

    public async assignRolesToUser(assignment: UserRoleAssignment): Promise<void> {
        const currentAssignments = this.userRoles.get(assignment.userId) || [];

        // Filtrer les assignations existantes dans le même contexte
        const filteredAssignments = currentAssignments.filter(
            a => a.context !== assignment.context
        );

        // Ajouter la nouvelle assignation
        filteredAssignments.push(assignment);

        this.userRoles.set(assignment.userId, filteredAssignments);
    }

    public async removeRolesFromUser(userId: string, roleIds: string[], context?: string): Promise<void> {
        const currentAssignments = this.userRoles.get(userId) || [];

        // Filtrer les assignations à conserver
        const updatedAssignments = currentAssignments.filter(assignment => {
            // Si un contexte est spécifié, ne filtrer que les assignations de ce contexte
            if (context && assignment.context !== context) {
                return true;
            }

            // Conserver cette assignation si elle ne contient aucun des rôles à supprimer
            return !assignment.roleIds.some(roleId => roleIds.includes(roleId));
        });

        if (updatedAssignments.length > 0) {
            this.userRoles.set(userId, updatedAssignments);
        } else {
            this.userRoles.delete(userId);
        }
    }
}

/**
 * Gestionnaire de rôles et permissions des utilisateurs
 */
export class RoleManager {
    private readonly logger: Logger;
    private readonly cacheMode: 'none' | 'memory' | 'redis';
    private readonly cacheTTL: number;
    private readonly repository: RoleRepository;

    // Cache en mémoire
    private readonly roleCache = new Map<string, Role>();
    private readonly permissionCache = new Map<string, Permission>();
    private readonly userRolesCache = new Map<string, {
        roles: string[],
        permissions: string[],
        expiresAt: number
    }>();

    /**
     * Constructeur
     * @param options Options de configuration
     */
    constructor(options: RoleManagerOptions = {}) {
        this.logger = new Logger('RoleManager');
        this.cacheMode = options.cacheMode || 'memory';
        this.cacheTTL = options.cacheTTL || 300; // 5 minutes par défaut
        this.repository = options.repository || new InMemoryRoleRepository();

        this.logger.info(`RoleManager initialized with cache mode: ${this.cacheMode}`);

        // Précharger les données dans le cache si le mode mémoire est activé
        if (this.cacheMode === 'memory') {
            this.preloadCache().catch(error => {
                this.logger.error('Failed to preload role cache', { error: error instanceof Error ? error.message : String(error) });
            });
        }
    }

    /**
     * Précharge les rôles et permissions dans le cache
     * @private
     */
    private async preloadCache(): Promise<void> {
        try {
            // Charger toutes les permissions
            const permissions = await this.repository.getAllPermissions();
            for (const permission of permissions) {
                this.permissionCache.set(permission.id, permission);
            }

            // Charger tous les rôles
            const roles = await this.repository.getAllRoles();
            for (const role of roles) {
                this.roleCache.set(role.id, role);
            }

            this.logger.debug(`Preloaded ${roles.length} roles and ${permissions.length} permissions into cache`);
        } catch (error) {
            this.logger.error('Error preloading cache', { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }

    /**
     * Récupère les rôles d'un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Liste des rôles
     */
    public async getUserRoles(userId: string): Promise<string[]> {
        try {
            // Vérifier le cache
            if (this.cacheMode !== 'none') {
                const cachedData = this.userRolesCache.get(userId);
                if (cachedData && cachedData.expiresAt > Date.now()) {
                    return cachedData.roles;
                }
            }

            // Récupérer les assignations
            const assignments = await this.repository.getUserRoleAssignments(userId);

            // Filtrer les assignations expirées
            const validAssignments = assignments.filter(assignment =>
                !assignment.expiresAt || assignment.expiresAt > new Date()
            );

            // Extraire les IDs de rôle uniques
            const roleIds = Array.from(
                new Set(validAssignments.flatMap(assignment => assignment.roleIds))
            );

            // Récupérer les permissions associées à ces rôles
            const permissions = await this.getUserPermissionsByRoles(roleIds);

            // Mettre en cache
            if (this.cacheMode !== 'none') {
                this.userRolesCache.set(userId, {
                    roles: roleIds,
                    permissions,
                    expiresAt: Date.now() + this.cacheTTL * 1000
                });
            }

            return roleIds;
        } catch (error) {
            this.logger.error(`Failed to get roles for user: ${userId}`, { error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }

    /**
     * Récupère les permissions d'un utilisateur
     * @param userId ID de l'utilisateur
     * @returns Liste des permissions
     */
    public async getUserPermissions(userId: string): Promise<string[]> {
        try {
            // Vérifier le cache
            if (this.cacheMode !== 'none') {
                const cachedData = this.userRolesCache.get(userId);
                if (cachedData && cachedData.expiresAt > Date.now()) {
                    return cachedData.permissions;
                }
            }

            // Récupérer d'abord les rôles
            const roleIds = await this.getUserRoles(userId);

            // Récupérer les permissions
            const permissions = await this.getUserPermissionsByRoles(roleIds);

            return permissions;
        } catch (error) {
            this.logger.error(`Failed to get permissions for user: ${userId}`, { error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }

    /**
     * Récupère les permissions associées à des rôles
     * @param roleIds IDs des rôles
     * @returns Liste des permissions uniques
     * @private
     */
    private async getUserPermissionsByRoles(roleIds: string[]): Promise<string[]> {
        if (roleIds.length === 0) {
            return [];
        }

        try {
            const permissionSets: string[][] = [];

            // Pour chaque rôle, récupérer ses permissions
            for (const roleId of roleIds) {
                let role: Role | null;

                // Essayer de récupérer depuis le cache
                if (this.cacheMode !== 'none' && this.roleCache.has(roleId)) {
                    role = this.roleCache.get(roleId) as Role;
                } else {
                    // Récupérer depuis le repository
                    role = await this.repository.getRoleById(roleId);

                    // Mettre en cache
                    if (role && this.cacheMode !== 'none') {
                        this.roleCache.set(roleId, role);
                    }
                }

                if (role) {
                    permissionSets.push(role.permissions);
                }
            }

            // Fusionner et dédupliquer
            return Array.from(new Set(permissionSets.flat()));
        } catch (error) {
            this.logger.error('Failed to get permissions by roles', { error: error instanceof Error ? error.message : String(error) });
            return [];
        }
    }

    /**
     * Assigne des rôles à un utilisateur
     * @param userId ID de l'utilisateur
     * @param roleIds IDs des rôles à assigner
     * @param context Contexte d'attribution (optionnel)
     * @param expiresAt Date d'expiration (optionnelle)
     */
    public async assignRolesToUser(
        userId: string,
        roleIds: string[],
        context?: string,
        expiresAt?: Date
    ): Promise<void> {
        try {
            // Vérifier que les rôles existent
            const invalidRoles: string[] = [];

            for (const roleId of roleIds) {
                const role = await this.repository.getRoleById(roleId);
                if (!role) {
                    invalidRoles.push(roleId);
                }
            }

            if (invalidRoles.length > 0) {
                throw new Error(`Les rôles suivants n'existent pas: ${invalidRoles.join(', ')}`);
            }

            // Créer l'assignation
            const assignment: UserRoleAssignment = {
                userId,
                roleIds,
                assignedAt: new Date(),
                expiresAt,
                context
            };

            // Persister l'assignation
            await this.repository.assignRolesToUser(assignment);

            // Invalider le cache
            if (this.cacheMode !== 'none') {
                this.userRolesCache.delete(userId);
            }

            this.logger.info(`Roles ${roleIds.join(', ')} assigned to user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to assign roles to user: ${userId}`, { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }

    /**
     * Retire des rôles à un utilisateur
     * @param userId ID de l'utilisateur
     * @param roleIds IDs des rôles à retirer
     * @param context Contexte d'attribution (optionnel)
     */
    public async removeRolesFromUser(
        userId: string,
        roleIds: string[],
        context?: string
    ): Promise<void> {
        try {
            await this.repository.removeRolesFromUser(userId, roleIds, context);

            // Invalider le cache
            if (this.cacheMode !== 'none') {
                this.userRolesCache.delete(userId);
            }

            this.logger.info(`Roles ${roleIds.join(', ')} removed from user ${userId}`);
        } catch (error) {
            this.logger.error(`Failed to remove roles from user: ${userId}`, { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }

    /**
     * Vérifie si un utilisateur a un rôle spécifique
     * @param userId ID de l'utilisateur
     * @param roleId ID du rôle à vérifier
     * @returns true si l'utilisateur a le rôle
     */
    public async userHasRole(userId: string, roleId: string): Promise<boolean> {
        const roles = await this.getUserRoles(userId);
        return roles.includes(roleId);
    }

    /**
     * Vérifie si un utilisateur a une permission spécifique
     * @param userId ID de l'utilisateur
     * @param permissionId ID de la permission à vérifier
     * @returns true si l'utilisateur a la permission
     */
    public async userHasPermission(userId: string, permissionId: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissions.includes(permissionId);
    }

    /**
     * Vérifie si un utilisateur a toutes les permissions spécifiées
     * @param userId ID de l'utilisateur
     * @param permissionIds IDs des permissions à vérifier
     * @returns true si l'utilisateur a toutes les permissions
     */
    public async userHasAllPermissions(userId: string, permissionIds: string[]): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissionIds.every(permissionId => permissions.includes(permissionId));
    }

    /**
     * Vérifie si un utilisateur a au moins une des permissions spécifiées
     * @param userId ID de l'utilisateur
     * @param permissionIds IDs des permissions à vérifier
     * @returns true si l'utilisateur a au moins une permission
     */
    public async userHasAnyPermission(userId: string, permissionIds: string[]): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);
        return permissionIds.some(permissionId => permissions.includes(permissionId));
    }

    /**
     * Crée un nouveau rôle
     * @param roleData Données du rôle à créer
     * @returns Le rôle créé
     */
    public async createRole(_roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
        // Cette méthode est juste un exemple - dans une implémentation réelle,
        // il faudrait l'adapter à l'interface du repository
        throw new Error('Méthode non implémentée');
    }

    /**
     * Invalide le cache d'un utilisateur spécifique
     * @param userId ID de l'utilisateur
     */
    public invalidateUserCache(userId: string): void {
        if (this.cacheMode !== 'none') {
            this.userRolesCache.delete(userId);
            this.logger.debug(`Cache invalidated for user: ${userId}`);
        }
    }

    /**
     * Invalide tout le cache
     */
    public invalidateAllCache(): void {
        if (this.cacheMode !== 'none') {
            this.roleCache.clear();
            this.permissionCache.clear();
            this.userRolesCache.clear();
            this.logger.debug('All role caches invalidated');
        }
    }
}