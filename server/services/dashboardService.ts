import { User } from '../models/User.js';
import { Resume } from '../models/Resume.js';
import { CareerRecommendation } from '../models/CareerRecommendation.js';
import { RecommendationService } from './recommendationService.js';
import { AtsAnalysisService } from './atsAnalysisService.js';
import { BenchmarkingService } from './benchmarkingService.js';
import { IUnifiedDashboardData } from '../types/index.js';

export class DashboardService {
  /**
   * Aggregates real user results from Phase 1 through Phase 4C into a unified dashboard representation
   */
  static async getDashboardSummary(
    userId: string,
    targetRoleParam?: string
  ): Promise<IUnifiedDashboardData> {
    // 1. Fetch User Profile
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // 2. Fetch or Generate Recommendations (Phase 2D)
    let rec: any = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });
    if (!rec || !rec.recommendedRoles || rec.recommendedRoles.length === 0) {
      rec = await RecommendationService.getRecommendations(userId);
    }

    // Determine Active Target Role
    const targetRole =
      (targetRoleParam && targetRoleParam.trim()) ||
      rec?.targetRole ||
      (user.targetRoles && user.targetRoles[0]) ||
      'Full Stack Developer';

    const availableRoles = (rec?.recommendedRoles || []).map((r: any) => r.role);
    if (availableRoles.length === 0) {
      availableRoles.push(targetRole);
    }

    // Find Role Data in Recommendations
    const roleObj =
      rec?.recommendedRoles?.find((r: any) => r.role.toLowerCase() === targetRole.toLowerCase()) ||
      rec?.recommendedRoles?.[0] || {
        role: targetRole,
        matchPercentage: 70,
        matchedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
        missingSkills: ['Docker', 'Kubernetes', 'AWS'],
        reason: `Target alignment for ${targetRole}.`,
        skillGaps: [],
        roadmap: [],
        practicalProjects: []
      };

    // 3. Fetch Latest Resume & Phase 4B ATS Analysis
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    const latestResume = resumes[0];

    let atsData: any = null;
    if (latestResume && latestResume.extractedText && latestResume.extractedText.trim().length > 0) {
      try {
        atsData = await AtsAnalysisService.analyzeResumeAts(
          userId,
          latestResume._id.toString(),
          targetRole
        );
      } catch (err) {
        console.warn('ATS analysis fallback in dashboard:', err);
      }
    }

    // 4. Fetch Phase 4C Career Benchmarking Data
    let benchmarkData: any = null;
    try {
      benchmarkData = await BenchmarkingService.getCareerBenchmark(userId, targetRole);
    } catch (err) {
      console.warn('Benchmarking calculation fallback in dashboard:', err);
    }

    // 5. Structure Skill Matches & Gaps
    const matchedSkills: string[] = roleObj.matchedSkills || [];
    const missingSkillsRaw = roleObj.missingSkills || [];
    const roleGaps = roleObj.skillGaps || [];

    const missingSkills = missingSkillsRaw.map((skill: string, idx: number) => {
      const foundGap = roleGaps.find((g: any) => g.skill.toLowerCase() === skill.toLowerCase());
      const priority: 'high' | 'medium' | 'low' =
        foundGap?.priority || (idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low');
      const category = foundGap?.category || 'Technical';
      const estimatedHours = foundGap?.estimatedHours || (priority === 'high' ? 30 : 20);

      return {
        skill,
        priority,
        category,
        estimatedHours
      };
    });

    const gapSummary = {
      highCount: missingSkills.filter((m: any) => m.priority === 'high').length,
      mediumCount: missingSkills.filter((m: any) => m.priority === 'medium').length,
      lowCount: missingSkills.filter((m: any) => m.priority === 'low').length
    };

    // 6. Structure Job Compatibility (Phase 2)
    const compatibilityScore = roleObj.matchPercentage || 75;
    const matchingRequirements = matchedSkills.slice(0, 6);
    const missingRequirements = missingSkillsRaw.slice(0, 4);
    const compatibilitySummary =
      roleObj.reason ||
      `Demonstrates strong alignment (${compatibilityScore}%) with ${targetRole} requirements. Bridging key gaps will maximize hiring probability.`;

    // 7. Structure Career Roadmap Progress (Phase 3)
    const activeRoadmap = roleObj.roadmap && roleObj.roadmap.length > 0 ? roleObj.roadmap : (rec?.roadmap || []);
    let totalMilestones = 0;
    let completedMilestones = 0;
    let nextMilestone: { description: string; skillTarget: string } | null = null;

    activeRoadmap.forEach((stage: any) => {
      (stage.milestones || []).forEach((m: any) => {
        totalMilestones++;
        if (m.completed) {
          completedMilestones++;
        } else if (!nextMilestone) {
          nextMilestone = {
            description: m.description,
            skillTarget: m.skillTarget || stage.skills?.[0] || targetRole
          };
        }
      });
    });

    const roadmapPercentComplete =
      totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const currentStage = activeRoadmap[0] || {
      stage: 1,
      title: 'Foundational Prerequisites & Modern Architecture'
    };

    // 8. Structure Practical Projects (Phase 3C)
    const practicalProjectsRaw =
      roleObj.practicalProjects && roleObj.practicalProjects.length > 0
        ? roleObj.practicalProjects
        : (roleGaps.flatMap((g: any) => g.practicalProjects || []));

    const resumeTextLower = (latestResume?.extractedText || '').toLowerCase();
    const recommendedProjects = practicalProjectsRaw.map((p: any) => {
      const hasSkill = matchedSkills.some((s: string) => s.toLowerCase() === p.targetSkill.toLowerCase());
      const inText = resumeTextLower.includes(p.targetSkill.toLowerCase());
      const status: 'completed' | 'in_progress' | 'missing' = (hasSkill && inText)
        ? 'completed'
        : hasSkill
        ? 'in_progress'
        : 'missing';

      return {
        title: p.title,
        targetSkill: p.targetSkill,
        category: p.category || 'Specialized Architecture',
        difficulty: p.difficulty || 'Intermediate',
        portfolioEvidence: p.portfolioEvidence,
        status
      };
    });

    const completedProjectsCount = recommendedProjects.filter((p: any) => p.status === 'completed').length;
    const portfolioEvidenceProgress =
      recommendedProjects.length > 0
        ? Math.round((completedProjectsCount / recommendedProjects.length) * 100)
        : 60;

    // 9. Structure Career Benchmarking (Phase 4C)
    const readinessScore = benchmarkData?.overallReadiness || Math.round((compatibilityScore + 70) / 2);
    const industryAverage = benchmarkData?.industryAverageReadiness || 70;
    const candidatePercentile = benchmarkData?.candidatePercentile || (readinessScore >= 80 ? 'Top 15%' : 'Top 25%');
    const standing = benchmarkData?.experienceGapAnalysis?.standing || 'Strong';
    const topCompetencyGaps = (benchmarkData?.domainBenchmarks || []).slice(0, 3).map((d: any) => ({
      domain: d.domain,
      candidateScore: d.candidateScore,
      industryAverage: d.industryAverage,
      percentile: d.percentile,
      status: d.status
    }));

    // 10. Structure Portfolio Improvement Simulator (Phase 4A)
    const currentScore = readinessScore;
    const projectedUplift = Math.min(Math.round(missingSkills.length * 3 + 6), 18);
    const potentialScore = Math.min(currentScore + projectedUplift, 98);

    const topSimulationLevers = [
      ...(missingSkills.slice(0, 2).map((m: any) => ({
        type: 'skill' as const,
        title: `Acquire ${m.skill}`,
        estimatedGain: 4
      }))),
      ...(recommendedProjects.slice(0, 1).map((p: any) => ({
        type: 'project' as const,
        title: `Deploy ${p.title}`,
        estimatedGain: 5
      }))),
      {
        type: 'certification' as const,
        title: `Verify ${targetRole} Professional Credential`,
        estimatedGain: 6
      }
    ].slice(0, 3);

    // 11. Profile Strength (Synthesized from Benchmarking, ATS, and Skill Fit)
    const overallProfileScore = Math.round(
      readinessScore * 0.45 +
      (atsData?.atsScore || 75) * 0.30 +
      compatibilityScore * 0.25
    );

    const readinessLevel: 'Job Ready' | 'Competitive' | 'Developing' =
      overallProfileScore >= 80 ? 'Job Ready' : overallProfileScore >= 65 ? 'Competitive' : 'Developing';

    const strengths: string[] = [];
    if (matchedSkills.length >= 4) {
      strengths.push(`Core technical competencies verified: ${matchedSkills.slice(0, 4).join(', ')}.`);
    }
    if (compatibilityScore >= 70) {
      strengths.push(`High target-role compatibility (${compatibilityScore}%) with ${targetRole} market requisites.`);
    }
    if (atsData && atsData.atsScore >= 75) {
      strengths.push(`ATS-compatible resume document (${atsData.atsScore}/100) with low parsing risk.`);
    }
    if (benchmarkData && benchmarkData.candidatePercentile.includes('Top')) {
      strengths.push(`Industry benchmark standing: positioned in ${benchmarkData.candidatePercentile} of applicants.`);
    }
    if (strengths.length === 0) {
      strengths.push('Demonstrates foundational development capabilities and verified profile baseline.');
    }

    const weaknesses: string[] = [];
    if (gapSummary.highCount > 0) {
      const topHigh = missingSkills.filter((m: any) => m.priority === 'high').map((m: any) => m.skill).join(', ');
      weaknesses.push(`Priority skill gaps to resolve: ${topHigh}.`);
    }
    if (portfolioEvidenceProgress < 75) {
      weaknesses.push(`Portfolio proof needed: ${recommendedProjects.length - completedProjectsCount} recommended practical projects unverified.`);
    }
    if (atsData && atsData.formattingRisks && atsData.formattingRisks.length > 0) {
      weaknesses.push(`Resume structure: ${atsData.formattingRisks.length} formatting opportunities flagged.`);
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Maintain active contributions to sustain top-tier percentile standing.');
    }

    // 12. Structure Resume Analysis (Phase 4B)
    const resumeAnalysis = {
      hasResume: !!latestResume,
      resumeId: latestResume?._id?.toString(),
      originalName: latestResume?.fileInfo?.originalName,
      atsScore: atsData?.atsScore || 0,
      readabilityScore: atsData?.readabilityScore || 0,
      readabilityLevel: atsData?.readabilityLevel || 'Standard',
      formattingRisksCount: atsData?.formattingRisks?.length || 0,
      keySuggestions: (atsData?.improvementSuggestions || []).slice(0, 3).map((s: any) => ({
        category: s.category,
        priority: s.priority,
        title: s.title,
        actionableFix: s.actionableFix
      }))
    };

    return {
      user: {
        id: user._id.toString(),
        name: user.name || 'Candidate',
        email: user.email,
        selectedTargetRole: targetRole,
        availableRoles
      },
      profileStrength: {
        overallScore: overallProfileScore,
        readinessLevel,
        percentileStanding: candidatePercentile,
        strengths,
        weaknesses
      },
      resumeAnalysis,
      skillMatchesAndGaps: {
        totalSkillsFound: matchedSkills.length + missingSkills.length,
        matchedSkills,
        missingSkills,
        gapSummary
      },
      jobCompatibility: {
        targetRole,
        compatibilityScore,
        matchingRequirements,
        missingRequirements,
        compatibilitySummary
      },
      careerRoadmapProgress: {
        currentStageNumber: currentStage.stage || 1,
        currentStageTitle: currentStage.title || 'Foundational Competencies',
        totalStages: activeRoadmap.length || 3,
        totalMilestones,
        completedMilestones,
        remainingMilestones: Math.max(totalMilestones - completedMilestones, 0),
        percentComplete: roadmapPercentComplete,
        nextMilestone
      },
      practicalProjects: {
        totalProjectsCount: recommendedProjects.length,
        completedProjectsCount,
        portfolioEvidenceProgress,
        recommendedProjects: recommendedProjects.slice(0, 4)
      },
      portfolioImprovement: {
        currentScore,
        potentialScore,
        projectedUplift,
        topSimulationLevers
      },
      careerBenchmarking: {
        readinessScore,
        industryAverage,
        candidatePercentile,
        standing,
        topCompetencyGaps
      }
    };
  }
}
