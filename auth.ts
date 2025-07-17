// src/auth.ts or app/auth.ts or @/auth.ts

import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Comma-separated email allow-list, e.g. "foo@bar.com,alice@bob.com"
const ALLOWED_EMAILS = (process.env.AUTHORIZED_EMAILS || "")
  .split(",")
  .map(email => email.trim())
  .filter(Boolean);

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    // Only allow sign-in for authorized emails
    async signIn({ user }) {
      return !!(user.email && ALLOWED_EMAILS.includes(user.email));
    },
    // Support one-time per-session userName (for audit log)
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }
      if (
        trigger === "update" &&
        typeof session?.userName === "string"
      ) {
        token.userName = session.userName;
      }
      return token;
    },
    async session({ session, token }) {
      session.userName = typeof token.userName === "string" ? token.userName : null;
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
