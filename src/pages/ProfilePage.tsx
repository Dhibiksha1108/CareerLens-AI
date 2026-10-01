import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { User as UserIcon, Mail, Briefcase, GraduationCap, Award, Check, Sparkles } from 'lucide-react';

interface ProfilePageProps {
  user: any;
  onUserUpdate: (updated: any) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUserUpdate }) => {
  const [name, setName] = useState(user?.name || '');
  const [targetRoles, setTargetRoles] = useState<string>(user?.targetRoles?.join(', ') || 'Full Stack Developer');
  const [bio, setBio] = useState(user?.profileInfo?.bio || 'Passionate software engineer specializing in scalable full-stack web applications.');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTargetRoles(user.targetRoles?.join(', ') || '');
      setBio(user.profileInfo?.bio || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const rolesArray = targetRoles.split(',').map(r => r.trim()).filter(Boolean);
      const res = await apiClient.put('/users/profile', {
        name,
        targetRoles: rolesArray,
        profileInfo: {
          ...user?.profileInfo,
          bio
        }
      });

      if (res.data) {
        onUserUpdate(res.data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err: any) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="w-5 h-5 text-emerald-600" />
          Candidate Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, target career roles, and baseline profile information used for analysis.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Target Career Roles (comma separated)
            </label>
            <input
              type="text"
              value={targetRoles}
              onChange={e => setTargetRoles(e.target.value)}
              placeholder="e.g. Full Stack Developer, Machine Learning Engineer"
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Professional Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {success && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile updated successfully!
              </span>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
              >
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Target Roles Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-emerald-600" />
          Active Target Roles
        </h3>
        <div className="flex flex-wrap gap-2">
          {user?.targetRoles && user.targetRoles.length > 0 ? (
            user.targetRoles.map((role: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"
              >
                {role}
              </span>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">No target roles specified.</p>
          )}
        </div>
      </div>
    </div>
  );
};
