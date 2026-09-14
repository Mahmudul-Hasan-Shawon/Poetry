import { one } from '../db.js';
import { ok, fail, readBody } from '../util.js';
import { bcrypt, signToken, parseCookies, serializeCookie } from '../auth.js';

export const routes = [
  {
    method: 'POST',
    path: '/api/auth/login',
    handler: async (ctx) => {
      const { db, env } = ctx;
      const body = await readBody(ctx.request);
      try {
        const { username, password } = body;
        if (!username || !password) return fail('Username and password required', 400);

        const admin = await one(db, 'SELECT * FROM admin WHERE username = ?', [username]);
        if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
          return fail('Invalid credentials', 401);
        }

        const token = await signToken(
          { id: admin.id, username: admin.username },
          env.JWT_SECRET || 'poetry-archive-d1-secret'
        );

        return ok(
          { user: { id: admin.id, username: admin.username } },
          200,
          serializeCookie('auth_token', token, { httpOnly: true, maxAge: 604800, sameSite: env.COOKIE_SAMESITE || 'lax' })
        );
      } catch {
        return fail('Login failed', 500);
      }
    },
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    handler: async () => {
      return ok({ message: 'Logged out' }, 200, serializeCookie('auth_token', '', { httpOnly: true, maxAge: 0 }));
    },
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    admin: true,
    handler: async (ctx) => {
      return ok({ user: { id: ctx.user.id, username: ctx.user.username } });
    },
  },
];

export default routes;