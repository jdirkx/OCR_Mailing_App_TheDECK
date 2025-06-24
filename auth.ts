// import NextAuth from "next-auth"
// import Google from "next-auth/providers/google"
 
// export const { handlers, auth, signIn, signOut } = NextAuth({
//   providers: [Google],
// })

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_EMAILS = (process.env.AUTHORIZED_EMAILS || "")
  .split(",")
  .map(email => email.trim());

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Restrict to specific email
      if (user.email && ALLOWED_EMAILS.includes(user.email)) {
        return true;
      }
      return false; // Block all others
    }
  },
});