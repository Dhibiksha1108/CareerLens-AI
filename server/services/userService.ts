import { User } from '../models/User.js';

export class UserService {
  static async getUserProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateUserProfile(userId: string, updates: any) {
    if (updates.password) {
      delete updates.password; // Do not allow password updates through profile endpoint
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateTargetRoles(userId: string, targetRoles: string[], skills?: any[]) {
    const updates: any = { targetRoles };
    if (skills) updates.skills = skills;

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }
}


