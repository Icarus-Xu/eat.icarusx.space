// Copyright (C) 2026 Icarus. All rights reserved.
import type { NextAuthConfig } from 'next-auth';

const protectedPaths = ['/home', '/recommend', '/add', '/map'];

export const authConfig = {
  trustHost: true,
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
      if (nextUrl.pathname === '/') {
        return Response.redirect(
          new URL(isLoggedIn ? '/recommend' : '/login', nextUrl),
        );
      }
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
