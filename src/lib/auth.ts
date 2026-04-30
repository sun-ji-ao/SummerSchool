import { compare } from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) {
          return null;
        }
        const admin = await db.admin.findUnique({
          where: { email },
        });
        if (!admin) {
          return null;
        }
        const ok = await compare(password, admin.hashedPassword);
        if (!ok) {
          return null;
        }
        return {
          id: String(admin.id),
          email: admin.email,
          name: admin.name ?? admin.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
