// src/ai/api/security/dependency/SecurityDependencyValidator.ts

import { SecurityAuditor } from '../../common/validation/types/SecurityTypes';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface DependencyConfig {
    allowedLicenses: string[];
    blockedPackages: string[];
    minimumVersions: Record<string, string>;
    vulnerabilitySeverityThreshold: 'low' | 'medium' | 'high' | 'critical';
    autoUpdate: boolean;
    packageManagers: ('npm' | 'yarn' | 'pnpm')[];
}

export interface DependencyVulnerability {
    packageName: string;
    version: string;
    vulnerability: {
        id: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        fixedIn?: string;
        cve?: string;
        references: string[];
    };
}

export interface DependencyValidationResult {
    valid: boolean;
    vulnerabilities: DependencyVulnerability[];
    outdatedDependencies: {
        packageName: string;
        currentVersion: string;
        latestVersion: string;
        recommendation: string;
    }[];
    licensesIssues: {
        packageName: string;
        license: string;
        issue: string;
    }[];
}

export class SecurityDependencyValidator {
    constructor(
        private readonly config: DependencyConfig,
        private readonly securityAuditor: SecurityAuditor
    ) { }

    async validateDependencies(): Promise<DependencyValidationResult> {
        try {
            const [
                vulnerabilities,
                outdatedDeps,
                licenseIssues
            ] = await Promise.all([
                this.checkVulnerabilities(),
                this.checkOutdatedDependencies(),
                this.checkLicenses()
            ]);

            const result: DependencyValidationResult = {
                valid: vulnerabilities.length === 0 && licenseIssues.length === 0,
                vulnerabilities,
                outdatedDependencies: outdatedDeps,
                licensesIssues: licenseIssues
            };

            await this.securityAuditor.logDependencyCheck(result);

            return result;
        } catch (error) {
            throw new Error(`Dependency validation failed: ${error}`);
        }
    }

    private async checkVulnerabilities(): Promise<DependencyVulnerability[]> {
        const vulnerabilities: DependencyVulnerability[] = [];
        for (const packageManager of this.config.packageManagers) {
            const pkgVulnerabilities = await this.runSecurityAudit(packageManager);
            vulnerabilities.push(...pkgVulnerabilities);
        }
        return vulnerabilities;
    }

    private async checkOutdatedDependencies(): Promise<{
        packageName: string;
        currentVersion: string;
        latestVersion: string;
        recommendation: string;
    }[]> {
        const outdated = [];
        for (const [pkg, minVersion] of Object.entries(this.config.minimumVersions)) {
            const currentVersion = await this.getPackageVersion(pkg);
            const latestVersion = await this.getLatestPackageVersion(pkg);

            if (this.compareVersions(currentVersion, minVersion) < 0) {
                outdated.push({
                    packageName: pkg,
                    currentVersion,
                    latestVersion,
                    recommendation: `Update to at least ${minVersion}`
                });
            }
        }
        return outdated;
    }

    private async checkLicenses(): Promise<{
        packageName: string;
        license: string;
        issue: string;
    }[]> {
        const issues = [];
        const dependencies = await this.getAllDependencies();

        for (const dep of dependencies) {
            const license = await this.getPackageLicense(dep.name);
            if (!this.config.allowedLicenses.includes(license)) {
                issues.push({
                    packageName: dep.name,
                    license,
                    issue: `License ${license} not in allowed list`
                });
            }
        }
        return issues;
    }

    private async runSecurityAudit(packageManager: 'npm' | 'yarn' | 'pnpm'): Promise<DependencyVulnerability[]> {
        if (packageManager === 'npm') {
            return this.runNpmAudit();
        } else if (packageManager === 'yarn') {
            return this.runYarnAudit();
        } else {
            return this.runPnpmAudit();
        }
    }

    private async runNpmAudit(): Promise<DependencyVulnerability[]> {
        try {
            const vulnerabilities: DependencyVulnerability[] = [];

            // Exécuter npm audit en format JSON
            const auditOutput = execSync('npm audit --json', { encoding: 'utf8' });
            const auditResult = JSON.parse(auditOutput);

            // Traiter les résultats de l'audit
            for (const advisory of auditResult.advisories) {
                const severity = this.mapNpmSeverity(advisory.severity);
                if (this.shouldReportVulnerability(severity)) {
                    vulnerabilities.push({
                        packageName: advisory.module_name,
                        version: advisory.findings[0].version,
                        vulnerability: {
                            id: advisory.id.toString(),
                            severity,
                            description: advisory.overview,
                            fixedIn: advisory.patched_versions,
                            cve: advisory.cves[0],
                            references: advisory.references
                        }
                    });
                }
            }

            return vulnerabilities;
        } catch (error) {
            throw new Error(`NPM audit failed: ${error}`);
        }
    }

