import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'itid_dev_jwt_secret_key_super_secure_987654321';
const DEFAULT_EMAIL = (process.env.ADMIN_DEFAULT_EMAIL || 'contact@itid-france.com').toLowerCase().trim();
const DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminItid2026!';

export async function handleAdminLogin(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis.' });
    }

    const cleanEmail = String(email).toLowerCase().trim();

    // 1. Recherche dans la table admin_users de MySQL
    try {
      const users: any = await executeQuery('SELECT * FROM admin_users WHERE email = ?', [cleanEmail]);
      if (users && users.length > 0) {
        const user = users[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
          const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            success: true,
            token,
            user: { id: user.id, email: user.email, role: user.role },
          });
        }
      }
    } catch {
      // Si la base n'est pas encore connectée, vérification du compte par défaut .env
    }

    // 2. Vérification du compte administrateur configuré par défaut
    if (cleanEmail === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
      const token = jwt.sign(
        { id: 1, email: DEFAULT_EMAIL, role: 'superadmin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        success: true,
        token,
        user: { id: 1, email: DEFAULT_EMAIL, role: 'superadmin' },
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Identifiants invalides. Vérifiez l\'adresse email et le mot de passe.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function handleGetMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Non authentifié.' });
  }
  return res.json({ success: true, user: req.user });
}
