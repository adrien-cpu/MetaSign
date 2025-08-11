// authorization/PermissionManager.ts
export class PermissionManager {
    private permissionStore: Map<string, Set<Permission>>;

    async getPermissions(roles: string[]): Promise<Permission[]> {
        const permissions = new Set<Permission>();
        for (const role of roles) {
            const rolePerms = this.permissionStore.get(role) || new Set();
            rolePerms.forEach(perm => permissions.add(perm));
        }
        return Array.from(permissions);
    }
}