import mongoose from 'mongoose';
import { JobAnalysis, IJobAnalysis } from '../models/JobAnalysis.js';
import { Resume, IResume } from '../models/Resume.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { User } from '../models/User.js';
import {
  TextPreprocessor,
  TfidfModel,
  SimilarityEngine,
  SKILL_TAXONOMY,
  SkillCategory,
  ExtractedSkill
} from './nlpAnalysisService.js';

export interface SkillRelationship {
  jobSkill: string;
  candidateSkill: string;
  category: string;
  relationType: string;
  reason: string;
}

// Canonical skill semantic relationship graph
const SKILL_RELATIONSHIPS: Record<string, Array<{ candidateSkill: string; relationType: string; reason: string }>> = {
  'Next.js': [
    { candidateSkill: 'React', relationType: 'Framework ecosystem', reason: 'Next.js is built on React; deep React fundamentals enable rapid adoption of Next.js SSR/SSG.' }
  ],
  'React': [
    { candidateSkill: 'JavaScript', relationType: 'Core language foundation', reason: 'Strong JavaScript expertise provides immediate proficiency for React component patterns.' },
    { candidateSkill: 'TypeScript', relationType: 'Typed superset', reason: 'TypeScript frontend experience directly translates to React development.' }
  ],
  'TypeScript': [
    { candidateSkill: 'JavaScript', relationType: 'Syntactic basis', reason: 'Proficiency in JavaScript provides the core semantics for typed TypeScript workflows.' }
  ],
  'JavaScript': [
    { candidateSkill: 'TypeScript', relationType: 'Strict superset', reason: 'Mastery of TypeScript guarantees thorough understanding of ECMAScript/JavaScript.' }
  ],
  'Express': [
    { candidateSkill: 'Node.js', relationType: 'Runtime runtime foundation', reason: 'Express is the primary HTTP framework for Node.js backend services.' }
  ],
  'FastAPI': [
    { candidateSkill: 'Python', relationType: 'Language competency', reason: 'Core Python mastery allows swift onboarding to FastAPI async endpoints and Pydantic models.' }
  ],
  'Django': [
    { candidateSkill: 'Python', relationType: 'Language competency', reason: 'Strong Python background facilitates understanding of Django ORM and MVC architecture.' }
  ],
  'PostgreSQL': [
    { candidateSkill: 'SQL', relationType: 'Standard relational language', reason: 'Knowledge of standard SQL queries and relational models applies directly to PostgreSQL.' },
    { candidateSkill: 'MySQL', relationType: 'RDBMS equivalence', reason: 'MySQL and PostgreSQL share core relational ACID paradigms and indexing techniques.' }
  ],
  'MySQL': [
    { candidateSkill: 'SQL', relationType: 'Standard relational language', reason: 'Knowledge of standard SQL queries and relational models applies directly to MySQL.' },
    { candidateSkill: 'PostgreSQL', relationType: 'RDBMS equivalence', reason: 'Relational database architecture principles translate seamlessly to MySQL.' }
  ],
  'MongoDB': [
    { candidateSkill: 'Database', relationType: 'General database knowledge', reason: 'Database querying and indexing concepts translate to Document-store collections.' }
  ],
  'Kubernetes': [
    { candidateSkill: 'Docker', relationType: 'Containerization foundation', reason: 'Docker containerization is the essential precursor and core runtime unit of Kubernetes clusters.' }
  ],
  'Docker': [
    { candidateSkill: 'Linux', relationType: 'Host OS environment', reason: 'Strong Linux systems skills translate directly into container process management and Dockerfiles.' }
  ],
  'AWS': [
    { candidateSkill: 'Cloud/Tools', relationType: 'Cloud infrastructure', reason: 'Cloud operational knowledge translates directly to AWS services (EC2, S3, IAM).' },
    { candidateSkill: 'Docker', relationType: 'Container deployment', reason: 'Containerized architectures are standard deployable units across AWS ECS and EKS.' }
  ],
  'Tailwind CSS': [
    { candidateSkill: 'CSS3', relationType: 'Styling standard', reason: 'Tailwind utility classes are derived directly from CSS box model and flexbox/grid specifications.' }
  ],
  'Scikit-Learn': [
    { candidateSkill: 'Python', relationType: 'Language basis', reason: 'Python data science stack expertise facilitates Scikit-Learn model training.' },
    { candidateSkill: 'Data Analysis', relationType: 'Statistical foundation', reason: 'Data preprocessing and exploratory analysis skills are direct prerequisites for Scikit-Learn.' }
  ],
  'PyTorch': [
    { candidateSkill: 'Python', relationType: 'Language basis', reason: 'Strong Python programming is key to PyTorch dynamic computational graph construction.' },
    { candidateSkill: 'Machine Learning', relationType: 'Theoretical domain', reason: 'Machine learning fundamentals directly support deep learning model design in PyTorch.' }
  ],
  'TensorFlow': [
    { candidateSkill: 'Python', relationType: 'Language basis', reason: 'Python background enables utilizing Keras and TensorFlow computation graphs.' },
    { candidateSkill: 'Machine Learning', relationType: 'Theoretical domain', reason: 'Understands backpropagation, gradients, and model architectures.' }
  ]
};

