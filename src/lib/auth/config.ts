import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { SignInSchema } from "@/lib/validation/auth-schemas";
import { verifyPassword } from "@/lib/auth/password";
import { authConfig } from "./auth.config";

const { handlers, auth: rawAuth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  basePath: "/api/auth",
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = SignInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, password: true },
        });

        if (!user || !user.password) return null;

        const passwordValid = await verifyPassword(password, user.password);
        if (!passwordValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});

export { handlers, signIn, signOut };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth = (async (...args: any[]) => {
  if (process.env.MOCK_AUTH === "true") {
    return { user: { id: "test-user-id" } };
  }
  // @ts-ignore
  return rawAuth(...args);
}) as typeof rawAuth;
