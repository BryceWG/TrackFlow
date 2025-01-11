import bcrypt from 'bcryptjs';
import { User } from '../models/user';

export const setupAdmin = async () => {
  try {
    // 检查是否已存在管理员用户
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      // 创建默认管理员用户
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('默认管理员用户创建成功');
    }
  } catch (error) {
    console.error('创建默认管理员用户失败:', error);
  }
}; 