export class JobMatchingService {
  /**
   * Main entrypoint to match a job description against a user's analyzed resume
   */
  static async matchJobWithResume(
    userId: string,
    params: {
      jobTitle: string;
      company?: string;
      jobDescription: string;
      resumeId?: string;
    }
  ): Promise<IJobAnalysis> {
    const { jobTitle, company, jobDescription, resumeId } = params;

    if (!jobDescription || jobDescription.trim().length < 15) {
      throw new Error('Please provide a substantive job description (at least 15 characters).');
    }

    // 1. Fetch Candidate's Resume Analysis (Phase 2B)
    let resume: IResume | null = null;
    if (resumeId && mongoose.Types.ObjectId.isValid(resumeId)) {
      resume = await Resume.findOne({ _id: resumeId, userId });
    }

    if (!resume) {
      // Find latest completed analyzed resume
      resume = await Resume.findOne({ userId, analysisStatus: 'completed' }).sort({ createdAt: -1 });
    }

    if (!resume) {
      // Find any resume uploaded by user
      resume = await Resume.findOne({ userId }).sort({ createdAt: -1 });
    }

    // Also get verified skills from SkillEvidence collection
    const skillEvidences = await SkillEvidence.find({ userId: new mongoose.Types.ObjectId(userId) });
    const user = await User.findById(userId);

    // Candidate skills map: canonical name lowercase -> skill metadata
    const candidateSkillMap = new Map<string, {
      name: string;
      category: string;
      proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
      evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
      snippets: string[];
      tfidfScore?: number;
      cosineSimilarity?: number;
    }>();

    // Populate from Resume analysisResult if present
    if (resume?.analysisResult?.extractedSkills) {
      for (const skill of resume.analysisResult.extractedSkills) {
        candidateSkillMap.set(skill.name.toLowerCase(), {
          name: skill.name,
          category: skill.category,
          proficiencyLevel: skill.proficiencyLevel,
          evidenceStrength: skill.evidenceStrength,
          snippets: skill.snippets || [],
          tfidfScore: skill.tfidfScore,
          cosineSimilarity: skill.cosineSimilarity
        });
      }
    }

    // Augment with SkillEvidence records
    for (const ev of skillEvidences) {
      const lower = ev.skill.toLowerCase();
      const existing = candidateSkillMap.get(lower);
      const snippets = ev.resumeEvidence?.map((r: any) => r.textSnippet).filter(Boolean) || [];
      if (existing) {
        if (snippets.length > 0 && existing.snippets.length === 0) {
          existing.snippets = snippets;
        }
        if (ev.evidenceStrength === 'verified' || ev.evidenceStrength === 'high') {
          existing.evidenceStrength = ev.evidenceStrength;
        }
      } else {
        candidateSkillMap.set(lower, {
          name: ev.skill,
          category: ev.category || 'Technical',
          proficiencyLevel: ev.proficiencyLevel || 'intermediate',
          evidenceStrength: ev.evidenceStrength || 'medium',
          snippets,
          tfidfScore: 0.5,
          cosineSimilarity: 0.6
        });
      }
    }

    // Augment with User.skills
    if (user?.skills) {
      for (const s of user.skills) {
        const lower = s.name.toLowerCase();
        if (!candidateSkillMap.has(lower)) {
          candidateSkillMap.set(lower, {
            name: s.name,
            category: s.category || 'Technical',
            proficiencyLevel: (s.proficiencyLevel as any) || 'intermediate',
            evidenceStrength: 'medium',
            snippets: [],
            tfidfScore: 0.4,
            cosineSimilarity: 0.5
          });
        }
      }
    }

    // 2. Clean and Normalize Job Description
    const cleanedJobText = TextPreprocessor.clean(jobDescription);
    const jobSentences = TextPreprocessor.splitSentences(jobDescription);
    const jobTokens = TextPreprocessor.tokenize(cleanedJobText);

    // 3. Extract Skills from Job Description
    const lowerJobText = ' ' + cleanedJobText.toLowerCase() + ' ';
    const extractedJobSkillsMap = new Map<string, {
      name: string;
      category: SkillCategory;
      importance: 'required' | 'preferred';
      frequency: number;
    }>();

    for (const skillDef of SKILL_TAXONOMY) {
      let found = false;
      let freq = 0;
      let isPreferred = false;

      for (const alias of skillDef.aliases) {
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(?<=[^a-z0-9#+]|^)${escaped}(?=[^a-z0-9#+]|$)`, 'gi');
        const matches = lowerJobText.match(pattern);

        if (matches && matches.length > 0) {
          found = true;
          freq += matches.length;

          // Check if mention is under preferred/nice-to-have context
          for (const sentence of jobSentences) {
            if (new RegExp(escaped, 'i').test(sentence)) {
              const lowerSentence = sentence.toLowerCase();
              if (
                lowerSentence.includes('preferred') ||
                lowerSentence.includes('nice to have') ||
                lowerSentence.includes('plus') ||
                lowerSentence.includes('bonus') ||
                lowerSentence.includes('desired') ||
                lowerSentence.includes('ideal candidate')
              ) {
                isPreferred = true;
              }
            }
          }
        }
      }

      if (found) {
        extractedJobSkillsMap.set(skillDef.canonicalName, {
          name: skillDef.canonicalName,
          category: skillDef.category,
          importance: isPreferred ? 'preferred' : 'required',
          frequency: freq
        });
      }
    }

    const extractedJobSkills = Array.from(extractedJobSkillsMap.values());

    // 4. Categorize Skills: Matched, Related/Partial, and Missing
    const matchedSkillsDetails: Array<{
      skill: string;
      category: string;
      proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
      evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
      snippets: string[];
      tfidfScore?: number;
      cosineSimilarity?: number;
    }> = [];

    const partialSkills: Array<{
      jobSkill: string;
      candidateSkill: string;
      category: string;
      relationType: string;
      reason: string;
    }> = [];

    const missingSkills: Array<{
      name: string;
      category: string;
      importance: 'required' | 'preferred';
    }> = [];

    // Helper: Find resume snippets if candidate skill lacks stored snippets
    const resumeRawText = resume?.extractedText || '';
    const resumeSentences = TextPreprocessor.splitSentences(resumeRawText);

    for (const jobSkill of extractedJobSkills) {
      const lowerJobSkill = jobSkill.name.toLowerCase();

      // Check direct candidate match
      if (candidateSkillMap.has(lowerJobSkill)) {
        const candidateSkill = candidateSkillMap.get(lowerJobSkill)!;
        let snippets = candidateSkill.snippets || [];

        // If candidate skill has no snippet yet, scan resume sentences
        if (snippets.length === 0 && resumeSentences.length > 0) {
          for (const s of resumeSentences) {
            if (new RegExp(`\\b${jobSkill.name}\\b`, 'i').test(s)) {
              snippets.push(s);
              if (snippets.length >= 2) break;
            }
          }
        }

        matchedSkillsDetails.push({
          skill: jobSkill.name,
          category: jobSkill.category,
          proficiencyLevel: candidateSkill.proficiencyLevel,
          evidenceStrength: candidateSkill.evidenceStrength,
          snippets: snippets.slice(0, 2),
          tfidfScore: candidateSkill.tfidfScore || 0.6,
          cosineSimilarity: candidateSkill.cosineSimilarity || 0.75
        });
      } else {
        // Check partial / semantic relationship
        const relations = SKILL_RELATIONSHIPS[jobSkill.name] || [];
        let matchedPartial = false;

        for (const rel of relations) {
          const lowerRel = rel.candidateSkill.toLowerCase();
          if (candidateSkillMap.has(lowerRel)) {
            partialSkills.push({
              jobSkill: jobSkill.name,
              candidateSkill: rel.candidateSkill,
              category: jobSkill.category,
              relationType: rel.relationType,
              reason: rel.reason
            });
            matchedPartial = true;
            break;
          }
        }

        if (!matchedPartial) {
          missingSkills.push({
            name: jobSkill.name,
            category: jobSkill.category,
            importance: jobSkill.importance
          });
        }
      }
    }

    // 5. Calculate TF-IDF & Cosine Similarity between Job and Candidate Resume
    const candidateText = resumeRawText || Array.from(candidateSkillMap.values()).map(s => s.name).join(' ');
    const candidateTokens = TextPreprocessor.tokenize(candidateText);

    // Build combined corpus for IDF computation
    const combinedSentences = [
      ...jobSentences.map(s => TextPreprocessor.tokenize(s)),
      ...resumeSentences.map(s => TextPreprocessor.tokenize(s))
    ];

    const idfMap = TfidfModel.computeIDF(combinedSentences.length > 0 ? combinedSentences : [jobTokens, candidateTokens]);
    const jobTfidf = TfidfModel.computeTfidf(jobTokens, idfMap);
    const resumeTfidf = TfidfModel.computeTfidf(candidateTokens, idfMap);

    const cosineSim = SimilarityEngine.cosineSimilarity(jobTfidf, resumeTfidf);
    const textCosinePercentage = Math.round(Math.min(Math.max(cosineSim * 100, 0), 100));

    // Calculate Discrete Skill Match Ratio
    let totalSkillWeight = 0;
    let earnedSkillWeight = 0;

    for (const jobSkill of extractedJobSkills) {
      const weight = jobSkill.importance === 'required' ? 1.0 : 0.6;
      totalSkillWeight += weight;

      if (matchedSkillsDetails.some(m => m.skill.toLowerCase() === jobSkill.name.toLowerCase())) {
        earnedSkillWeight += weight;
      } else if (partialSkills.some(p => p.jobSkill.toLowerCase() === jobSkill.name.toLowerCase())) {
        earnedSkillWeight += weight * 0.5; // 50% partial credit
      }
    }

    const skillMatchPercentage = totalSkillWeight > 0
      ? Math.round((earnedSkillWeight / totalSkillWeight) * 100)
      : textCosinePercentage;

    // Weighted Overall Compatibility Percentage
    // 70% Skill Coverage + 30% Text Cosine Alignment
    let finalWeightedScore = Math.round(skillMatchPercentage * 0.7 + textCosinePercentage * 0.3);
    if (extractedJobSkills.length === 0) {
      finalWeightedScore = textCosinePercentage;
    }

    // Clamp between 5% and 98%
    finalWeightedScore = Math.min(Math.max(finalWeightedScore, 5), 98);

    // 6. Generate Concise Explanation & Recommendations
    const matchedCount = matchedSkillsDetails.length;
    const partialCount = partialSkills.length;
    const missingCount = missingSkills.length;
    const totalJobSkills = extractedJobSkills.length;

    let explanation = '';
    const recommendations: string[] = [];

    if (finalWeightedScore >= 75) {
      explanation = `Excellent compatibility (${finalWeightedScore}%). Your background demonstrates strong alignment with ${matchedCount} out of ${totalJobSkills} key competencies demanded for this ${jobTitle} role. Core matched strengths include ${matchedSkillsDetails.slice(0, 3).map(m => m.skill).join(', ')}.`;
    } else if (finalWeightedScore >= 50) {
      explanation = `Moderate compatibility (${finalWeightedScore}%). You fulfill essential technical requirements (${matchedSkillsDetails.slice(0, 3).map(m => m.skill).join(', ')}) with ${partialCount} transferable skills that bridge into adjacent expectations. Targeted upskilling will significantly elevate this application.`;
    } else {
      explanation = `Developing alignment (${finalWeightedScore}%). While foundational technical principles overlap (${textCosinePercentage}% text vector similarity), this position explicitly prioritizes critical competencies (${missingSkills.slice(0, 3).map(m => m.name).join(', ')}) currently unverified in your resume.`;
    }

    if (partialSkills.length > 0) {
      const p = partialSkills[0];
      recommendations.push(`Leverage your proven ${p.candidateSkill} foundation when interviewing for ${p.jobSkill} requirements (${p.reason}).`);
    }

    if (missingSkills.length > 0) {
      const topMissing = missingSkills.slice(0, 3).map(m => m.name).join(', ');
      recommendations.push(`Target acquiring practical portfolio project experience in: ${topMissing}.`);
    }

    if (matchedSkillsDetails.length > 0) {
      recommendations.push(`Highlight your concrete evidence in ${matchedSkillsDetails[0].skill} within your resume executive summary.`);
    }

    // 7. Persist to MongoDB
    const jobAnalysis = await JobAnalysis.create({
      userId: new mongoose.Types.ObjectId(userId),
      resumeId: resume?._id,
      jobTitle: jobTitle || 'Target Tech Position',
      company: company || '',
      jobDescription,
      requiredSkills: extractedJobSkills.map(s => s.name),
      matchingSkills: matchedSkillsDetails.map(m => m.skill),
      missingSkills: missingSkills.map(m => m.name),
      extractedJobSkills,
      matchedSkillsDetails,
      partialSkills,
      compatibilityBreakdown: {
        skillMatchPercentage,
        textCosineSimilarity: textCosinePercentage,
        finalWeightedScore,
        requiredSkillsCount: extractedJobSkills.filter(s => s.importance === 'required').length,
        matchedSkillsCount: matchedCount,
        partialSkillsCount: partialCount,
        missingSkillsCount: missingCount
      },
      explanation,
      recommendations,
      matchResult: {
        matchPercentage: finalWeightedScore,
        breakdown: {
          skillScore: skillMatchPercentage,
          cosineScore: textCosinePercentage,
          matched: matchedCount,
          partial: partialCount,
          missing: missingCount
        },
        recommendationsSummary: explanation
      }
    });

    return jobAnalysis;
  }

  /**
   * Retrieves all job analyses for a user
   */
  static async getUserJobMatches(userId: string): Promise<IJobAnalysis[]> {
    return await JobAnalysis.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  /**
   * Retrieves a single job match by ID
   */
  static async getJobMatchById(matchId: string, userId: string): Promise<IJobAnalysis | null> {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
      throw new Error('Invalid match ID format');
    }
    const match = await JobAnalysis.findOne({
      _id: new mongoose.Types.ObjectId(matchId),
      userId: new mongoose.Types.ObjectId(userId)
    }).populate('resumeId', 'fileInfo.originalName');
    return match;
  }
}
