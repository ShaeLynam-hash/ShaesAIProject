import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers = [
  Credentials({
    async authorize(credentials) {
      const { email, password } = credentials as { email: string; password: string };
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, email: user.email, name: user.name };
    },
  }),
];

// Only add Google if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const Google = require("next-auth/providers/google").default;
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  session: { strategy: "jwt", maxAge: 400 * 24 * 60 * 60 }, // ~13 months (browser cookie max)
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) session.user.id = token.id as string;
      return session;
    },
  },
});
