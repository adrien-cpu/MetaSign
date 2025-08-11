// src/ai/learning/fine-tuning/utils/compression.ts

import * as zlib from 'zlib';
import { promisify } from 'util';
import { Logger } from '@ai/utils/Logger';

// Promisifier les fonctions zlib
const gzipPromise = promisify(zlib.gzip);
const gunzipPromise = promisify(zlib.gunzip);
const deflatePromise = promisify(zlib.deflate);
const inflatePromise = promisify(zlib.inflate);
const brotliCompressPromise = promisify(zlib.brotliCompress);
const brotliDecompressPromise = promisify(zlib.brotliDecompress);

const logger = new Logger('CompressionUtils');

/**
 * Options pour la compression
 */
interface CompressionOptions {
    /** Niveau de compression (1-9, 9 étant le plus élevé) */
    level?: number;
    /** Stratégie de compression */
    strategy?: 'default' | 'filtered' | 'huffman' | 'rle' | 'fixed';
    /** Paramètres spécifiques au format */
    formatOptions?: Record<string, unknown>;
}

/**
 * Comprime les données binaires avec le format spécifié
 * @param data Données à compresser
 * @param format Format de compression ('gzip', 'deflate', 'brotli', 'zstd')
 * @param options Options de compression
 * @returns Données compressées
 */
export async function compress(
    data: ArrayBuffer,
    format: string,
    options: CompressionOptions = {}
): Promise<ArrayBuffer> {
    const buffer = Buffer.from(data);
    const startTime = performance.now();

    try {
        let result: Buffer;

        switch (format.toLowerCase()) {
            case 'gzip':
                result = await gzipPromise(buffer, {
                    level: options.level || 6,
                    strategy: options.strategy || 'default'
                });
                break;

            case 'deflate':
                result = await deflatePromise(buffer, {
                    level: options.level || 6,
                    strategy: options.strategy || 'default'
                });
                break;

            case 'brotli':
                result = await brotliCompressPromise(buffer, {
                    params: {
                        [zlib.constants.BROTLI_PARAM_QUALITY]: options.level || 4,
                        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC,
                        ...options.formatOptions
                    }
                });
                break;

            case 'zstd':
                // Simulation de compression ZSTD avec Brotli
                // Dans une implémentation réelle, utilisez une bibliothèque ZSTD comme node-zstd
                logger.info('ZSTD compression requested, using Brotli as fallback');
                result = await brotliCompressPromise(buffer, {
                    params: {
                        [zlib.constants.BROTLI_PARAM_QUALITY]: options.level || 3,
                        [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_GENERIC
                    }
                });
                break;

            case 'none':
                // Pas de compression
                return data;

            default:
                throw new Error(`Unsupported compression format: ${format}`);
        }

        const compressionRatio = buffer.length / result.length;
        const duration = Math.round(performance.now() - startTime);

        logger.info(
            `Compressed ${buffer.length} bytes to ${result.length} bytes ` +
            `(ratio: ${compressionRatio.toFixed(2)}x) in ${duration}ms using ${format}`
        );

        return result.buffer.slice(
            result.byteOffset,
            result.byteOffset + result.byteLength
        );
    } catch (error) {
        logger.error(`Compression error (${format}):`, error);
        throw error;
    }
}

/**
 * Décompresse les données binaires avec le format spécifié
 * @param data Données à décompresser
 * @param format Format de compression ('gzip', 'deflate', 'brotli', 'zstd')
 * @returns Données décompressées
 */
export async function decompress(
    data: ArrayBuffer,
    format: string
): Promise<ArrayBuffer> {
    const buffer = Buffer.from(data);
    const startTime = performance.now();

    try {
        let result: Buffer;

        switch (format.toLowerCase()) {
            case 'gzip':
                result = await gunzipPromise(buffer);
                break;

            case 'deflate':
                result = await inflatePromise(buffer);
                break;

            case 'brotli':
                result = await brotliDecompressPromise(buffer);
                break;

            case 'zstd':
                // Simulation de décompression ZSTD avec Brotli
                logger.info('ZSTD decompression requested, using Brotli as fallback');
                result = await brotliDecompressPromise(buffer);
                break;

            case 'none':
                // Pas de décompression
                return data;

            default:
                throw new Error(`Unsupported decompression format: ${format}`);
        }

        const duration = Math.round(performance.now() - startTime);

        logger.info(
            `Decompressed ${buffer.length} bytes to ${result.length} bytes ` +
            `in ${duration}ms using ${format}`
        );

        return result.buffer.slice(
            result.byteOffset,
            result.byteOffset + result.byteLength
        );
    } catch (error) {
        logger.error(`Decompression error (${format}):`, error);
        throw error;
    }
}

/**
 * Vérifie si un format de compression est supporté
 * @param format Format à vérifier
 * @returns Booléen indiquant si le format est supporté
 */
export function isCompressionFormatSupported(format: string): boolean {
    const supportedFormats = ['gzip', 'deflate', 'brotli', 'zstd', 'none'];
    return supportedFormats.includes(format.toLowerCase());
}

/**
 * Trouve le meilleur format de compression pour un type de données spécifique
 * @param dataType Type de données ('model', 'image', 'text', etc.)
 * @param prioritizeSpeed Prioriser la vitesse sur le taux de compression
 * @returns Format de compression recommandé
 */
export function getBestCompressionFormat(
    dataType: string,
    prioritizeSpeed: boolean = false
): string {
    switch (dataType.toLowerCase()) {
        case 'model':
            return prioritizeSpeed ? 'gzip' : 'brotli';

        case 'text':
        case 'json':
            return prioritizeSpeed ? 'gzip' : 'brotli';

        case 'image':
            // Les images sont généralement déjà compressées
            return 'none';

        default:
            // Format par défaut
            return prioritizeSpeed ? 'gzip' : 'brotli';
    }
}