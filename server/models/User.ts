import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSkill {
  name: string;
  category?: string;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startYear?: number;
  endYear?: number;
  gpa?: string;
}

export interface IProfileInfo {
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
  password: string;
  education: IEducation[];
  targetRoles: string[];
  skills: IUserSkill[];
  profileInfo?: IProfileInfo;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        fieldOfStudy: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        gpa: { type: String }
      }
    ],
    targetRoles: { type: [String], default: ['Full Stack Developer'] },
    skills: [
      {
        name: { type: String, required: true },
        category: { type: String, default: 'Technical' },
        proficiencyLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate'
        }
      }
    ],
    profileInfo: {
      bio: { type: String, default: '' },
      avatar: { type: String },
      location: { type: String },
      websiteUrl: { type: String },
      githubUsername: { type: String },
      linkedinUrl: { type: String }
    }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);
