import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { ProjectRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Code2,
  Trash2,
  Pencil,
  AlertCircle,
  CheckCircle2,
  Bookmark,
  Globe,
  GitBranch,
  X,
  Sparkles
} from 'lucide-react';

// Normalize user input URLs so clicking them never navigates relative to app
export function formatExternalUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form & Modal state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [liveDemoUrl, setLiveDemoUrl] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<ProjectRecord[]>('/projects');
      setProjects(res.data || []);
    } catch (err: any) {
      console.error('[ProjectsPage] Failed to fetch projects:', err);
      setError(err.message || 'Failed to load projects from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTechnologies('');
    setRepositoryUrl('');
    setLiveDemoUrl('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const handleOpenEdit = (project: ProjectRecord) => {
    setEditingId(project._id);
    setTitle(project.title);
    setDescription(project.description || '');
    setTechnologies(Array.isArray(project.technologies) ? project.technologies.join(', ') : '');
    setRepositoryUrl(project.repositoryUrl || '');
    setLiveDemoUrl((project as any).liveDemoUrl || project.liveUrl || '');
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    const formattedRepo = formatExternalUrl(repositoryUrl);
    const formattedLive = formatExternalUrl(liveDemoUrl);

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      technologies: techArray,
      repositoryUrl: formattedRepo,
      liveDemoUrl: formattedLive,
      liveUrl: formattedLive
    };

    try {
      if (editingId) {
        await apiClient.put(`/projects/${editingId}`, payload);
        setSuccessMsg('Project updated successfully');
      } else {
        await apiClient.post('/projects', payload);
        setSuccessMsg('Project added successfully and synchronized with Skills & Evidence');
      }

      resetForm();
      await fetchProjects();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('[ProjectsPage] Error saving project:', err);
      setError(err.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${projectTitle}"?`)) {
      return;
    }

    try {
      setError(null);
      await apiClient.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p._id !== projectId));
      setSuccessMsg('Project deleted successfully');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('[ProjectsPage] Failed to delete project:', err);
      setError(err.message || 'Failed to delete project');
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-emerald-600" />
              Projects & Technical Portfolio
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Verified Evidence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Showcase production repositories and portfolio applications. Technologies are automatically integrated with your Skills & Evidence matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/skills"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
            <span>Skills & Evidence</span>
          </Link>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showForm && (
        <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {editingId ? 'Edit Project Entry' : 'Add New Portfolio Project'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Project Name *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Distributed Task Queue & Worker Engine"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">GitHub Repository URL</label>
              <input
                type="text"
                value={repositoryUrl}
                onChange={e => setRepositoryUrl(e.target.value)}
                placeholder="e.g. https://github.com/username/project-repo"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Live Demo URL (Optional)</label>
            <input
              type="text"
              value={liveDemoUrl}
              onChange={e => setLiveDemoUrl(e.target.value)}
              placeholder="e.g. https://my-portfolio-app.vercel.app"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Technologies (Comma-separated)</label>
            <input
              type="text"
              value={technologies}
              onChange={e => setTechnologies(e.target.value)}
              placeholder="e.g. Node.js, Express, React, PostgreSQL, Docker, Redis"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
            <p className="text-[10px] text-slate-400">
              Each technology will automatically be verified against your Skills & Evidence profile.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700">Project Description & Architecture</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Architectural overview, key deliverables, and production trade-offs..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {saving ? 'Saving to Database...' : editingId ? 'Update Project' : 'Save Project'}
            </button>
          </div>
        </form>
      )}

      {/* Content State: Loading, Empty, or List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 font-medium mt-3">Loading projects from MongoDB...</p>
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Projects in Technical Portfolio Yet"
          description="Showcase your production repositories, microservices, and applications here. Added technologies will automatically link with your verified Skills & Evidence profile."
          actionText="Add Your First Project"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map(proj => {
            const repoUrl = formatExternalUrl(proj.repositoryUrl);
            const liveUrl = formatExternalUrl((proj as any).liveDemoUrl || proj.liveUrl);

            return (
              <div
                key={proj._id}
                className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-2xs hover:border-emerald-200 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">
                        {proj.title}
                      </h3>
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Integrated with Skills & Evidence
                      </span>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition"
                        title="Edit Project"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(proj._id, proj.title)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">
                      {proj.description}
                    </p>
                  )}

                  {/* Technology Badges */}
                  {Array.isArray(proj.technologies) && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Links Bar */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
                  {repoUrl ? (
                    <a
                      href={repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-700 transition"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No repo URL</span>
                  )}

                  {liveUrl && (
                    <>
                      <span className="text-slate-300">•</span>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Demo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
