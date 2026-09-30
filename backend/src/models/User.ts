import mongoose, { Schema, Document } from 'mongoose';

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  gpa?: string;
}

export interface ISkillItem {
  name: string;
  category?: string;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface IUserProfile {
  bio?: string;
  avatar?: string;
  location?: string;
  websiteUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  education: IEducation[];
  targetRoles: string[];
  skills: ISkillItem[];
  profileInfo: IUserProfile;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        gpa: String
      }
    ],
    targetRoles: [{ type: String, trim: true }],
    skills: [
      {
        name: { type: String, required: true },
        category: String,
        proficiencyLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' }
      }
    ],
    profileInfo: {
      bio: String,
      avatar: String,
      location: String,
      websiteUrl: String,
      githubUsername: String,
      linkedinUrl: String
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
