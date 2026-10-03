import { Request } from 'express';

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export interface IAtsSectionAnalysis {
  name: string;
  found: boolean;
  status: 'optimal' | 'warning' | 'missing';
  feedback: string;
}

export interface IAtsFormattingRisk {
  type: string;
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

export interface IBulletPointAnalysis {
  totalBullets: number;
  strongBullets: number;
  weakBullets: number;
  actionVerbsCount: number;
  metricsCount: number;
  score: number;
  sampleStrengths: string[];
  sampleWeaknesses: string[];
  recommendation: string;
}

export interface IAtsAnalysisResult {
  resumeId: string;
  targetRole: string;
  analyzedAt: string;
  atsScore: number;
  keywordMatchPercentage: number;
  relevantSkillsDetected: string[];
  missingKeywords: Array<{
    keyword: string;
    priority: 'high' | 'medium' | 'low';
    frequencyInRole: number;
    category: string;
  }>;
  sectionsAnalysis: IAtsSectionAnalysis[];
  formattingRisks: IAtsFormattingRisk[];
  readabilityScore: number;
  readabilityLevel: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult';
  contentClarityScore: number;
  contentClaritySummary: string;
  bulletQuality: IBulletPointAnalysis;
  repetitionAnalysis: {
    overusedWords: Array<{ word: string; count: number }>;
    fillerPhrasesFound: string[];
    repetitionScore: number;
  };
  strengths: string[];
  improvementSuggestions: Array<{
    category: 'Keywords' | 'Formatting' | 'Content' | 'Impact' | 'Sections';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    actionableFix: string;
  }>;
}
