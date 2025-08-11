import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { NextAuthOptions } from "next-auth";

const prisma = new PrismaClient();

type UserRole = "USER" | "ADMIN" | "DEVELOPER" | "PROFESSOR" | "MODERATOR";

type UserPreferences = {
    showTiles: boolean;
    showCards: boolean;
    theme?: "light" | "dark" | "blue";
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "user@example.com" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: {
                        profile: true,
                        userPreferences: true,
                    },
                });

                if (!user || !user.profile || !(await bcrypt.compare(credentials.password, user.password))) {
                    return null;
                }

                let userPreferences: UserPreferences = { showTiles: true, showCards: true };

                if (user.userPreferences) {
                    if (typeof user.userPreferences.preferences === "string") {
                        userPreferences = JSON.parse(user.userPreferences.preferences) as UserPreferences;
                    } else {
                        userPreferences = user.userPreferences.preferences as UserPreferences;
                    }
                }

                console.log("User role from authorize:", user.role); // Ajout du log

                return {
                    id: user.id,
                    email: user.email,
                    role: user.role as UserRole,
                    firstName: user.profile?.firstName || "",
                    location: user.profile?.location || "",
                    createdAt: user.createdAt,
                    phone: user.profile?.phone || "",
                    userPreferences,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24 * 14,
        updateAge: 60 * 60 * 24,
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            },
        },
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.firstName = user.firstName;
                token.createdAt = user.createdAt;
                token.phone = user.phone;
                token.location = user.location;
                token.email = user.email;
                token.userPreferences = user.userPreferences || { showTiles: true, showCards: true };
            }

            if (token.id) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    include: { userPreferences: true },
                });

                if (dbUser) {
                    let userPreferences: UserPreferences = { showTiles: true, showCards: true };

                    if (dbUser.userPreferences) {
                        if (typeof dbUser.userPreferences.preferences === "string") {
                            userPreferences = JSON.parse(dbUser.userPreferences.preferences) as UserPreferences;
                        } else {
                            userPreferences = dbUser.userPreferences.preferences as UserPreferences;
                        }
                    }

                    token.userPreferences = userPreferences;
                } else {
                    console.warn("⚠️ Alerte : Aucun utilisateur trouvé pour le token ID", token.id);
                }
            } else {
                console.warn("⚠️ Aucun utilisateur associé au token.");
            }

            console.log("🆕 Préférences mises à jour dans JWT :", token.userPreferences);
            console.log("User role in JWT:", token.role); // Ajout du log
            return token;
        },

        async session({ session, token }) {
            if (!token.id) {
                console.warn("⚠️ Aucune session trouvée dans le token.");
                return session;
            }

            console.log("User role in session:", token.role); // Ajout du log

            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    role: token.role,
                    firstName: token.firstName,
                    createdAt: token.createdAt,
                    phone: token.phone,
                    location: token.location,
                    email: token.email,
                    userPreferences: token.userPreferences || { showTiles: true, showCards: true },
                },
            };
        },
    },
    debug: true,
    pages: {
        signIn: "/auth/signin",
        error: "/auth/error",
    },
};
