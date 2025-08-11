// src/ai/learning/fine-tuning/utils/DeviceDetector.ts

import * as os from 'os';
import { execSync } from 'child_process';
import { Logger } from '@ai/utils/Logger';

/**
 * Informations sur le processeur
 */
interface CPUInfo {
    /** Modèle du processeur */
    model: string;
    /** Nombre de cœurs physiques */
    cores: number;
    /** Nombre de threads */
    threads: number;
    /** Fréquence de base (GHz) */
    baseFrequency: number;
    /** Extensions supportées */
    extensions: string[];
    /** Fabricant (AMD/Intel) */
    vendor: 'AMD' | 'Intel' | 'Other';
    /** Détails spécifiques au fabricant */
    vendorSpecific: Record<string, unknown>;
}

/**
 * Informations sur la mémoire
 */
interface MemoryInfo {
    /** Mémoire totale (bytes) */
    total: number;
    /** Mémoire libre (bytes) */
    free: number;
    /** Mémoire totale (Mo) */
    totalMB: number;
    /** Mémoire libre (Mo) */
    freeMB: number;
    /** Mémoire totale (Go) */
    totalGB: number;
    /** Mémoire libre (Go) */
    freeGB: number;
}

/**
 * Informations sur le GPU
 */
interface GPUInfo {
    /** Modèle du GPU */
    model: string;
    /** Fabricant */
    vendor: string;
    /** Mémoire dédiée (Mo) */
    memoryMB?: number;
    /** Support CUDA */
    cudaSupport: boolean;
    /** Support ROCm */
    rocmSupport: boolean;
    /** Support DirectML */
    directMLSupport: boolean;
    /** Support OpenCL */
    openCLSupport: boolean;
    /** Version du pilote */
    driverVersion?: string;
}

/**
 * Classe utilitaire pour détecter les capacités matérielles
 * Spécialement optimisé pour AMD Ryzen 9 6900HX
 */
export class DeviceDetector {
    private readonly logger = new Logger('DeviceDetector');
    private cachedCPUInfo: CPUInfo | null = null;
    private cachedMemoryInfo: MemoryInfo | null = null;
    private cachedGPUInfo: GPUInfo | null = null;

    constructor() {
        this.logger.info('Device detector initialized');
    }

    /**
     * Détecte les informations CPU
     */
    public detectCPU(): CPUInfo {
        if (this.cachedCPUInfo) {
            return this.cachedCPUInfo;
        }

        try {
            const cpus = os.cpus();
            const firstCpu = cpus[0];

            // Détecter le fabricant
            const model = firstCpu.model.toLowerCase();
            let vendor: 'AMD' | 'Intel' | 'Other' = 'Other';

            if (model.includes('amd') || model.includes('ryzen') || model.includes('threadripper')) {
                vendor = 'AMD';
            } else if (model.includes('intel')) {
                vendor = 'Intel';
            }

            // Détecter les extensions CPU
            const extensions: string[] = [];

            // Pour Windows, utiliser une commande wmic
            if (os.platform() === 'win32') {
                try {
                    const output = execSync('wmic cpu get Name /value').toString();
                    const cpuName = output.replace('Name=', '').trim();

                    // Détecter les extensions en fonction du nom du CPU
                    if (cpuName.includes('AMD Ryzen 9 6900HX')) {
                        extensions.push('AVX2', 'FMA3', 'SSE4.2', 'AES');

                        // Spécifique à ce modèle
                        extensions.push('AVX', 'BMI1', 'BMI2', 'F16C', 'MMX', 'SSE', 'SSE2', 'SSE3', 'SSSE3', 'SSE4.1');
                    }
                } catch (error) {
                    this.logger.warn('Failed to get CPU details from wmic:', error);
                }
            } else if (os.platform() === 'linux') {
                try {
                    const output = execSync('cat /proc/cpuinfo').toString();

                    if (output.includes('avx2')) extensions.push('AVX2');
                    if (output.includes('fma')) extensions.push('FMA3');
                    if (output.includes('sse4_2')) extensions.push('SSE4.2');
                    if (output.includes('aes')) extensions.push('AES');
                } catch (error) {
                    this.logger.warn('Failed to get CPU details from /proc/cpuinfo:', error);
                }
            }

            // S'il s'agit bien du Ryzen 9 6900HX et que nous n'avons pas pu détecter les extensions
            if (firstCpu.model.includes('Ryzen 9 6900HX') && extensions.length === 0) {
                extensions.push('AVX2', 'FMA3', 'SSE4.2', 'AES', 'AVX', 'BMI1', 'BMI2', 'F16C');
            }

            // Construire l'objet résultat
            this.cachedCPUInfo = {
                model: firstCpu.model,
                cores: this.detectPhysicalCores(),
                threads: cpus.length,
                baseFrequency: firstCpu.speed / 1000, // Convertir MHz en GHz
                extensions,
                vendor,
                vendorSpecific: this.getVendorSpecificInfo(vendor)
            };

            return this.cachedCPUInfo;
        } catch (error) {
            this.logger.error('Failed to detect CPU info:', error);

            // Valeurs par défaut pour éviter de planter
            return {
                model: 'Unknown',
                cores: 1,
                threads: 1,
                baseFrequency: 1,
                extensions: [],
                vendor: 'Other',
                vendorSpecific: {}
            };
        }
    }

