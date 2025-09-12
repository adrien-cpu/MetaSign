/**
 * @fileoverview Constantes de routes de l'application MetaSign
 * @module routes
 * @description Centralise toutes les routes de l'application pour une maintenance facile
 * et éviter les erreurs de typage dans les chemins d'URL.
 */

/**
 * Objet contenant toutes les routes de l'application MetaSign
 * @constant {Object} ROUTES
 * @description
 * Organise les routes par catégorie :
 * - Administration : Gestion admin et dashboard
 * - API : Endpoints d'authentification
 * - Authentification : Login, register, logout
 * - Pages principales : Accueil et navigation
 * - Profil utilisateur : Gestion du compte et personnalisation
 * - Traduction : Fonctionnalités LSF (texte, voix, AR)
 * - Apprentissage : Parcours d'apprentissage
 * - Culture sourde : Contenu culturel
 * - Social : Clubs, chats, événements
 * - Infrastructures : Lieux accessibles
 * - Avatar : Assistant virtuel
 * 
 * @example
 * ```typescript
 * import { ROUTES } from '@/constants/routes';
 * 
 * // Navigation vers le profil utilisateur
 * router.push(ROUTES.USER_PROFILE);
 * 
 * // Redirection vers la page de connexion
 * window.location.href = ROUTES.LOGIN;
 * ```
 */
export const ROUTES = {
  // Administration
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/pages/adminDashboard',
  ADMIN_USERS: '/admin/users',

  //Pages Développeurs
  DEV_DASHBOARD: '/pages/devDashboard',

  //API
  API_REGISTER: '/api/auth/register',

  // Authentification
  LOGIN: '/modules/public/auth/login', //fait
  REGISTER: '/modules/public/auth/register', //fait
  LOGOUT: '/modules/public/auth/logout', //fait

  // Pages principales
  HOME: '/modules/protected/home', //fait

  //Pages Profil Utilisateurs
  USER_DASHBOARD: '/pages/userDashboard', //fait
  USER_PROFILE: '/modules/protected/user/profile', //fait
  USER_PERSONALIZATION: '/modules/protected/user/personalization', //fait
  USER_AVATAR: '/modules/protected/user/avatar', //fait
  USER_BADGES: '/modules/protected/user/gamification', //fait
  USER_STATS: '/modules/protected/user/stats', //fait
  USER_CONTACTS: '/modules/protected/user/contacts', //fait
  USER_CODA: '/modules/protected/user/coda', //fait

  //PROFIL UTILISATEUR - PASSWORD
  VERIFY_PASSWORD: '/api/user/verify-password', //fait
  UPDATE_PASSWORD: '/api/user/updatePassword', //fait
  FORGOT_PASSWORD: '/api/user/forgotPassword', //fait
  RESET_PASSWORD: '/api/user/resetPassword', //fait

  // Traduction
  TRANSLATION: '/pages/translation',
  TRANSLATION_TEXT: '/translation/text-to-sign',
  TRANSLATION_VOICE: '/translation/voice-to-sign',
  TRANSLATION_SCAN: '/translation/scan',
  TRANSLATION_AR: '/translation/ar',

  // LEARNING
  LEARN: '/pages/learn',
  LEARNING_PATH: '/modules/protected/learning/',

  //CULTURE SOURDE
  DEAF_CULTURE: '/pages/deaf-culture',
  DEAF_CULTURE_ADD_THEME: '/pages/deaf-culture/add-theme',


  //SOCIAL
  SOCIAL: '/pages/social',
  SOCIAL_CLUBS: '/pages/clubs',
  SOCIAL_MEETINGS: '/social/meetings',
  SOCIAL_CHATROOMS: '/modules/protected/user/social/chatrooms',
  SOCIAL_FRIENDS: '/social/friends',
  SOCIAL_GROUPS: '/social/groups',
  SOCIAL_EVENTS: '/social/events',

  //FACILITIES
  FACILITIES: '/pages/facilities/',
  FACILITY_DETAILS: '/pages/facilities/[id]',
  FACILITY_CREATE: '/pages/facilities/create',

  //CLUBS
  CLUBS: '/pages/clubs',
  CLUB_DETAILS: '/pages/clubs/[id]',
  CLUB_CREATE: '/pages/clubs/create',
  CLUB_EDIT: '/pages/clubs/[id]/edit',





  AVATAR: '/avatar',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',

  // Avatar
  AVATAR_CHAT: '/avatar/chat',
  AVATAR_TEACH: '/avatar/teach',
  AVATAR_TRANSLATE: '/avatar/translate',


} as const;