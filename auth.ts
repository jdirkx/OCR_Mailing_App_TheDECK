// src/auth.ts / app/auth.ts
import NextAuth, { type NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Load allowlisted emails from environment
const ALLOWED_EMAILS = (process.env.AUTHORIZED_EMAILS || "")
  .split(",")
  .map((email) => email.trim())
  .filter(Boolean);

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
    updateAge: 0, // Disable rolling sessions
  },

  jwt: {
    maxAge: 30 * 60, // Match session duration
  },

  callbacks: {
    // Only allow sign-in for authorized emails
    async signIn({ user }) {
      return !!(user.email && ALLOWED_EMAILS.includes(user.email));
    },

    // Add custom field (userName) to token
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
      }

      // When user identifies with a userName (handled manually)
      if (trigger === "update" && typeof session?.userName === "string") {
        token.userName = session.userName;
      }

      return token;
    },

    // Make userName available in client-side session
    async session({ session, token }) {
      if (typeof token?.userName === "string") {
        session.userName = token.userName;
      } else {
        session.userName = null;
      }

      return session;
    },
  },

  // Required in NextAuth v5 for securing the JWT
  secret: process.env.AUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
