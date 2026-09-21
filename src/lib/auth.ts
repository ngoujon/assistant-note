import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const smtpConfigured = Boolean(process.env.EMAIL_SERVER_HOST);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Nodemailer({
      from: process.env.EMAIL_FROM,
      // The provider requires a truthy `server` even though our
      // sendVerificationRequest override below never uses it when SMTP isn't
      // configured (it just logs the link instead of sending an email).
      server: smtpConfigured
        ? {
            host: process.env.EMAIL_SERVER_HOST,
            port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
            auth: {
              user: process.env.EMAIL_SERVER_USER,
              pass: process.env.EMAIL_SERVER_PASSWORD,
            },
          }
        : "smtp://unused:unused@localhost:1025",
      // No SMTP configured in local dev: print the magic link instead of
      // sending a real email, so sign-in stays end-to-end testable.
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!smtpConfigured) {
          console.log(
            `\n[auth] Lien de connexion pour ${identifier} :\n${url}\n`,
          );
          return;
        }
        const { createTransport } = await import("nodemailer");
        const transport = createTransport(provider.server);
        await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: "Connexion à votre espace de travail",
          text: `Cliquez sur ce lien pour vous connecter : ${url}`,
          html: `<p>Cliquez sur ce lien pour vous connecter : <a href="${url}">${url}</a></p>`,
        });
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
