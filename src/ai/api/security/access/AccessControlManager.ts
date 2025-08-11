// src/ai/api/security/access/AccessControlManager.ts

import { SecurityContext } from '../types/SecurityTypes';

interface Permission {
    id: string;
    name: string;
    description: string;
    resource: string;
    actions: string[];
    conditions?: PermissionCondition[];
}

interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    inherits?: string[];
    priority: number;
}

interface PermissionCondition {
    type: 'time' | 'location' | 'device' | 'custom';
    evaluate: (context: SecurityContext) => Promise<boolean>;
    errorMessage: string;
}

interface AccessRequest {
    resource: string;
    action: string;
    context: SecurityContext;
}

interface AccessDecision {
    granted: boolean;
    reason?: string;
    conditions?: PermissionCondition[];
    expiresAt?: number;
}

interface RoleHierarchy {
    role: Role;
    children: RoleHierarchy[];
}

export class AccessControlManager {
    private readonly permissions = new Map<string, Permission>();
    private readonly roles = new Map<string, Role>();
    private readonly userRoles = new Map<string, Set<string>>();
    private readonly roleHierarchy = new Map<string, Set<string>>();
    private readonly accessCache = new Map<string, AccessDecision>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    constructor() {
        this.initializeDefaultRoles();
        this.initializeDefaultPermissions();
    }

    async checkAccess(request: AccessRequest): Promise<AccessDecision> {
        try {
            // Vérifier le cache
            const cacheKey = this.generateCacheKey(request);
            const cachedDecision = this.getCachedDecision(cacheKey);
            if (cachedDecision) return cachedDecision;

            // Obtenir tous les rôles de l'utilisateur, y compris hérités
            const userRoles = await this.getAllUserRoles(request.context.userId);

            // Obtenir toutes les permissions applicables
            const permissions = await this.getEffectivePermissions(userRoles);

            // Vérifier les permissions pour la ressource et l'action
            const applicablePermissions = permissions.filter(permission =>
                permission.resource === request.resource &&
                permission.actions.includes(request.action)
            );

            if (applicablePermissions.length === 0) {
                return this.denyAccess('No applicable permissions found');
            }

            // Vérifier les conditions pour chaque permission
            for (const permission of applicablePermissions) {
                const conditionsValid = await this.evaluateConditions(
                    permission.conditions || [],
                    request.context
                );

                if (conditionsValid) {
                    const decision = this.grantAccess(permission.conditions);
                    this.cacheDecision(cacheKey, decision);
                    return decision;
                }
            }

            return this.denyAccess('Conditions not met');

        } catch (error) {
            console.error('Access control error:', error);
            return this.denyAccess('Internal access control error');
        }
    }

    async addUserRole(userId: string, roleId: string): Promise<void> {
        const role = this.roles.get(roleId);
        if (!role) {
            throw new Error(`Role ${roleId} not found`);
        }

        let userRoleSet = this.userRoles.get(userId);
        if (!userRoleSet) {
            userRoleSet = new Set();
            this.userRoles.set(userId, userRoleSet);
        }

        userRoleSet.add(roleId);
        this.clearUserAccessCache(userId);
    }

    async removeUserRole(userId: string, roleId: string): Promise<void> {
        const userRoleSet = this.userRoles.get(userId);
        if (userRoleSet) {
            userRoleSet.delete(roleId);
            this.clearUserAccessCache(userId);
        }
    }

    private async getAllUserRoles(userId: string): Promise<Role[]> {
        const directRoles = this.userRoles.get(userId) || new Set<string>();
        const allRoleIds = new Set<string>();

        // Ajouter les rôles directs et leurs héritages
        for (const roleId of directRoles) {
            allRoleIds.add(roleId);
            const inheritedRoles = this.getInheritedRoles(roleId);
            inheritedRoles.forEach(id => allRoleIds.add(id));
        }

        return Array.from(allRoleIds)
            .map(id => this.roles.get(id))
            .filter((role): role is Role => role !== undefined)
            .sort((a, b) => b.priority - a.priority);
    }

    private getInheritedRoles(roleId: string, visited = new Set<string>()): Set<string> {
        if (visited.has(roleId)) return new Set();
        visited.add(roleId);

        const inherited = this.roleHierarchy.get(roleId) || new Set<string>();
        const allInherited = new Set(inherited);

        for (const inheritedRoleId of inherited) {
            const subInherited = this.getInheritedRoles(inheritedRoleId, visited);
            subInherited.forEach(id => allInherited.add(id));
        }

        return allInherited;
    }

