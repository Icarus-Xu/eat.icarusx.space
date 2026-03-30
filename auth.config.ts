import type { NextAuthConfig } from 'next-auth';

const protectedPaths = ['/recommend', '/collect', '/dashboard'];

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = protectedPaths.some((p) =>
        nextUrl.pathname.startsWith(p),
      );
      if (isProtected) {
        return isLoggedIn;
      }
      if (isLoggedIn && nextUrl.pathname === '/') {
        return Response.redirect(new URL('/recommend', nextUrl));
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
