// authorization/RoleValidator.ts
export class RoleValidator {
    private jwtService: JWTService;
    private roleHierarchy: Map<string, string[]>;

    async getRoles(token: string): Promise<string[]> {
        const payload = await this.jwtService.verifyToken(token);
        return this.expandRoles(payload.roles);
    }

    private expandRoles(baseRoles: string[]): string[] {
        const expanded = new Set<string>();
        baseRoles.forEach(role => {
            expanded.add(role);
            const inherited = this.roleHierarchy.get(role) || [];
            inherited.forEach(r => expanded.add(r));
        });
        return Array.from(expanded);
    }
}