    private async getEffectivePermissions(roles: Role[]): Promise<Permission[]> {
        const permissionIds = new Set<string>();
        roles.forEach(role => {
            role.permissions.forEach(permId => permissionIds.add(permId));
        });

        return Array.from(permissionIds)
            .map(id => this.permissions.get(id))
            .filter((perm): perm is Permission => perm !== undefined);
    }

    private async evaluateConditions(
        conditions: PermissionCondition[],
        context: SecurityContext
    ): Promise<boolean> {
        try {
            for (const condition of conditions) {
                if (!await condition.evaluate(context)) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Error evaluating conditions:', error);
            return false;
        }
    }

    private generateCacheKey(request: AccessRequest): string {
        return `${request.context.userId}:${request.resource}:${request.action}`;
    }

    private getCachedDecision(key: string): AccessDecision | null {
        const cached = this.accessCache.get(key);
        if (cached && (!cached.expiresAt || cached.expiresAt > Date.now())) {
            return cached;
        }
        this.accessCache.delete(key);
        return null;
    }

    private cacheDecision(key: string, decision: AccessDecision): void {
        decision.expiresAt = Date.now() + this.CACHE_DURATION;
        this.accessCache.set(key, decision);
    }

    private clearUserAccessCache(userId: string): void {
        for (const [key] of this.accessCache) {
            if (key.startsWith(userId + ':')) {
                this.accessCache.delete(key);
            }
        }
    }

    private grantAccess(conditions?: PermissionCondition[]): AccessDecision {
        return {
            granted: true,
            conditions,
            expiresAt: Date.now() + this.CACHE_DURATION
        };
    }

    private denyAccess(reason: string): AccessDecision {
        return {
            granted: false,
            reason
        };
    }

    private initializeDefaultRoles(): void {
        // Rôle Administrateur
        this.addRole({
            id: 'admin',
            name: 'Administrator',
            description: 'Full system access',
            permissions: ['*'],
            priority: 1000
        });

        // Rôle Utilisateur
        this.addRole({
            id: 'user',
            name: 'Standard User',
            description: 'Standard system access',
            permissions: ['read', 'write'],
            priority: 100
        });

        // Rôle en Lecture Seule
        this.addRole({
            id: 'readonly',
            name: 'Read Only',
            description: 'Read only access',
            permissions: ['read'],
            priority: 10
        });
    }

    private initializeDefaultPermissions(): void {
        this.addPermission({
            id: 'read',
            name: 'Read Access',
            description: 'Read access to resources',
            resource: '*',
            actions: ['read', 'view', 'list']
        });

        this.addPermission({
            id: 'write',
            name: 'Write Access',
            description: 'Write access to resources',
            resource: '*',
            actions: ['create', 'update', 'delete']
        });
    }

    // Méthodes publiques utilitaires
    public addRole(role: Role): void {
        this.roles.set(role.id, role);
        if (role.inherits) {
            this.roleHierarchy.set(role.id, new Set(role.inherits));
        }
    }

    public removeRole(roleId: string): void {
        this.roles.delete(roleId);
        this.roleHierarchy.delete(roleId);
        // Nettoyer les références dans d'autres rôles
        for (const inheritedRoles of this.roleHierarchy.values()) {
            inheritedRoles.delete(roleId);
        }
    }

    public addPermission(permission: Permission): void {
        this.permissions.set(permission.id, permission);
    }

    public removePermission(permissionId: string): void {
        this.permissions.delete(permissionId);
    }

    public getRoleHierarchy(): RoleHierarchy[] {
        const buildHierarchy = (roleId: string, visited = new Set<string>()): RoleHierarchy => {
            if (visited.has(roleId)) {
                return { role: this.roles.get(roleId)!, children: [] };
            }
            visited.add(roleId);

            const role = this.roles.get(roleId)!;
            const children = Array.from(this.roleHierarchy.get(roleId) || [])
                .map(childId => buildHierarchy(childId, visited));

            return { role, children };
        };

        return Array.from(this.roles.keys())
            .filter(roleId => !Array.from(this.roleHierarchy.values())
                .some(inherited => inherited.has(roleId)))
            .map(roleId => buildHierarchy(roleId));
    }

    public getUserRoles(userId: string): Role[] {
        const roleIds = this.userRoles.get(userId) || new Set<string>();
        return Array.from(roleIds)
            .map(id => this.roles.get(id))
            .filter((role): role is Role => role !== undefined);
    }

    public getEffectiveUserPermissions(userId: string): Promise<Permission[]> {
        return this.getAllUserRoles(userId)
            .then(roles => this.getEffectivePermissions(roles));
    }
}