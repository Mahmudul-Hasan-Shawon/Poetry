import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username);

    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin);
    const sameSite = process.env.COOKIE_SAMESITE || 'lax';
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
      sameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ user: { id: admin.id, username: admin.username } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

router.post('/change-password', authMiddleware, (req, res) => {
  try {
    const { current_password, new_password } = req.body || {};
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current and new password required' });
    }
    if (typeof new_password !== 'string' || new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.user.id);

    if (!admin || !bcrypt.compareSync(current_password, admin.password_hash)) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hash = bcrypt.hashSync(new_password, 10);
    db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').run(hash, admin.id);
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ error: 'Password change failed' });
  }
});

export default router;
