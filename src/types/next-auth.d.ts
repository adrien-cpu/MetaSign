import { DefaultSession, DefaultUser } from "next-auth";

type UserPreferences = {
  showTiles: boolean;
  showCards: boolean;
  theme?: "light" | "dark" | "blue";
};

type UserRole = "USER" | "ADMIN" | "DEVELOPER" | "PROFESSOR" | "MODERATOR";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      firstName?: string;
      createdAt?: DateTime;
      email?: string;
      phone?: string;
      location?: string;
      rememberMe?: boolean;
      userPreferences?: UserPreferences; // Ajout de userPreferences
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    firstName?: string;
    createdAt?: DateTime;
    email?: string;
    phone?: string;
    location?: string;
    rememberMe?: boolean;
    userPreferences?: UserPreferences; // Ajout de userPreferences
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    firstName?: string;
    createdAt?: DateTime;
    email?: string;
    phone?: string;
    location?: string;
    rememberMe?: boolean;
    userPreferences?: UserPreferences; // Ajout de userPreferences
  }
}
