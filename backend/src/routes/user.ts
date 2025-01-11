import express from 'express';
import { register, login, getAllUsers, updateUser, deleteUser } from '../controllers/user';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// 公开路由
router.post('/register', register);
router.post('/login', login);

// 需要认证的路由
router.get('/users', auth, adminAuth, getAllUsers);
router.put('/users/:id', auth, adminAuth, updateUser);
router.delete('/users/:id', auth, adminAuth, deleteUser);

export default router; 