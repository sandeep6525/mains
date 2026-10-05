import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_fetchiq';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ token, email: user.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export const authenticateToken = (req, res, next) => {
  console.log('[FETCHIQ HTTP] authentication check started');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    console.log('[FETCHIQ HTTP] authentication result=FAIL (No token)');
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('[FETCHIQ HTTP] authentication result=FAIL (Invalid token)');
      return res.sendStatus(403);
    }
    console.log('[FETCHIQ HTTP] authentication result=PASS');
    req.user = user;
    next();
  });
};

export default router;
