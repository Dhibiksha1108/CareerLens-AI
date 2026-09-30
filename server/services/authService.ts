import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  targetRoles?: string[];
}

export interface LoginDTO {
  email: string;
  password: string;
}

export class AuthService {
  static async register(dto: RegisterDTO) {
    const existingUser = await User.findOne({ email: dto.email.toLowerCase() });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const user = await User.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      password: hashedPassword,
      targetRoles: dto.targetRoles || ['Full Stack Developer'],
      education: [],
      skills: []
    });

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, token };
  }

  static async login(dto: LoginDTO) {
    const user = await User.findOne({ email: dto.email.toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({ userId: user._id.toString(), email: user.email });

    const userObj = user.toObject();
    delete (userObj as any).password;

    return { user: userObj, token };
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}


