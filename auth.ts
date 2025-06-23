import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
})

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";

// const ALLOWED_EMAIL = "your@specific-email.com"; // Replace with your authorized email

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       // Restrict to specific email
//       if (user?.email === ALLOWED_EMAIL) {
//         return true; // Allow sign-in
//       }
//       return false; // Block all others
//     }
//   },
// });