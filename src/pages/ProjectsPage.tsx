import React, { useState } from 'react';
import { FolderGit2, Plus, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState([
    {
      title: 'E-Commerce Microservices Engine',
      description: 'Distributed payment, catalog, and inventory services built with Node.js, Express, and PostgreSQL with Redis caching.',
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'],
      repositoryUrl: 'https://github.com/example/ecommerce-microservices'
    },
    {
      title: 'Real-Time Analytics Dashboard',
      description: 'Interactive analytics dashboard displaying real-time metrics with high rendering efficiency using React and Tailwind CSS.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
      repositoryUrl: 'https://github.com/example/analytics-dashboard'
    }
  ]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tech, setTech] = useState('');
  const [repo, setRepo] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const techArray = tech.split(',').map(t => t.trim()).filter(Boolean);
    setProjects([
      ...projects,
      {
        title,
        description,
        technologies: techArray,
        repositoryUrl: repo
      }
    ]);
    setTitle('');
    setDescription('');
    setTech('');
    setRepo('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-600" />
            Projects & Technical Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase technical repositories and production projects linked to your verified skill evidence.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Project Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Project Title (e.g. Distributed Task Queue)"
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
            />
            <input
              type="text"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              placeholder="Repository URL (e.g. https://github.com/...)"
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
            />
          </div>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Architecture and functional description..."
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
          />
          <input
            type="text"
            value={tech}
            onChange={e => setTech(e.target.value)}
            placeholder="Technologies (comma separated, e.g. React, TypeScript, Docker)"
            className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-600"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 rounded-xl text-slate-600 text-xs font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
            >
              Save Project
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">{proj.title}</h3>
              {proj.repositoryUrl && (
                <a
                  href={proj.repositoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-700 transition"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {proj.technologies.map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
