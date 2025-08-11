// authorization/AccessControl.ts
export class AccessControl {
    private permissionManager: PermissionManager;
    private roleValidator: RoleValidator;

    async checkAccess(token: string, resource: string, action: string): Promise<boolean> {
        const roles = await this.roleValidator.getRoles(token);
        const permissions = await this.permissionManager.getPermissions(roles);

        return this.hasPermission(permissions, resource, action);
    }

    private hasPermission(permissions: Permission[], resource: string, action: string): boolean {
        return permissions.some(permission => 
            permission.resource === resource && 
            permission.actions.includes(action)
        );
    }
}