    private async runYarnAudit(): Promise<DependencyVulnerability[]> {
        try {
            const vulnerabilities: DependencyVulnerability[] = [];

            // Exécuter yarn audit en format JSON
            const auditOutput = execSync('yarn audit --json', { encoding: 'utf8' });
            const auditLines = auditOutput.split('\n').filter((line: string) => line.trim());

            for (const line of auditLines) {
                try {
                    const advisory = JSON.parse(line);
                    if (advisory.type === 'auditAdvisory') {
                        const severity = this.mapYarnSeverity(advisory.data.advisory.severity);
                        if (this.shouldReportVulnerability(severity)) {
                            vulnerabilities.push({
                                packageName: advisory.data.advisory.module_name,
                                version: advisory.data.advisory.findings[0].version,
                                vulnerability: {
                                    id: advisory.data.advisory.id.toString(),
                                    severity,
                                    description: advisory.data.advisory.overview,
                                    fixedIn: advisory.data.advisory.patched_versions,
                                    cve: advisory.data.advisory.cves[0],
                                    references: advisory.data.advisory.references
                                }
                            });
                        }
                    }
                } catch (parseError) {
                    console.warn(`Failed to parse yarn audit line: ${parseError}`);
                }
            }

            return vulnerabilities;
        } catch (error) {
            throw new Error(`Yarn audit failed: ${error}`);
        }
    }

    private async runPnpmAudit(): Promise<DependencyVulnerability[]> {
        try {
            const vulnerabilities: DependencyVulnerability[] = [];

            // Exécuter pnpm audit en format JSON
            const auditOutput = execSync('pnpm audit --json', { encoding: 'utf8' });
            const auditResult = JSON.parse(auditOutput);

            for (const vuln of auditResult.vulnerabilities) {
                const severity = this.mapPnpmSeverity(vuln.severity);
                if (this.shouldReportVulnerability(severity)) {
                    vulnerabilities.push({
                        packageName: vuln.module_name,
                        version: vuln.version,
                        vulnerability: {
                            id: vuln.id.toString(),
                            severity,
                            description: vuln.overview,
                            fixedIn: vuln.patched_versions,
                            cve: vuln.cves?.[0],
                            references: vuln.references || []
                        }
                    });
                }
            }

            return vulnerabilities;
        } catch (error) {
            throw new Error(`PNPM audit failed: ${error}`);
        }
    }

    private async getPackageVersion(packageName: string): Promise<string> {
        try {
            // Lire le package.json du projet
            const packageJsonPath = join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

            // Chercher dans les différentes sections de dépendances
            const version = packageJson.dependencies?.[packageName] ||
                packageJson.devDependencies?.[packageName] ||
                packageJson.peerDependencies?.[packageName];

            if (!version) {
                throw new Error(`Package ${packageName} not found in package.json`);
            }

            // Nettoyer la version (enlever les ^, ~, etc.)
            return version.replace(/[\^~>=<]/g, '');
        } catch (error) {
            throw new Error(`Failed to get package version: ${error}`);
        }
    }

    private async getLatestPackageVersion(packageName: string): Promise<string> {
        try {
            // Utiliser npm view pour obtenir la dernière version
            const latestVersion = execSync(
                `npm view ${packageName} version`,
                { encoding: 'utf8' }
            ).trim();

            return latestVersion;
        } catch (error) {
            throw new Error(`Failed to get latest package version: ${error}`);
        }
    }

    private async getAllDependencies(): Promise<{ name: string; version: string }[]> {
        try {
            const dependencies: { name: string; version: string }[] = [];

            // Lire le package.json
            const packageJsonPath = join(process.cwd(), 'package.json');
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

            // Fonction helper pour ajouter les dépendances
            const addDependencies = (deps: Record<string, string> = {}) => {
                Object.entries(deps).forEach(([name, version]) => {
                    dependencies.push({
                        name,
                        version: version.replace(/[\^~>=<]/g, '')
                    });
                });
            };

            // Ajouter toutes les types de dépendances
            addDependencies(packageJson.dependencies);
            addDependencies(packageJson.devDependencies);
            addDependencies(packageJson.peerDependencies);

            return dependencies;
        } catch (error) {
            throw new Error(`Failed to get all dependencies: ${error}`);
        }
    }

    private async getPackageLicense(packageName: string): Promise<string> {
        try {
            // Utiliser npm view pour obtenir la licence
            const license = execSync(
                `npm view ${packageName} license`,
                { encoding: 'utf8' }
            ).trim();

            return license;
        } catch (error) {
            throw new Error(`Failed to get package license: ${error}`);
        }
    }

    private shouldReportVulnerability(severity: 'low' | 'medium' | 'high' | 'critical'): boolean {
        const severityLevels = {
            'low': 0,
            'medium': 1,
            'high': 2,
            'critical': 3
        };

        return severityLevels[severity] >= severityLevels[this.config.vulnerabilitySeverityThreshold];
    }

    private mapNpmSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
        const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
            'info': 'low',
            'low': 'low',
            'moderate': 'medium',
            'high': 'high',
            'critical': 'critical'
        };
        return severityMap[severity] || 'low';
    }

    private mapYarnSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
        return this.mapNpmSeverity(severity); // Yarn utilise les mêmes niveaux que npm
    }

    private mapPnpmSeverity(severity: string): 'low' | 'medium' | 'high' | 'critical' {
        return this.mapNpmSeverity(severity); // pnpm utilise les mêmes niveaux que npm
    }

    private compareVersions(version1: string, version2: string): number {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1Part = v1Parts[i] || 0;
            const v2Part = v2Parts[i] || 0;
            if (v1Part > v2Part) return 1;
            if (v1Part < v2Part) return -1;
        }
        return 0;
    }
}