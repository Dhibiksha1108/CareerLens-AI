import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { CareerRecommendation } from '../models/CareerRecommendation.js';
import { RecommendationService } from './recommendationService.js';
import {
  ICareerBenchmarkResult,
  IDomainBenchmark,
  IMeetingSkill,
  IPortfolioGapItem
} from '../types/index.js';

// Domain mapping lexicon for technical competencies
const DOMAIN_TAXONOMY: Record<string, { name: string; skills: string[]; baselineAvg: number; targetExpect: number }> = {
  frontend: {
    name: 'Frontend & Web Architecture',
    skills: ['React', 'TypeScript', 'JavaScript', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Responsive Design', 'UI/UX'],
    baselineAvg: 72,
    targetExpect: 85
  },
  backend: {
    name: 'Backend, APIs & Microservices',
    skills: ['Node.js', 'Express', 'Python', 'REST API', 'GraphQL', 'Microservices', 'FastAPI', 'Django', 'Java', 'Go'],
    baselineAvg: 70,
    targetExpect: 82
  },
  database: {
    name: 'Data Persistence & Querying',
    skills: ['PostgreSQL', 'SQL', 'MongoDB', 'Redis', 'SQLite', 'MySQL', 'Database Architecture', 'NoSQL', 'Queries', 'Indexing'],
    baselineAvg: 68,
    targetExpect: 80
  },
  devops: {
    name: 'Cloud, DevOps & Automation',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Git', 'Bash', 'Networking', 'Security', 'CloudWatch'],
    baselineAvg: 64,
    targetExpect: 78
  },
  data_ai: {
    name: 'Data Engineering & Applied AI',
    skills: ['Python', 'Pandas', 'Apache Spark', 'Kafka', 'Airflow', 'Statistics', 'Machine Learning', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Power BI', 'Tableau', 'ETL', 'EDA'],
    baselineAvg: 65,
    targetExpect: 80
  }
};

export class BenchmarkingService {
  /**
   * Generates a comprehensive career benchmarking report comparing candidate profile with target role expectations
   */
  static async getCareerBenchmark(
    userId: string,
    targetRoleParam?: string
  ): Promise<ICareerBenchmarkResult> {
    const user = await User.findById(userId);
    let rec: any = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });

    if (!rec || !rec.recommendedRoles || rec.recommendedRoles.length === 0) {
      rec = await RecommendationService.getRecommendations(userId);
    }

    // 1. Resolve Target Role
    const targetRole =
      (targetRoleParam && targetRoleParam.trim()) ||
      rec?.targetRole ||
      (user?.targetRoles && user.targetRoles[0]) ||
      'Full Stack Developer';

    // Find recommended role in Phase 2D data
    let roleObj = rec?.recommendedRoles?.find(
      r => r.role.toLowerCase() === targetRole.toLowerCase()
    );

    if (!roleObj && rec?.recommendedRoles && rec.recommendedRoles.length > 0) {
      roleObj = rec.recommendedRoles[0];
    }

    // 2. Fetch candidate actual data: resumes, skill evidences
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    const skillEvidences = await SkillEvidence.find({ userId });

    const candidateSkillMap = new Map<string, { proficiency: string; strength: string; confidence: number; source: string }>();

    // Collect verified skills from SkillEvidence
    skillEvidences.forEach(ev => {
      if (ev.skill) {
        const sKey = ev.skill.trim().toLowerCase();
        let source = 'Skill Verification';
        if (ev.resumeEvidence && ev.resumeEvidence.length > 0) source = 'Resume Extract';
        else if (ev.githubEvidence && ev.githubEvidence.length > 0) source = 'GitHub Repo';
        else if (ev.projectEvidence && ev.projectEvidence.length > 0) source = 'Project Proof';
        else if (ev.certificationEvidence && ev.certificationEvidence.length > 0) source = 'Certification';

        candidateSkillMap.set(sKey, {
          proficiency: ev.proficiencyLevel || 'intermediate',
          strength: ev.evidenceStrength || 'high',
          confidence: ev.confidence || 0.85,
          source
        });
      }
    });

    // Also collect skills extracted from latest resume
    resumes.forEach(r => {
      (r.skills || []).forEach(s => {
        const sKey = s.trim().toLowerCase();
        if (!candidateSkillMap.has(sKey)) {
          candidateSkillMap.set(sKey, {
            proficiency: 'intermediate',
            strength: 'high',
            confidence: 0.8,
            source: 'Resume Extract'
          });
        }
      });
      if (r.analysisResult?.extractedSkills) {
        r.analysisResult.extractedSkills.forEach((es: any) => {
          if (es.name) {
            const sKey = es.name.trim().toLowerCase();
            candidateSkillMap.set(sKey, {
              proficiency: es.proficiencyLevel || 'intermediate',
              strength: es.evidenceStrength || 'verified',
              confidence: es.confidence || 0.9,
              source: 'NLP Verified'
            });
          }
        });
      }
    });

    // 3. Compare with Role Expectations (Phase 2D data)
    const expectedMatched = roleObj?.matchedSkills || [];
    const expectedMissing = roleObj?.missingSkills || [];
    const totalExpectedSkills = Math.max(expectedMatched.length + expectedMissing.length, 1);

    // Build Meeting Skills List
    const meetingSkills: IMeetingSkill[] = expectedMatched.map(skill => {
      const sKey = skill.toLowerCase();
      const candidateInfo = candidateSkillMap.get(sKey) || {
        proficiency: 'intermediate',
        strength: 'verified',
        confidence: 0.85,
        source: 'Resume Extract'
      };

      // Determine category
      let category = 'Technical';
      if (['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3', 'Tailwind CSS'].includes(skill)) category = 'Frontend';
      else if (['Node.js', 'Express', 'Python', 'REST API', 'GraphQL'].includes(skill)) category = 'Backend';
      else if (['PostgreSQL', 'SQL', 'MongoDB', 'Redis'].includes(skill)) category = 'Database';
      else if (['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Git', 'Linux'].includes(skill)) category = 'DevOps/Cloud';
      else if (['Power BI', 'Tableau', 'Machine Learning', 'Pandas', 'Statistics'].includes(skill)) category = 'Data/AI';

      return {
        skill,
        category,
        proficiency: candidateInfo.proficiency as any,
        evidenceStrength: candidateInfo.strength as any,
        confidence: candidateInfo.confidence,
        evidenceType: candidateInfo.source
      };
    });

    // Build Missing Skills List with Phase 2D priority gaps
    const roleSkillGaps = roleObj?.skillGaps || [];
    const missingSkills = expectedMissing.map((skill, idx) => {
      const existingGap = roleSkillGaps.find(g => g.skill.toLowerCase() === skill.toLowerCase());
      const priority: 'high' | 'medium' | 'low' = existingGap?.priority || (idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low');
      const category = existingGap?.category || 'Technical Competency';
      const demandFrequency = existingGap?.demandFrequency || (priority === 'high' ? 3 : 2);
      const recommendedLearningArea = existingGap?.recommendedLearningArea || `Practical implementation and architectural design with ${skill}.`;
      const estimatedHours = existingGap?.estimatedHours || (priority === 'high' ? 30 : 20);
      const suggestedProject = existingGap?.suggestedProjects?.[0] || `Hands-on ${skill} Production Verification Project for ${targetRole}`;

      return {
        skill,
        category,
        priority,
        demandFrequency,
        recommendedLearningArea,
        estimatedHours,
        suggestedProject
      };
    });

    // 4. Compute Domain Competency Benchmarks (Radar/Bar metrics)
    const domainBenchmarks: IDomainBenchmark[] = Object.entries(DOMAIN_TAXONOMY).map(([_, dom]) => {
      const domainRelevantSkills = dom.skills;
      const verifiedInDomain: string[] = [];
      const missingInDomain: string[] = [];

      domainRelevantSkills.forEach(s => {
        if (candidateSkillMap.has(s.toLowerCase())) {
          verifiedInDomain.push(s);
        } else if (expectedMissing.some(ms => ms.toLowerCase() === s.toLowerCase())) {
          missingInDomain.push(s);
        }
      });

      // Calculate score for this domain based on verified competencies
      const baseRatio = verifiedInDomain.length / Math.max(domainRelevantSkills.length * 0.6, 1);
      const candidateScore = Math.min(Math.max(Math.round(baseRatio * 100), 20), 98);

      // Industry average and role expectation adjustments
      const industryAverage = dom.baselineAvg;
      const targetExpectation = dom.targetExpect;

      let percentile = 'Developing';
      let status: 'exceeds' | 'meets' | 'below' = 'below';

      if (candidateScore >= targetExpectation) {
        percentile = candidateScore >= 90 ? 'Top 10%' : 'Top 15%';
        status = 'exceeds';
      } else if (candidateScore >= industryAverage) {
        percentile = 'Top 25%';
        status = 'meets';
      } else {
        percentile = candidateScore >= 50 ? 'Average (50th)' : 'Developing';
        status = 'below';
      }

      return {
        domain: dom.name,
        category: dom.name,
        candidateScore,
        industryAverage,
        targetExpectation,
        percentile,
        status,
        verifiedSkills: verifiedInDomain,
        missingSkills: missingInDomain
      };
    });

    // 5. Portfolio Gap Analysis (Comparing completed projects with role deliverables)
    const roleProjects = roleObj?.practicalProjects || rec?.skillGaps?.flatMap(g => g.practicalProjects || []) || [];
    const resumeText = resumes[0]?.extractedText || '';

    const portfolioGaps: IPortfolioGapItem[] = roleProjects.map(p => {
      // Check if candidate resume or evidence mentions project's target skill
      const hasSkill = candidateSkillMap.has(p.targetSkill.toLowerCase());
      const mentionsInText = resumeText.toLowerCase().includes(p.targetSkill.toLowerCase());

      const status: 'completed' | 'in_progress' | 'missing' = (hasSkill && mentionsInText)
        ? 'completed'
        : hasSkill
        ? 'in_progress'
        : 'missing';

      return {
        targetSkill: p.targetSkill,
        recommendedProjectTitle: p.title,
        difficulty: p.difficulty,
        portfolioEvidence: p.portfolioEvidence,
        estimatedHours: p.estimatedHours,
        status,
        keyDeliverables: p.keyDeliverables || []
      };
    });

    const completedProjectsCount = portfolioGaps.filter(p => p.status === 'completed').length;
    const portfolioReadinessScore = portfolioGaps.length > 0
      ? Math.round((completedProjectsCount / portfolioGaps.length) * 100)
      : 70;

    // 6. Experience Gap Analysis
    let detectedYears = 3;
    const expMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of)?\s*(experience|engineering|development)/i);
    if (expMatch && expMatch[1]) {
      detectedYears = parseInt(expMatch[1], 10);
    } else if (resumes[0]?.experience && resumes[0].experience.length > 0) {
      detectedYears = Math.min(resumes[0].experience.length * 2, 7);
    }

    const expectedLevel = targetRole.toLowerCase().includes('senior')
      ? 'Senior Level (5+ years)'
      : 'Mid-to-Senior Level (3–5 years)';

    const standing: 'Strong' | 'Adequate' | 'Emerging' = detectedYears >= 4
      ? 'Strong'
      : detectedYears >= 2
      ? 'Adequate'
      : 'Emerging';

    const expFeedback = standing === 'Strong'
      ? `Strong professional track record (${detectedYears}+ years) meeting or exceeding benchmark requirements for ${targetRole}.`
      : standing === 'Adequate'
      ? `Solid demonstrated foundation (${detectedYears} years). Pairing practical projects will compensate for senior tenure thresholds.`
      : `Emerging engineering profile (${detectedYears} years). Highlighting production portfolio evidence will bridge market experience filters.`;

    // 7. Roadmap Progress (Phase 3 connection)
    const activeRoadmap = roleObj?.roadmap || rec?.roadmap || [];
    let totalMilestones = 0;
    let completedMilestones = 0;

    activeRoadmap.forEach(stage => {
      (stage.milestones || []).forEach(m => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });

    const percentComplete = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // 8. Overall Career Readiness Score
    // Formula:
    // - Skill Match (50%)
    // - Domain Benchmarks Average (25%)
    // - Portfolio Readiness (15%)
    // - Roadmap Milestone Progress (10%)
    const skillMatchRatio = Math.round((meetingSkills.length / totalExpectedSkills) * 100);
    const domainAvg = Math.round(
      domainBenchmarks.reduce((acc, d) => acc + d.candidateScore, 0) / domainBenchmarks.length
    );

    const rawReadiness =
      skillMatchRatio * 0.50 +
      domainAvg * 0.25 +
      portfolioReadinessScore * 0.15 +
      Math.max(percentComplete, 30) * 0.10;

    const overallReadiness = Math.min(Math.max(Math.round(rawReadiness), 25), 98);

    const readinessLevel: 'Job Ready' | 'Competitive' | 'Developing' =
      overallReadiness >= 80 ? 'Job Ready' : overallReadiness >= 65 ? 'Competitive' : 'Developing';

    const candidatePercentile =
      overallReadiness >= 88 ? 'Top 10%' : overallReadiness >= 80 ? 'Top 15%' : overallReadiness >= 70 ? 'Top 25%' : 'Top 45%';

    // 9. Clear Actionable Areas to Improve
    const clearAreasToImprove: ICareerBenchmarkResult['clearAreasToImprove'] = [];

    // Top missing high-priority skills
    const topMissing = missingSkills.filter(m => m.priority === 'high');
    if (topMissing.length > 0) {
      const top3 = topMissing.slice(0, 3).map(m => m.skill).join(', ');
      clearAreasToImprove.push({
        area: 'Priority Skill Acquisition',
        category: 'Skill Gap',
        priority: 'high',
        title: `Bridge High-Demand ${targetRole} Missing Skills: ${top3}`,
        impactScore: '+12% Career Readiness',
        actionableStep: `Focus on mastering ${top3} to satisfy the primary keyword and competency thresholds expected by hiring teams.`,
        suggestedActionLink: `/recommendations?role=${encodeURIComponent(targetRole)}`
      });
    }

    // Portfolio Gap
    const missingPortfolio = portfolioGaps.filter(p => p.status === 'missing');
    if (missingPortfolio.length > 0) {
      const targetProj = missingPortfolio[0];
      clearAreasToImprove.push({
        area: 'Portfolio Evidence Building',
        category: 'Portfolio Project',
        priority: 'high',
        title: `Build Practical Project: ${targetProj.recommendedProjectTitle}`,
        impactScore: '+8% Portfolio Proof',
        actionableStep: `Implement deliverables for ${targetProj.targetSkill} (${targetProj.estimatedHours} hrs) to demonstrate tangible production architecture to employers.`,
        suggestedActionLink: `/roadmap?role=${encodeURIComponent(targetRole)}`
      });
    }

    // Roadmap Milestone
    const activeStage = activeRoadmap[0];
    if (activeStage) {
      clearAreasToImprove.push({
        area: 'Roadmap Milestone Progression',
        category: 'Roadmap Milestone',
        priority: 'medium',
        title: `Progress Through Stage ${activeStage.stage}: ${activeStage.title}`,
        impactScore: '+5% Milestone Standing',
        actionableStep: `Advance through the structured 3-stage career roadmap milestones designed for ${targetRole}.`,
        suggestedActionLink: `/roadmap?role=${encodeURIComponent(targetRole)}`
      });
    }

    // Simulator Exploration
    clearAreasToImprove.push({
      area: 'Portfolio Improvement Simulator',
      category: 'Skill Gap',
      priority: 'medium',
      title: 'Simulate Career Impact of Certifications & Skills (Phase 4A)',
      impactScore: '+15% Projected Uplift',
      actionableStep: `Use the interactive simulator to model the exact score boost of adding certifications, projects, or missing skills without changing your profile.`,
      suggestedActionLink: `/simulator?role=${encodeURIComponent(targetRole)}`
    });

    return {
      targetRole,
      targetRoleDescription: roleObj?.reason || `Core expectations and technical competency requirements for ${targetRole}.`,
      overallReadiness,
      industryAverageReadiness: 70,
      candidatePercentile,
      readinessLevel,
      totalExpectedSkills,
      meetingSkillsCount: meetingSkills.length,
      missingSkillsCount: missingSkills.length,
      meetingSkills,
      missingSkills,
      domainBenchmarks,
      portfolioGapAnalysis: {
        candidateProjectCount: completedProjectsCount,
        expectedProjectCount: portfolioGaps.length,
        portfolioReadinessScore,
        gaps: portfolioGaps
      },
      experienceGapAnalysis: {
        detectedYears,
        expectedLevel,
        standing,
        feedback: expFeedback
      },
      roadmapProgress: {
        totalMilestones,
        completedMilestones,
        percentComplete,
        activeStageTitle: activeStage?.title || 'Foundational Competencies'
      },
      clearAreasToImprove
    };
  }
}
