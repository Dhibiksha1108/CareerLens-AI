import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { CareerRecommendation } from '../models/CareerRecommendation.js';
import { RecommendationService } from './recommendationService.js';
import { BenchmarkingService } from './benchmarkingService.js';
import { ICareerAnalyticsData } from '../types/index.js';

export class AnalyticsService {
  /**
   * Generates comprehensive visual analytics and skill chart datasets for the user
   */
  static async getCareerAnalytics(
    userId: string,
    targetRoleParam?: string
  ): Promise<ICareerAnalyticsData> {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 1. Fetch or generate recommendations
    let rec: any = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });
    if (!rec || !rec.recommendedRoles || rec.recommendedRoles.length === 0) {
      rec = await RecommendationService.getRecommendations(userId);
    }

    // 2. Resolve Target Role
    const targetRole =
      (targetRoleParam && targetRoleParam.trim()) ||
      rec?.targetRole ||
      (user.targetRoles && user.targetRoles[0]) ||
      'Full Stack Developer';

    const availableRoles = (rec?.recommendedRoles || []).map((r: any) => r.role);
    if (availableRoles.length === 0) {
      availableRoles.push(targetRole);
    }

    const normalizedTarget = targetRole.trim().toLowerCase();
    const roleObj =
      rec?.recommendedRoles?.find((r: any) => r.role.trim().toLowerCase() === normalizedTarget) ||
      rec?.recommendedRoles?.find((r: any) => r.role.toLowerCase().replace(/\s+/g, '') === normalizedTarget.replace(/\s+/g, '')) ||
      rec?.recommendedRoles?.[0] || {
        role: targetRole,
        matchPercentage: 75,
        matchedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        missingSkills: ['Docker', 'Kubernetes', 'AWS'],
        skillGaps: [],
        roadmap: [],
        practicalProjects: []
      };

    // 3. Fetch Benchmarking Data
    let benchmarkData: any = null;
    try {
      benchmarkData = await BenchmarkingService.getCareerBenchmark(userId, targetRole);
    } catch (err) {
      console.warn('Benchmarking fetch fallback in analytics:', err);
    }

    // Role-specific skills from Phase 2D role object (same source used by skill charts)
    const verifiedSkillsList = roleObj.matchedSkills || [];
    const missingSkillsList = roleObj.missingSkills || [];
    const totalSkillsRole = Math.max(verifiedSkillsList.length + missingSkillsList.length, 1);

    // 4. Job Compatibility Analytics (derived from real role-specific data)
    const selectedRoleMatch = totalSkillsRole > 0
      ? Math.round((verifiedSkillsList.length / totalSkillsRole) * 100)
      : (typeof roleObj.matchPercentage === 'number' ? roleObj.matchPercentage : 0);

    const roleComparison = (rec?.recommendedRoles || []).map((r: any) => {
      const matchedCount = (r.matchedSkills || []).length;
      const missingCount = (r.missingSkills || []).length;
      const totalCount = matchedCount + missingCount;
      const matchPercentage = totalCount > 0
        ? Math.round((matchedCount / totalCount) * 100)
        : (typeof r.matchPercentage === 'number' ? r.matchPercentage : 0);
      const isSelected = r.role.trim().toLowerCase() === normalizedTarget ||
        r.role.toLowerCase().replace(/\s+/g, '') === normalizedTarget.replace(/\s+/g, '');

      return {
        role: r.role,
        matchPercentage,
        matchedCount,
        missingCount,
        isSelected
      };
    });

    // 5. Skill Gap Distribution & Priority Breakdown (needed for uplift & effort)
    const roleGaps = roleObj.skillGaps || [];
    const missingSkillsRaw = roleObj.missingSkills || [];

    const gapsWithPriority = missingSkillsRaw.map((skill: string, idx: number) => {
      const found = roleGaps.find((g: any) => g.skill.toLowerCase() === skill.toLowerCase());
      const priority: 'high' | 'medium' | 'low' = found?.priority || (idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low');
      const category = found?.category || 'Technical Competency';
      const estimatedHours = found?.estimatedHours || (priority === 'high' ? 30 : priority === 'medium' ? 20 : 12);

      return {
        skill,
        priority,
        category,
        estimatedHours
      };
    });

    const highGaps = gapsWithPriority.filter((g: any) => g.priority === 'high');
    const medGaps = gapsWithPriority.filter((g: any) => g.priority === 'medium');
    const lowGaps = gapsWithPriority.filter((g: any) => g.priority === 'low');

    // 6. Roadmap & Milestone Progress
    const activeRoadmap = roleObj.roadmap && roleObj.roadmap.length > 0 ? roleObj.roadmap : (rec?.roadmap || []);
    let totalMilestones = 0;
    let completedMilestones = 0;

    const stages = activeRoadmap.map((stage: any, sIdx: number) => {
      const stageTotal = (stage.milestones || []).length;
      const stageDone = (stage.milestones || []).filter((m: any) => m.completed).length;
      totalMilestones += stageTotal;
      completedMilestones += stageDone;

      return {
        stageNumber: stage.stage || (sIdx + 1),
        title: stage.title,
        totalMilestones: stageTotal,
        completedMilestones: stageDone,
        percentComplete: stageTotal > 0 ? Math.round((stageDone / stageTotal) * 100) : 0
      };
    });

    const overallMilestoneProgress = {
      total: totalMilestones,
      completed: completedMilestones,
      remaining: Math.max(totalMilestones - completedMilestones, 0),
      percent: totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0
    };

    // 7. Practical Projects & Portfolio Deliverables
    const practicalProjectsRaw =
      roleObj.practicalProjects && roleObj.practicalProjects.length > 0
        ? roleObj.practicalProjects
        : (roleGaps.flatMap((g: any) => g.practicalProjects || []));

    const totalProjects = practicalProjectsRaw.length;
    const completedProjects = benchmarkData?.portfolioGapAnalysis?.candidateProjectCount || 0;
    const inProgressProjects = Math.min(Math.max(totalProjects - completedProjects - 1, 0), 2);
    const missingProjects = Math.max(totalProjects - completedProjects - inProgressProjects, 0);
    const portfolioReadinessScore =
      totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 70;

    // 8. Career Readiness Summary & Progression Trend (derived dynamically from the selected role)
    const benchmarkReadiness = benchmarkData?.overallReadiness;
    let overallReadiness: number;
    if (typeof benchmarkReadiness === 'number' && benchmarkReadiness > 0 && Math.abs(benchmarkReadiness - selectedRoleMatch) <= 30) {
      overallReadiness = Math.round(selectedRoleMatch * 0.60 + benchmarkReadiness * 0.40);
    } else {
      const mileScore = Math.max(overallMilestoneProgress.percent, selectedRoleMatch > 0 ? 20 : 0);
      overallReadiness = Math.round(selectedRoleMatch * 0.65 + portfolioReadinessScore * 0.20 + mileScore * 0.15);
    }
    overallReadiness = Math.min(Math.max(overallReadiness, selectedRoleMatch > 0 ? Math.min(selectedRoleMatch, 15) : 5), 98);

    const industryBaseline = benchmarkData?.industryAverageReadiness || 70;
    const calculatedUplift = Math.round(highGaps.length * 6 + medGaps.length * 4 + lowGaps.length * 2);
    const potentialUplift = Math.min(Math.max(calculatedUplift, missingSkillsList.length > 0 ? 8 : 4), 100 - overallReadiness);

    let candidatePercentile = 'Developing (Top 65%)';
    if (overallReadiness >= 85) candidatePercentile = 'Top 10%';
    else if (overallReadiness >= 75) candidatePercentile = 'Top 15%';
    else if (overallReadiness >= 65) candidatePercentile = 'Top 25%';
    else if (overallReadiness >= 50) candidatePercentile = 'Top 35%';
    else if (overallReadiness >= 35) candidatePercentile = 'Top 50%';

    // Dynamically ascending career readiness progression curve for the selected role
    const initialBaseline = Math.max(Math.round(overallReadiness * 0.45), 5);
    const nlpExtraction = Math.max(Math.round(overallReadiness * 0.78), initialBaseline + 4);
    const currentStanding = overallReadiness;
    const projectedPotential = Math.min(overallReadiness + potentialUplift, 98);

    const readinessTrend = [
      { stage: 'Initial Profile Baseline', score: initialBaseline },
      { stage: 'Resume NLP Extraction', score: nlpExtraction },
      { stage: 'Current Verified Standing', score: currentStanding },
      { stage: 'Projected Potential', score: projectedPotential }
    ];

    const priorityDistribution: ICareerAnalyticsData['skillGapDistribution']['priorityDistribution'] = [
      {
        priority: 'High',
        count: highGaps.length,
        totalHours: highGaps.reduce((acc: number, g: any) => acc + g.estimatedHours, 0),
        color: '#f43f5e' // rose-500
      },
      {
        priority: 'Medium',
        count: medGaps.length,
        totalHours: medGaps.reduce((acc: number, g: any) => acc + g.estimatedHours, 0),
        color: '#f59e0b' // amber-500
      },
      {
        priority: 'Low',
        count: lowGaps.length,
        totalHours: lowGaps.reduce((acc: number, g: any) => acc + g.estimatedHours, 0),
        color: '#64748b' // slate-500
      }
    ];

    // Category Distribution
    const catMap: Record<string, { count: number; totalHours: number }> = {};
    gapsWithPriority.forEach((g: any) => {
      const cat = g.category || 'Specialized Technical';
      if (!catMap[cat]) {
        catMap[cat] = { count: 0, totalHours: 0 };
      }
      catMap[cat].count += 1;
      catMap[cat].totalHours += g.estimatedHours;
    });

    const categoryDistribution = Object.entries(catMap).map(([category, val]) => ({
      category,
      count: val.count,
      totalHours: val.totalHours
    }));

    // 9. Career Benchmark Comparison (5 Competency Domains)
    const domainComparisons = (benchmarkData?.domainBenchmarks || []).map((d: any) => ({
      domain: d.domain,
      candidateScore: d.candidateScore,
      industryAverage: d.industryAverage,
      targetExpectation: d.targetExpectation,
      percentile: d.percentile,
      status: d.status
    }));

    // 10. Phase 5B: Skill Charts Detailed Datasets
    const verifiedVsMissing = {
      verifiedCount: verifiedSkillsList.length,
      missingCount: missingSkillsList.length,
      totalCount: totalSkillsRole,
      verifiedPercent: Math.round((verifiedSkillsList.length / totalSkillsRole) * 100),
      missingPercent: Math.round((missingSkillsList.length / totalSkillsRole) * 100)
    };

    const priorityBreakdown = [
      { name: 'High Priority', value: highGaps.length, fill: '#f43f5e' },
      { name: 'Medium Priority', value: medGaps.length, fill: '#f59e0b' },
      { name: 'Low Priority', value: lowGaps.length, fill: '#3b82f6' }
    ];

    // Category Coverage (Verified vs Missing across domains)
    const domainsLexicon: Record<string, string[]> = {
      'Frontend & UI': ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Next.js'],
      'Backend & APIs': ['Node.js', 'Express', 'Python', 'REST API', 'GraphQL', 'Microservices', 'FastAPI'],
      'Databases': ['PostgreSQL', 'SQL', 'MongoDB', 'Redis', 'Database Architecture'],
      'DevOps & Cloud': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform', 'Git'],
      'Data & Analytics': ['Python', 'SQL', 'Power BI', 'Tableau', 'Pandas', 'Statistics', 'Machine Learning']
    };

    const categoryCoverage = Object.entries(domainsLexicon).map(([category, skillSet]) => {
      const verifiedInCat = verifiedSkillsList.filter((s: string) =>
        skillSet.some(k => k.toLowerCase() === s.toLowerCase())
      ).length;
      const missingInCat = missingSkillsList.filter((s: string) =>
        skillSet.some(k => k.toLowerCase() === s.toLowerCase())
      ).length;
      const totalInCat = Math.max(verifiedInCat + missingInCat, 1);

      return {
        category,
        verifiedCount: verifiedInCat,
        missingCount: missingInCat,
        totalCount: totalInCat,
        coveragePercent: Math.round((verifiedInCat / totalInCat) * 100)
      };
    });

    // Role Skill Coverage table
    const roleSkillCoverage: ICareerAnalyticsData['skillChartsData']['roleSkillCoverage'] = [
      ...verifiedSkillsList.map((skill: string) => ({
        skill,
        status: 'verified' as const,
        priority: 'low' as const,
        category: 'Verified Competency',
        confidence: 0.9,
        proficiency: 'Intermediate to Advanced'
      })),
      ...gapsWithPriority.map((g: any) => ({
        skill: g.skill,
        status: 'missing' as const,
        priority: g.priority,
        category: g.category,
        confidence: 0.2,
        proficiency: 'Gap to Develop'
      }))
    ];

    // Milestone Skill Progress
    const milestoneSkillProgress: ICareerAnalyticsData['skillChartsData']['milestoneSkillProgress'] = [];
    activeRoadmap.forEach((stage: any, sIdx: number) => {
      (stage.milestones || []).forEach((m: any) => {
        milestoneSkillProgress.push({
          skill: m.skillTarget || stage.skills?.[0] || 'Technical Mastery',
          completed: !!m.completed,
          stage: stage.stage || (sIdx + 1),
          description: m.description
        });
      });
    });

    return {
      targetRole,
      availableRoles,
      readinessSummary: {
        overallReadiness,
        industryBaseline,
        potentialUplift,
        candidatePercentile,
        readinessTrend
      },
      jobCompatibilityAnalytics: {
        selectedRoleMatch,
        roleComparison
      },
      skillGapDistribution: {
        priorityDistribution,
        categoryDistribution
      },
      learningRoadmapAnalytics: {
        stages,
        overallMilestoneProgress
      },
      projectPortfolioProgress: {
        totalProjects,
        completedProjects,
        inProgressProjects,
        missingProjects,
        portfolioReadinessScore
      },
      careerBenchmarkComparison: {
        readinessScore: overallReadiness,
        industryAverage: industryBaseline,
        domainComparisons
      },
      skillChartsData: {
        verifiedVsMissing,
        priorityBreakdown,
        categoryCoverage,
        roleSkillCoverage,
        milestoneSkillProgress
      }
    };
  }
}
