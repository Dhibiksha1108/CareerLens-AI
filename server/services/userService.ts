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
    if (updates.skills && Array.isArray(updates.skills)) {
      updates.skills = updates.skills.map((s: any) =>
        typeof s === 'string'
          ? { name: s, category: 'Technical', proficiencyLevel: 'intermediate' }
          : s
      );
    }
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }

  static async updateTargetRoles(userId: string, targetRoles: string[], skills?: any[]) {
    const updates: any = { targetRoles };
    if (skills && Array.isArray(skills)) {
      updates.skills = skills.map((s: any) =>
        typeof s === 'string'
          ? { name: s, category: 'Technical', proficiencyLevel: 'intermediate' }
          : s
      );
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
    if (!user) throw new Error('User not found');
    return user;
  }
}