    /**
     * Détecte le nombre de cœurs physiques
     */
    private detectPhysicalCores(): number {
        try {
            if (os.platform() === 'win32') {
                try {
                    const output = execSync('wmic cpu get NumberOfCores /value').toString();
                    const coresMatch = output.match(/NumberOfCores=(\d+)/);

                    if (coresMatch && coresMatch[1]) {
                        return parseInt(coresMatch[1], 10);
                    }
                } catch (error) {
                    this.logger.warn('Failed to get physical cores from wmic:', error);
                }
            } else if (os.platform() === 'linux') {
                try {
                    const output = execSync('cat /proc/cpuinfo | grep "cpu cores" | uniq').toString();
                    const coresMatch = output.match(/cpu cores\s*:\s*(\d+)/);

                    if (coresMatch && coresMatch[1]) {
                        return parseInt(coresMatch[1], 10);
                    }
                } catch (error) {
                    this.logger.warn('Failed to get physical cores from /proc/cpuinfo:', error);
                }
            }

            // Si spécifique à Ryzen 9 6900HX, on sait qu'il a 8 cœurs
            const cpus = os.cpus();
            const firstCpu = cpus[0];

            if (firstCpu.model.includes('Ryzen 9 6900HX')) {
                return 8;
            }

            // Estimation basée sur le nombre de threads
            // Typiquement, 2 threads par cœur pour les CPU modernes
            return Math.ceil(os.cpus().length / 2);
        } catch (error) {
            this.logger.error('Failed to detect physical cores:', error);
            return 1;
        }
    }

    /**
     * Obtient les informations spécifiques au fabricant
     */
    private getVendorSpecificInfo(vendor: 'AMD' | 'Intel' | 'Other'): Record<string, unknown> {
        if (vendor === 'AMD') {
            const cpus = os.cpus();
            const firstCpu = cpus[0];

            // Détecter si c'est un Ryzen 9 6900HX
            if (firstCpu.model.includes('Ryzen 9 6900HX')) {
                return {
                    architecture: 'Zen 3+',
                    series: 'Ryzen 9',
                    generation: '6000',
                    tdp: 45,
                    boostFrequency: 4.9,
                    l3CacheSize: 16,
                    hasIntegratedGraphics: true,
                    graphicsModel: 'AMD Radeon Graphics (RDNA 2)',
                    supportsSMT: true,
                    supportsPBO: true,
                    isMobile: true
                };
            }

            // Valeurs par défaut pour les autres CPU AMD
            return {
                architecture: 'Unknown AMD',
                hasIntegratedGraphics: firstCpu.model.toLowerCase().includes('graphics')
            };
        } else if (vendor === 'Intel') {
            return {
                architecture: 'Unknown Intel'
            };
        }

        return {};
    }

    /**
     * Détecte les informations mémoire
     */
    public detectMemory(): MemoryInfo {
        if (this.cachedMemoryInfo) {
            return this.cachedMemoryInfo;
        }

        try {
            const totalMem = os.totalmem();
            const freeMem = os.freemem();

            const totalMemMB = Math.round(totalMem / (1024 * 1024));
            const freeMemMB = Math.round(freeMem / (1024 * 1024));

            this.cachedMemoryInfo = {
                total: totalMem,
                free: freeMem,
                totalMB: totalMemMB,
                freeMB: freeMemMB,
                totalGB: Math.round(totalMemMB / 1024 * 10) / 10,
                freeGB: Math.round(freeMemMB / 1024 * 10) / 10
            };

            return this.cachedMemoryInfo;
        } catch (error) {
            this.logger.error('Failed to detect memory info:', error);

            // Valeurs par défaut
            return {
                total: 0,
                free: 0,
                totalMB: 0,
                freeMB: 0,
                totalGB: 0,
                freeGB: 0
            };
        }
    }

