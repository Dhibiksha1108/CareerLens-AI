import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { User } from '../types';
import { User as UserIcon, Mail, Target, Save, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, FolderGit2, Link as LinkIcon, Globe, MapPin } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [targetRoles, setTargetRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get<User>('/users/profile');
        if (res.data) {
          setProfile(res.data);
          setName(res.data.name || '');
          setBio(res.data.profileInfo?.bio || '');
          setLocation(res.data.profileInfo?.location || '');
          setGithubUsername(res.data.profileInfo?.githubUsername || '');
          setLinkedinUrl(res.data.profileInfo?.linkedinUrl || '');
          setWebsiteUrl(res.data.profileInfo?.websiteUrl || '');
          setTargetRoles(res.data.targetRoles || []);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await apiClient.put<User>('/users/profile', {
        name,
        profileInfo: { bio, location, githubUsername, linkedinUrl, websiteUrl }
      });
      if (res.data) {
        setProfile(res.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddRole = (role: string) => {
    if (role && !targetRoles.includes(role)) {
      setTargetRoles([...targetRoles, role]);
    }
  };

  const handleRemoveRole = (role: string) => {
    setTargetRoles(targetRoles.filter(r => r !== role));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-600" /> My Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal info and target career roles.</p>
      </div>

      {/* Profile Header Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center text-xl font-extrabold shrink-0">
            {name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold text-slate-900 truncate">{name || 'User'}</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {profile?.email || ''}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {targetRoles.map(role => (
                <span key={role} className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Target className="w-3 h-3" /> {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-5">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        <h2 className="text-sm font-bold text-slate-900">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email (read-only)</label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A brief summary about yourself..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" /> GitHub Username
            </label>
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="your-github-username"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Website
            </label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-portfolio.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Target Roles */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-slate-400" /> Target Career Roles
          </label>
          <div className="flex flex-wrap gap-1.5">
            {targetRoles.map(role => (
              <span
                key={role}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg"
              >
                {role}
                <button
                  type="button"
                  onClick={() => handleRemoveRole(role)}
                  className="text-emerald-400 hover:text-rose-600 transition-colors text-sm leading-none"
                >
                  x
                </button>
              </span>
            ))}
          </div>
          <RoleInput onAdd={handleAddRole} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>

      {/* Skills Summary */}
      {profile?.skills && profile.skills.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Detected Skills ({profile.skills.length})</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg"
              >
                {skill.name}
                {skill.proficiencyLevel && (
                  <span className="text-slate-400 ml-1 capitalize">• {skill.proficiencyLevel}</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RoleInput: React.FC<{ onAdd: (role: string) => void }> = ({ onAdd }) => {
  const [value, setValue] = useState('');
  const presetRoles = [
    'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'ML Engineer'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim());
      setValue('');
    }
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a target role..."
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
        >
          Add
        </button>
      </form>
      <div className="flex flex-wrap gap-1.5">
        {presetRoles.map(role => (
          <button
            key={role}
            type="button"
            onClick={() => onAdd(role)}
            className="text-[10px] font-medium text-slate-500 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 px-2 py-0.5 rounded-md transition-colors"
          >
            + {role}
          </button>
        ))}
      </div>
    </div>
  );
};
