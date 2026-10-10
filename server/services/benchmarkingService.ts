import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { CareerRecommendation } from '../models/CareerRecommendation.js';
import { RecommendationService, ROLE_TAXONOMY } from './recommendationService.js';
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

interface IRoleBenchmarkConfig {
  targetExpectations: Record<string, number>;
  industryAverages: Record<string, number>;
  domainWeights: Record<string, number>;
}

const ROLE_BENCHMARK_CONFIGS: Record<string, IRoleBenchmarkConfig> = {
  'Full Stack Developer': {
    targetExpectations: { frontend: 88, backend: 86, database: 82, devops: 76, data_ai: 55 },
    industryAverages: { frontend: 72, backend: 70, database: 68, devops: 64, data_ai: 62 },
    domainWeights: { frontend: 0.30, backend: 0.30, database: 0.20, devops: 0.15, data_ai: 0.05 }
  },
  'Data Analyst': {
    targetExpectations: { frontend: 55, backend: 45, database: 85, devops: 45, data_ai: 90 },
    industryAverages: { frontend: 65, backend: 62, database: 70, devops: 58, data_ai: 68 },
    domainWeights: { frontend: 0.10, backend: 0.05, database: 0.30, devops: 0.05, data_ai: 0.50 }
  },
  'Backend Engineer': {
    targetExpectations: { frontend: 40, backend: 92, database: 88, devops: 82, data_ai: 55 },
    industryAverages: { frontend: 62, backend: 72, database: 70, devops: 66, data_ai: 60 },
    domainWeights: { frontend: 0.05, backend: 0.40, database: 0.30, devops: 0.20, data_ai: 0.05 }
  },
  'Data Engineer': {
    targetExpectations: { frontend: 35, backend: 80, database: 90, devops: 82, data_ai: 92 },
    industryAverages: { frontend: 60, backend: 68, database: 72, devops: 66, data_ai: 68 },
    domainWeights: { frontend: 0.05, backend: 0.20, database: 0.35, devops: 0.15, data_ai: 0.25 }
  },
  'DevOps / Cloud Engineer': {
    targetExpectations: { frontend: 35, backend: 78, database: 75, devops: 94, data_ai: 45 },
    industryAverages: { frontend: 58, backend: 68, database: 66, devops: 70, data_ai: 58 },
    domainWeights: { frontend: 0.05, backend: 0.20, database: 0.15, devops: 0.55, data_ai: 0.05 }
  },
  'Machine Learning Engineer': {
    targetExpectations: { frontend: 35, backend: 80, database: 76, devops: 78, data_ai: 94 },
    industryAverages: { frontend: 58, backend: 68, database: 68, devops: 64, data_ai: 70 },
    domainWeights: { frontend: 0.05, backend: 0.20, database: 0.15, devops: 0.15, data_ai: 0.45 }
  },
  'Frontend Engineer': {
    targetExpectations: { frontend: 94, backend: 65, database: 55, devops: 65, data_ai: 35 },
    industryAverages: { frontend: 74, backend: 65, database: 62, devops: 62, data_ai: 55 },
    domainWeights: { frontend: 0.55, backend: 0.20, database: 0.10, devops: 0.10, data_ai: 0.05 }
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
      rec = await RecommendationService.getRecommendations(userId, targetRoleParam);
    }

    // 1. Resolve Target Role
    const targetRole =
      (targetRoleParam && targetRoleParam.trim()) ||
      rec?.targetRole ||
      (user?.targetRoles && user.targetRoles[0]) ||
      'Full Stack Developer';

    // Look up canonical taxonomy for this role
    const taxonomyMatch =
      ROLE_TAXONOMY[targetRole] ||
      Object.entries(ROLE_TAXONOMY).find(
        ([k]) => k.toLowerCase() === targetRole.toLowerCase()
      )?.[1] ||
      ROLE_TAXONOMY['Full Stack Developer'];

    const roleReqSkills = taxonomyMatch?.skills || [];

    // Find recommended role in Phase 2D data
    let roleObj = rec?.recommendedRoles?.find(
      (r: any) => r.role.trim().toLowerCase() === targetRole.trim().toLowerCase()
    );

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

    // 3. Compute Role-Specific Meeting and Missing Skills based dynamically on the requested Target Role
    const expectedMatched: string[] = [];
    const expectedMissing: string[] = [];

    roleReqSkills.forEach(reqSkill => {
      const sKey = reqSkill.trim().toLowerCase();
      if (candidateSkillMap.has(sKey)) {
        expectedMatched.push(reqSkill);
      } else {
        expectedMissing.push(reqSkill);
      }
    });

    // If roleObj has extra matched/missing, combine cleanly without duplicates
    if (roleObj?.matchedSkills) {
      roleObj.matchedSkills.forEach((s: string) => {
        if (!expectedMatched.includes(s) && candidateSkillMap.has(s.toLowerCase())) {
          expectedMatched.push(s);
        }
      });
    }
    if (roleObj?.missingSkills) {
      roleObj.missingSkills.forEach((s: string) => {
        if (!expectedMatched.includes(s) && !expectedMissing.includes(s)) {
          expectedMissing.push(s);
        }
      });
    }

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
      else if (['Power BI', 'Tableau', 'Machine Learning', 'Pandas', 'Statistics', 'Data Visualization', 'EDA'].includes(skill)) category = 'Data/AI';

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
      const existingGap = roleSkillGaps.find((g: any) => g.skill.toLowerCase() === skill.toLowerCase());
      const priority: 'high' | 'medium' | 'low' = existingGap?.priority || (idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low');
      const category = existingGap?.category || (
        ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux'].includes(skill) ? 'DevOps & Cloud' :
        ['Apache Spark', 'Kafka', 'Airflow', 'ETL', 'Data Warehousing'].includes(skill) ? 'Data Engineering' :
        ['Power BI', 'Tableau', 'Statistics', 'Pandas', 'Machine Learning'].includes(skill) ? 'Data & Analytics' :
        ['React', 'TypeScript', 'CSS', 'HTML'].includes(skill) ? 'Frontend Engineering' :
        'Technical Competency'
      );
      const demandFrequency = existingGap?.demandFrequency || (priority === 'high' ? 3 : 2);
      const recommendedLearningArea = existingGap?.recommendedLearningArea || `Practical implementation and architectural design with ${skill} for ${targetRole}.`;
      const estimatedHours = existingGap?.estimatedHours || (priority === 'high' ? 30 : 20);
      const suggestedProject = existingGap?.suggestedProjects?.[0] || `Production ${skill} Verification Project for ${targetRole}`;

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

    // 4. Compute Dynamic Domain Competency Benchmarks tailored to the Target Role
    const roleConfig =
      ROLE_BENCHMARK_CONFIGS[targetRole] ||
      Object.entries(ROLE_BENCHMARK_CONFIGS).find(
        ([k]) => k.toLowerCase() === targetRole.toLowerCase()
      )?.[1] ||
      ROLE_BENCHMARK_CONFIGS['Full Stack Developer'];

    const domainBenchmarks: IDomainBenchmark[] = Object.entries(DOMAIN_TAXONOMY).map(([domKey, dom]) => {
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

      // Role-specific target expectations and industry baselines
      const industryAverage = roleConfig.industryAverages[domKey] || dom.baselineAvg;
      const targetExpectation = roleConfig.targetExpectations[domKey] || dom.targetExpect;

      // Candidate score reflects demonstrated skills in this domain evaluated against role demands
      const domainSkillsRequiredForRole = roleReqSkills.filter(s =>
        dom.skills.some(ds => ds.toLowerCase() === s.toLowerCase())
      );

      let candidateScore: number;
      if (domainSkillsRequiredForRole.length > 0) {
        const matchedReqsInDomain = domainSkillsRequiredForRole.filter(s =>
          candidateSkillMap.has(s.toLowerCase())
        );
        const reqMatchRatio = matchedReqsInDomain.length / domainSkillsRequiredForRole.length;
        const generalDomainRatio = verifiedInDomain.length / Math.max(dom.skills.length * 0.5, 1);
        candidateScore = Math.round(reqMatchRatio * 65 + generalDomainRatio * 35);
      } else {
        const generalDomainRatio = verifiedInDomain.length / Math.max(dom.skills.length * 0.5, 1);
        candidateScore = Math.round(generalDomainRatio * 80);
      }

      // Clamp between 18% and 98%
      candidateScore = Math.min(Math.max(candidateScore, 18), 98);

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
    let roleProjects = roleObj?.practicalProjects;
    if (!roleProjects || roleProjects.length === 0) {
      roleProjects = missingSkills.map(m =>
        RecommendationService.getPracticalProjectForSkill(m.skill, targetRole, 'Intermediate')
      );
    }

    const resumeText = resumes[0]?.extractedText || '';

    const portfolioGaps: IPortfolioGapItem[] = (roleProjects || []).map((p: any) => {
      const hasSkill = candidateSkillMap.has((p.targetSkill || '').toLowerCase());
      const mentionsInText = resumeText.toLowerCase().includes((p.targetSkill || '').toLowerCase());

      const status: 'completed' | 'in_progress' | 'missing' = (hasSkill && mentionsInText)
        ? 'completed'
        : hasSkill
        ? 'in_progress'
        : 'missing';

      return {
        targetSkill: p.targetSkill || 'Technical Capability',
        recommendedProjectTitle: p.title || `Practical ${p.targetSkill} Deliverable`,
        difficulty: p.difficulty || 'Intermediate',
        portfolioEvidence: p.portfolioEvidence || `Production architectural evidence demonstrating ${p.targetSkill}`,
        estimatedHours: p.estimatedHours || 18,
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
    const activeRoadmap = roleObj?.roadmap || RecommendationService.generateRoleRoadmap(targetRole, expectedMissing, expectedMatched);
    let totalMilestones = 0;
    let completedMilestones = 0;

    activeRoadmap.forEach((stage: any) => {
      (stage.milestones || []).forEach((m: any) => {
        totalMilestones++;
        if (m.completed) completedMilestones++;
      });
    });

    const percentComplete = totalMilestones > 0
      ? Math.round((completedMilestones / totalMilestones) * 100)
      : 0;

    // 8. Overall Career Readiness Score for the Target Role
    const skillMatchRatio = Math.round((expectedMatched.length / totalExpectedSkills) * 100);
    const domainAvg = Math.round(
      domainBenchmarks.reduce((acc, d) => acc + d.candidateScore, 0) / domainBenchmarks.length
    );

    const rawReadiness =
      skillMatchRatio * 0.45 +
      domainAvg * 0.25 +
      portfolioReadinessScore * 0.20 +
      Math.max(percentComplete, 25) * 0.10;

    const overallReadiness = Math.min(Math.max(Math.round(rawReadiness), 12), 98);

    const readinessLevel: 'Job Ready' | 'Competitive' | 'Developing' =
      overallReadiness >= 80 ? 'Job Ready' : overallReadiness >= 65 ? 'Competitive' : 'Developing';

    const candidatePercentile =
      overallReadiness >= 85 ? 'Top 10%' : overallReadiness >= 75 ? 'Top 15%' : overallReadiness >= 65 ? 'Top 25%' : overallReadiness >= 50 ? 'Average (50th)' : 'Developing (60th)';

    // 9. Clear Actionable Areas to Improve dynamically tailored to Target Role
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
        impactScore: '+14% Career Readiness',
        actionableStep: `Focus on mastering ${top3} to satisfy the primary keyword and competency thresholds expected by hiring teams for ${targetRole}.`,
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
        impactScore: '+9% Portfolio Proof',
        actionableStep: `Implement deliverables for ${targetProj.targetSkill} (${targetProj.estimatedHours} hrs) to demonstrate tangible production architecture to employers for ${targetRole}.`,
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
        impactScore: '+6% Milestone Standing',
        actionableStep: `Advance through the structured 3-stage career roadmap milestones designed for ${targetRole}.`,
        suggestedActionLink: `/roadmap?role=${encodeURIComponent(targetRole)}`
      });
    }

    // Simulator Exploration
    clearAreasToImprove.push({
      area: 'Portfolio Improvement Simulator',
      category: 'Skill Gap',
      priority: 'medium',
      title: `Simulate Career Impact of Certifications & Skills for ${targetRole}`,
      impactScore: '+15% Projected Uplift',
      actionableStep: `Use the interactive simulator to model the exact score boost of adding certifications, projects, or missing skills for ${targetRole}.`,
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
