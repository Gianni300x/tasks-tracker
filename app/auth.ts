import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const CLASSROOM_SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
  "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
].join(" ");

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: `openid email profile ${CLASSROOM_SCOPES}`,
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Al hacer login guardamos los tokens en el JWT cifrado
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;
        token.expires_at = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      // Exponemos el access_token a los server components / route handlers
      session.access_token = token.access_token as string;
      return session;
    },
  },
});
