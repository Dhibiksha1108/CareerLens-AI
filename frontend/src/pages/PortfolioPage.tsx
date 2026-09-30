import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { Globe, Send } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPortfolios = async () => {
    try {
      const res = await apiClient.get('/portfolio/me');
      setPortfolios(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!portfolioUrl) return;
    setSubmitting(true);
    try {
      await apiClient.post('/portfolio/analyze', { portfolioUrl });
      setPortfolioUrl('');
      fetchPortfolios();
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
          <Globe className="w-5 h-5 text-emerald-600" /> Portfolio Website Evaluator
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingest portfolio URLs for content scraping, section parsing, and project discovery.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Submit Portfolio Site</h2>
        <div className="flex gap-3">
          <input
            type="url"
            required
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://dhibiksha.dev"
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting || !portfolioUrl}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Analyzing...' : 'Analyze Site'}
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : portfolios.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No Portfolio URL Added"
          description="Submit your portfolio website link above to start extracting projects and technical evidence."
        />
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">Analyzed Portfolio URLs</h2>
          {portfolios.map((p) => (
            <div key={p._id} className="p-4 rounded-2xl bg-white border border-slate-200/60 shadow-2xs flex items-center justify-between">
              <div>
                <a href={p.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 hover:underline">
                  {p.portfolioUrl}
                </a>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Status: <span className="uppercase text-emerald-700 font-bold">{p.analysisStatus}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
