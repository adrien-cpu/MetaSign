// src/constants/routes.ts

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

  //PROFIL UTILISATEUR - PASSWORD
  VERIFY_PASSWORD: '/api/user/verify-password', //fait
  UPDATE_PASSWORD: '/api/user/updatePassword', //fait
  FORGOT_PASSWORD: '/api/user/forgotPassword', //fait
  RESET_PASSWORD: '/api/user/resetPassword', //fait

  //CLUBS
  CLUBS: '/pages/clubs',
  CLUB_DETAILS: '/pages/clubs/[id]',
  CLUB_CREATE: '/pages/clubs/create',
  CLUB_EDIT: '/pages/clubs/[id]/edit',

  // Fonctionnalités
  LEARN: '/pages/learn',
  LEARNING_PATH: '/modules/protected/learning/',

  // Social
  SOCIAL: '/pages/social',
  SOCIAL_CLUBS: '/pages/clubs',
  SOCIAL_MEETINGS: '/social/meetings',
  SOCIAL_CHATROOMS: '/modules/protected/user/social/chatrooms',
  SOCIAL_FRIENDS: '/social/friends',
  SOCIAL_GROUPS: '/social/groups',
  SOCIAL_EVENTS: '/social/events',

  AVATAR: '/avatar',
  SEARCH: '/search',
  NOTIFICATIONS: '/notifications',

  // Avatar
  AVATAR_CHAT: '/avatar/chat',
  AVATAR_TEACH: '/avatar/teach',
  AVATAR_TRANSLATE: '/avatar/translate',

  // Traduction
  TRANSLATION: '/pages/translation',
  TRANSLATION_TEXT: '/translation/text-to-sign',
  TRANSLATION_VOICE: '/translation/voice-to-sign',
  TRANSLATION_SCAN: '/translation/scan',
  TRANSLATION_AR: '/translation/ar',
} as const;