// Copyright (C) 2026 Icarus. All rights reserved.
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import postgres from 'postgres';
type User = { id: string; name: string; email: string; password: string };

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export const { auth, signIn, signOut, handlers: { GET, POST } } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const userId = (credentials.userId as string)?.trim();
                if (!userId) return null;

                const email = `${userId}@local`;

                // Find existing user
                const existing = (await sql`
                    SELECT * FROM users WHERE email = ${email} LIMIT 1
                `) as User[];
                if (existing.length > 0) return existing[0];

                // Create new user on first login
                const created = (await sql`
                    INSERT INTO users (name, email, password)
                    VALUES (${userId}, ${email}, '')
                    RETURNING *
                `) as User[];
                return created[0] ?? null;
            },
        }),
    ],
});
