/**
 * @fileoverview Utilitaires pour l'application MetaSign
 * @module @/lib/utils
 * @version 1.0.0
 * @author MetaSign Team
 * @since 2025-06-16
 * 
 * Fonctions utilitaires réutilisables pour l'ensemble de l'application.
 * Inclut la gestion des classes CSS, la validation, et autres helpers.
 * 
 * @path src/lib/utils.ts
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine et merge les classes CSS avec Tailwind et clsx
 * 
 * @param inputs - Classes CSS à combiner
 * @returns String des classes CSS mergées
 * 
 * @example
 * ```typescript
 * cn('px-4 py-2', 'bg-blue-500', condition && 'text-white')
 * // -> "px-4 py-2 bg-blue-500 text-white"
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formate une date en français
 * 
 * @param date - Date à formater
 * @param options - Options de formatage
 * @returns Date formatée en français
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  return new Intl.DateTimeFormat('fr-FR', options).format(new Date(date));
}

/**
 * Formate une durée en minutes et secondes
 * 
 * @param seconds - Durée en secondes
 * @returns Durée formatée (ex: "2:30")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Vérifie si une valeur est vide (null, undefined, chaîne vide, tableau vide)
 * 
 * @param value - Valeur à vérifier
 * @returns true si la valeur est vide
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Génère un ID unique
 * 
 * @param prefix - Préfixe optionnel pour l'ID
 * @returns ID unique
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Debounce une fonction
 * 
 * @param func - Fonction à debouncer
 * @param wait - Délai d'attente en millisecondes
 * @returns Fonction debouncée
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle une fonction
 * 
 * @param func - Fonction à throttler
 * @param limit - Limite en millisecondes
 * @returns Fonction throttlée
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Capitalise la première lettre d'une chaîne
 * 
 * @param str - Chaîne à capitaliser
 * @returns Chaîne avec première lettre en majuscule
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Tronque une chaîne à une longueur donnée
 * 
 * @param str - Chaîne à tronquer
 * @param length - Longueur maximale
 * @param suffix - Suffixe à ajouter (défaut: "...")
 * @returns Chaîne tronquée
 */
export function truncate(str: string, length: number, suffix = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Convertit une chaîne en slug (URL-friendly)
 * 
 * @param str - Chaîne à convertir
 * @returns Slug généré
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Formate un nombre avec séparateurs de milliers
 * 
 * @param num - Nombre à formater
 * @param locale - Locale (défaut: 'fr-FR')
 * @returns Nombre formaté
 */
export function formatNumber(num: number, locale = 'fr-FR'): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Calcule le pourcentage de progression
 * 
 * @param current - Valeur actuelle
 * @param total - Valeur totale
 * @returns Pourcentage (0-100)
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.max((current / total) * 100, 0), 100);
}

/**
 * Vérifie si un email est valide
 * 
 * @param email - Email à valider
 * @returns true si l'email est valide
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Génère une couleur hexadécimale aléatoire
 * 
 * @returns Couleur hexadécimale
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

/**
 * Copie du texte dans le presse-papiers
 * 
 * @param text - Texte à copier
 * @returns Promise résolue quand le texte est copié
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    // Fallback pour les navigateurs plus anciens
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
}

/**
 * Télécharge un fichier
 * 
 * @param data - Données à télécharger
 * @param filename - Nom du fichier
 * @param type - Type MIME du fichier
 */
export function downloadFile(data: string | Blob, filename: string, type = 'text/plain'): void {
  const blob = typeof data === 'string' ? new Blob([data], { type }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formate la taille d'un fichier en octets
 * 
 * @param bytes - Taille en octets
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns Taille formatée (ex: "1.23 MB")
 */
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Retourne une valeur par défaut si la valeur est null ou undefined
 * 
 * @param value - Valeur à vérifier
 * @param defaultValue - Valeur par défaut
 * @returns Valeur ou valeur par défaut
 */
export function defaultValue<T>(value: T | null | undefined, defaultValue: T): T {
  return value ?? defaultValue;
}

/**
 * Groupe un tableau d'objets par une clé
 * 
 * @param array - Tableau à grouper
 * @param key - Clé de groupement
 * @returns Objet groupé
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}