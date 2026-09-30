import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { ProjectRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { FolderGit2, Plus, ExternalLink, Code } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await apiClient.get<ProjectRecord[]>('/projects');
      setProjects(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSubmitting(true);
    try {
      const techArray = technologies.split(',').map((t) => t.trim()).filter(Boolean);
      await apiClient.post('/projects', {
        title,
        description,
        technologies: techArray,
        repositoryUrl
      });
      setTitle('');
      setDescription('');
      setTechnologies('');
      setRepositoryUrl('');
      fetchProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FolderGit2 className="w-5 h-5 text-emerald-600" /> Engineering Project Showcase
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Catalog engineering projects with documentation, testing coverage, and repository links.
        </p>
      </div>

      <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Add Engineering Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="CareerLens AI Platform"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technologies (comma-separated)</label>
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="React, Express, TypeScript, MongoDB"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Intelligent career profile evaluation platform..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repository URL</label>
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="https://github.com/user/repo"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || !title}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          {submitting ? 'Adding...' : 'Add Project'}
        </button>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No Engineering Projects Added"
          description="Add your projects above to serve as verified skill evidence."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p._id} className="p-5 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-slate-900">{p.title}</h3>
                  {p.repositoryUrl && (
                    <a href={p.repositoryUrl} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-700">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{p.description || 'No description provided.'}</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {p.technologies?.map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                    <Code className="w-3 h-3 text-emerald-600" /> {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
