import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import type { ResumeRecord } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { FileText, Upload, Trash2, AlertCircle, CheckCircle2, FileUp, Copy, Check, Eye } from 'lucide-react';

export const ResumePage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Active Preview State
  const [activeResume, setActiveResume] = useState<ResumeRecord | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchResumes = async () => {
    try {
      const res = await apiClient.get<ResumeRecord[]>('/resume/me');
      const data = res.data || [];
      setResumes(data);
      if (data.length > 0 && !activeResume) {
        setActiveResume(data[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!['.pdf', '.docx'].includes(ext)) {
        setErrorMessage('Invalid file format. Only PDF (.pdf) and Word (.docx) documents are supported.');
        setSelectedFile(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size exceeds maximum allowed limit of 10MB.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiClient.uploadFile<ResumeRecord>('/resume/upload', formData);

      if (res.data) {
        setSuccessMessage('Resume uploaded and text extracted successfully!');
        setSelectedFile(null);
        setActiveResume(res.data);
        await fetchResumes();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and extract text from resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/resume/${id}`);
      if (activeResume?._id === id) {
        setActiveResume(null);
      }
      await fetchResumes();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCopyText = () => {
    if (activeResume?.extractedText) {
      navigator.clipboard.writeText(activeResume.extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> Resume Upload & Text Extraction
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Upload PDF or DOCX resume documents for automated text extraction and profile indexing.
        </p>
      </div>

      {/* Upload Box */}
      <form onSubmit={handleUploadSubmit} className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Upload Resume File (PDF / DOCX)</h2>

        {errorMessage && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-all group">
          <input
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="hidden"
            id="resume-file-input"
          />
          <label htmlFor="resume-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-105 flex items-center justify-center transition-transform">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-800 hover:text-emerald-700">
                Click to browse resume file
              </span>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Supports PDF (.pdf) and Word (.docx) up to 10MB
              </p>
            </div>
          </label>
        </div>

        {selectedFile && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                {selectedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 truncate max-w-xs">{selectedFile.name}</p>
                <p className="text-[11px] text-slate-400 font-medium">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {uploading ? 'Extracting Text...' : 'Upload & Extract Text'}
            </button>
          </div>
        )}
      </form>

      {/* List & Extracted Text Preview */}
      {loading ? (
        <LoadingSpinner />
      ) : resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Uploaded Yet"
          description="Upload a PDF or DOCX resume document above to extract and preview its text."
          actionText="Select Resume File →"
          onAction={() => document.getElementById('resume-file-input')?.click()}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Uploaded Resumes Sidebar */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Uploaded Resumes</h2>
            {resumes.map((res) => {
              const isActive = activeResume?._id === res._id;
              return (
                <div
                  key={res._id}
                  onClick={() => setActiveResume(res)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isActive
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200/60 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{res.fileInfo.originalName}</h3>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-medium">
                      <span>{formatFileSize(res.fileInfo.size)}</span>
                      <span>•</span>
                      <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveResume(res);
                      }}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-white"
                      title="Preview Text"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(res._id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extracted Text Preview Panel */}
          <div className="lg:col-span-2">
            {activeResume ? (
              <div className="p-6 rounded-2xl bg-white border border-slate-200/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Extracted Resume Text Preview</h2>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {activeResume.fileInfo.originalName} • {activeResume.extractedText?.length || 0} characters
                    </p>
                  </div>

                  <button
                    onClick={handleCopyText}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-700 max-h-[420px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {activeResume.extractedText || 'No text extracted from document.'}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200/60 text-slate-400 text-xs font-medium">
                Select a resume on the left to preview extracted plain text.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