    /**
     * Détecte les informations GPU
     */
    public detectGPU(): GPUInfo {
        if (this.cachedGPUInfo) {
            return this.cachedGPUInfo;
        }

        try {
            const cpuInfo = this.detectCPU();

            // Pour AMD Ryzen 9 6900HX, nous savons qu'il a un GPU intégré AMD Radeon
            if (cpuInfo.model.includes('Ryzen 9 6900HX')) {
                this.cachedGPUInfo = {
                    model: 'AMD Radeon Graphics (RDNA 2)',
                    vendor: 'AMD',
                    memoryMB: 512, // Estimation, partage la RAM système
                    cudaSupport: false,
                    rocmSupport: this.checkROCmSupport(),
                    directMLSupport: os.platform() === 'win32',
                    openCLSupport: true
                };

                return this.cachedGPUInfo;
            }

            // Autre détection (simplifiée)
            let gpuModel = 'Unknown';
            let vendor = 'Unknown';

            if (os.platform() === 'win32') {
                try {
                    const output = execSync('wmic path win32_VideoController get Name /value').toString();
                    const nameMatch = output.match(/Name=(.+)/);

                    if (nameMatch && nameMatch[1]) {
                        gpuModel = nameMatch[1].trim();

                        if (gpuModel.toLowerCase().includes('nvidia')) {
                            vendor = 'NVIDIA';
                        } else if (gpuModel.toLowerCase().includes('amd') || gpuModel.toLowerCase().includes('radeon')) {
                            vendor = 'AMD';
                        } else if (gpuModel.toLowerCase().includes('intel')) {
                            vendor = 'Intel';
                        }
                    }
                } catch (error) {
                    this.logger.warn('Failed to get GPU info from wmic:', error);
                }
            }

            this.cachedGPUInfo = {
                model: gpuModel,
                vendor,
                cudaSupport: vendor === 'NVIDIA',
                rocmSupport: vendor === 'AMD' && this.checkROCmSupport(),
                directMLSupport: os.platform() === 'win32',
                openCLSupport: vendor !== 'Unknown'
            };

            return this.cachedGPUInfo;
        } catch (error) {
            this.logger.error('Failed to detect GPU info:', error);

            // Valeurs par défaut
            return {
                model: 'Unknown',
                vendor: 'Unknown',
                cudaSupport: false,
                rocmSupport: false,
                directMLSupport: false,
                openCLSupport: false
            };
        }
    }

    /**
     * Vérifie si AVX2 est supporté
     */
    public checkAVX2Support(): boolean {
        const cpuInfo = this.detectCPU();
        return cpuInfo.extensions.includes('AVX2');
    }

    /**
     * Vérifie si FMA3 est supporté
     */
    public checkFMA3Support(): boolean {
        const cpuInfo = this.detectCPU();
        return cpuInfo.extensions.includes('FMA3');
    }

    /**
     * Vérifie si ROCm est supporté
     */
    public checkROCmSupport(): boolean {
        try {
            if (os.platform() === 'win32') {
                // ROCm n'est pas officiellement supporté sur Windows
                return false;
            } else if (os.platform() === 'linux') {
                try {
                    // Vérifier si rocm-smi est disponible
                    execSync('which rocm-smi');
                    return true;
                } catch (error) {
                    return false;
                }
            }

            return false;
        } catch (error) {
            return false;
        }
    }

    /**
     * Obtient la mémoire disponible en MB
     */
    public getAvailableMemory(): number {
        const memInfo = this.detectMemory();
        return memInfo.freeMB;
    }

    /**
     * Obtient les informations complètes sur le système
     */
    public getSystemInfo(): {
        cpu: CPUInfo;
        memory: MemoryInfo;
        gpu: GPUInfo;
        platform: string;
        arch: string;
        hostname: string;
    } {
        return {
            cpu: this.detectCPU(),
            memory: this.detectMemory(),
            gpu: this.detectGPU(),
            platform: os.platform(),
            arch: os.arch(),
            hostname: os.hostname()
        };
    }
}