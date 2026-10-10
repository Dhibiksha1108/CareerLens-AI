import { Response } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { AuthRequest } from '../types/index.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export function sanitizeUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(url?: string): boolean {
  if (!url || !url.trim()) return true;
  try {
    const u = new URL(sanitizeUrl(url));
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Synchronize project technologies with the candidate's SkillEvidence documents
 */
async function syncProjectWithSkillEvidence(
  userId: string,
  projectId: mongoose.Types.ObjectId,
  projectTitle: string,
  projectDescription: string,
  technologies: string[],
  repositoryUrl?: string,
  previousTechnologies: string[] = []
) {
  try {
    // 1. For each current technology in project, link to SkillEvidence
    for (const tech of technologies) {
      const cleanTech = tech.trim();
      if (!cleanTech) continue;

      let skillDoc = await SkillEvidence.findOne({
        userId,
        skill: { $regex: new RegExp(`^${cleanTech}$`, 'i') }
      });

      if (!skillDoc) {
        skillDoc = new SkillEvidence({
          userId,
          skill: cleanTech,
          category: 'Technical',
          confidence: 0.6,
          proficiencyLevel: 'intermediate',
          evidenceStrength: 'low',
          projectEvidence: [],
          githubEvidence: [],
          resumeEvidence: []
        });
      }

      // Upsert projectEvidence item
      const projEvidenceList = skillDoc.projectEvidence || [];
      const existingIdx = projEvidenceList.findIndex(
        pe => pe.projectId && pe.projectId.toString() === projectId.toString()
      );

      if (existingIdx !== -1) {
        projEvidenceList[existingIdx].projectTitle = projectTitle;
        projEvidenceList[existingIdx].usageDescription = projectDescription || `Production implementation with ${cleanTech}`;
      } else {
        projEvidenceList.push({
          projectId,
          projectTitle,
          usageDescription: projectDescription || `Practical project demonstrating ${cleanTech}`
        });
      }
      skillDoc.projectEvidence = projEvidenceList;

      // Link GitHub evidence if repository URL is present
      if (repositoryUrl) {
        const repoList = skillDoc.githubEvidence || [];
        const repoName = repositoryUrl.split('/').slice(-2).join('/') || projectTitle;
        const hasRepo = repoList.some(g => g.repoName?.toLowerCase() === repoName.toLowerCase());
        if (!hasRepo) {
          repoList.push({
            repoName,
            language: cleanTech,
            commitCount: 15
          });
          skillDoc.githubEvidence = repoList;
        }
      }

      // Recalculate source scores
      const resumeCount = skillDoc.resumeEvidence?.length || 0;
      const githubCount = skillDoc.githubEvidence?.length || 0;
      const projectCount = skillDoc.projectEvidence?.length || 0;
      const totalSources = resumeCount + githubCount + projectCount;

      if (totalSources >= 3) {
        skillDoc.evidenceStrength = 'verified';
      } else if (totalSources >= 2) {
        skillDoc.evidenceStrength = 'high';
      } else if (totalSources >= 1) {
        skillDoc.evidenceStrength = 'medium';
      } else {
        skillDoc.evidenceStrength = 'low';
      }

      skillDoc.confidence = Math.min(0.55 + totalSources * 0.15, 0.98);
      await skillDoc.save();
    }

    // 2. Remove project reference from technologies that were unlinked
    const removedTechs = previousTechnologies.filter(
      pt => !technologies.some(t => t.toLowerCase() === pt.toLowerCase())
    );

    for (const oldTech of removedTechs) {
      const skillDoc = await SkillEvidence.findOne({
        userId,
        skill: { $regex: new RegExp(`^${oldTech.trim()}$`, 'i') }
      });

      if (skillDoc && skillDoc.projectEvidence) {
        skillDoc.projectEvidence = skillDoc.projectEvidence.filter(
          pe => !pe.projectId || pe.projectId.toString() !== projectId.toString()
        );

        const resumeCount = skillDoc.resumeEvidence?.length || 0;
        const githubCount = skillDoc.githubEvidence?.length || 0;
        const projectCount = skillDoc.projectEvidence?.length || 0;
        const totalSources = resumeCount + githubCount + projectCount;

        if (totalSources >= 3) skillDoc.evidenceStrength = 'verified';
        else if (totalSources >= 2) skillDoc.evidenceStrength = 'high';
        else if (totalSources >= 1) skillDoc.evidenceStrength = 'medium';
        else skillDoc.evidenceStrength = 'low';

        skillDoc.confidence = Math.min(0.5 + totalSources * 0.15, 0.98);
        await skillDoc.save();
      }
    }
  } catch (err) {
    console.error('[syncProjectWithSkillEvidence] Error:', err);
  }
}

/**
 * Remove project reference from all SkillEvidence when a project is deleted
 */
async function removeProjectFromSkillEvidence(userId: string, projectId: mongoose.Types.ObjectId) {
  try {
    const affectedDocs = await SkillEvidence.find({
      userId,
      'projectEvidence.projectId': projectId
    });

    for (const doc of affectedDocs) {
      doc.projectEvidence = (doc.projectEvidence || []).filter(
        pe => !pe.projectId || pe.projectId.toString() !== projectId.toString()
      );

      const resumeCount = doc.resumeEvidence?.length || 0;
      const githubCount = doc.githubEvidence?.length || 0;
      const projectCount = doc.projectEvidence?.length || 0;
      const totalSources = resumeCount + githubCount + projectCount;

      if (totalSources >= 3) doc.evidenceStrength = 'verified';
      else if (totalSources >= 2) doc.evidenceStrength = 'high';
      else if (totalSources >= 1) doc.evidenceStrength = 'medium';
      else doc.evidenceStrength = 'low';

      doc.confidence = Math.min(0.5 + totalSources * 0.15, 0.98);
      await doc.save();
    }
  } catch (err) {
    console.error('[removeProjectFromSkillEvidence] Error:', err);
  }
}

export class ProjectController {
  static async getProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projects = await Project.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
      sendSuccess(res, 'Projects retrieved successfully', projects);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve projects', null, 500);
    }
  }

  static async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, technologies, repositoryUrl, liveDemoUrl, liveUrl } = req.body;

      if (!title || !title.trim()) {
        sendError(res, 'Project title is required', null, 400);
        return;
      }

      const cleanRepo = sanitizeUrl(repositoryUrl);
      const cleanLive = sanitizeUrl(liveDemoUrl || liveUrl);

      if (repositoryUrl && !isValidUrl(repositoryUrl)) {
        sendError(res, 'Invalid repository URL format', null, 400);
        return;
      }
      if ((liveDemoUrl || liveUrl) && !isValidUrl(liveDemoUrl || liveUrl)) {
        sendError(res, 'Invalid live demo URL format', null, 400);
        return;
      }

      let parsedTechs: string[] = [];
      if (Array.isArray(technologies)) {
        parsedTechs = technologies.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof technologies === 'string') {
        parsedTechs = technologies.split(',').map(t => t.trim()).filter(Boolean);
      }

      const newProject = await Project.create({
        userId: req.user!.userId,
        title: title.trim(),
        description: (description || '').trim(),
        technologies: parsedTechs,
        repositoryUrl: cleanRepo,
        liveDemoUrl: cleanLive,
        liveUrl: cleanLive
      });

      // Synchronize skills evidence
      await syncProjectWithSkillEvidence(
        req.user!.userId,
        newProject._id as mongoose.Types.ObjectId,
        newProject.title,
        newProject.description || '',
        parsedTechs,
        cleanRepo
      );

      sendSuccess(res, 'Project created successfully', newProject, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create project', null, 500);
    }
  }

  static async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, technologies, repositoryUrl, liveDemoUrl, liveUrl } = req.body;

      if (!title || !title.trim()) {
        sendError(res, 'Project title is required', null, 400);
        return;
      }

      const cleanRepo = sanitizeUrl(repositoryUrl);
      const cleanLive = sanitizeUrl(liveDemoUrl || liveUrl);

      if (repositoryUrl && !isValidUrl(repositoryUrl)) {
        sendError(res, 'Invalid repository URL format', null, 400);
        return;
      }
      if ((liveDemoUrl || liveUrl) && !isValidUrl(liveDemoUrl || liveUrl)) {
        sendError(res, 'Invalid live demo URL format', null, 400);
        return;
      }

      const existingProject = await Project.findOne({ _id: id, userId: req.user!.userId });
      if (!existingProject) {
        sendError(res, 'Project not found', null, 404);
        return;
      }

      const prevTechs = existingProject.technologies || [];

      let parsedTechs: string[] = [];
      if (Array.isArray(technologies)) {
        parsedTechs = technologies.map(t => String(t).trim()).filter(Boolean);
      } else if (typeof technologies === 'string') {
        parsedTechs = technologies.split(',').map(t => t.trim()).filter(Boolean);
      }

      existingProject.title = title.trim();
      existingProject.description = (description || '').trim();
      existingProject.technologies = parsedTechs;
      existingProject.repositoryUrl = cleanRepo;
      existingProject.liveDemoUrl = cleanLive;
      existingProject.liveUrl = cleanLive;
      await existingProject.save();

      // Synchronize skills evidence
      await syncProjectWithSkillEvidence(
        req.user!.userId,
        existingProject._id as mongoose.Types.ObjectId,
        existingProject.title,
        existingProject.description || '',
        parsedTechs,
        cleanRepo,
        prevTechs
      );

      sendSuccess(res, 'Project updated successfully', existingProject);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update project', null, 500);
    }
  }

  static async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const project = await Project.findOneAndDelete({ _id: id, userId: req.user!.userId });
      if (!project) {
        sendError(res, 'Project not found', null, 404);
        return;
      }

      // Cleanup project from SkillEvidence
      await removeProjectFromSkillEvidence(req.user!.userId, project._id as mongoose.Types.ObjectId);

      sendSuccess(res, 'Project deleted successfully', { deletedId: id });
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete project', null, 500);
    }
  }
}
