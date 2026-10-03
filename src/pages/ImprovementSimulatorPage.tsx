import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type {
  CareerRecommendationRecord,
  SkillEvidenceRecord,
  ResumeRecord,
  IPracticalProject,
  ISkillGap,
  ISimulatedCertification,
  ISimulatedPortfolioEvidence
} from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Sliders,
  TrendingUp,
  Sparkles,
  Plus,
  Check,
  ArrowRight,
  RotateCcw,
  Target,
  FolderGit2,
  Award,
  FileCheck2,
  AlertCircle,
  Briefcase,
  Layers,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Flame,
  ExternalLink,
  Code2,
  Map,
  Lightbulb,
  FileText
} from 'lucide-react';

// Curated industry certifications mapped to technical roles and skill domains
const getRoleCertifications = (roleName: string, missingSkills: string[]): ISimulatedCertification[] => {
  const r = roleName.toLowerCase();
  const certs: ISimulatedCertification[] = [];

  if (r.includes('devops') || r.includes('cloud')) {
    certs.push(
      {
        id: 'cert-cka',
        name: 'CKA: Certified Kubernetes Administrator',
        issuer: 'Cloud Native Computing Foundation (Linux Foundation)',
        relatedSkills: ['Kubernetes', 'Docker', 'Linux', 'Networking'],
        estimatedHours: 45,
        priority: 'high'
      },
      {
        id: 'cert-aws-saa',
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        relatedSkills: ['AWS', 'Cloud Computing', 'Security', 'Networking'],
        estimatedHours: 50,
        priority: 'high'
      },
      {
        id: 'cert-terraform',
        name: 'HashiCorp Certified: Terraform Associate (003)',
        issuer: 'HashiCorp',
        relatedSkills: ['Terraform', 'Infrastructure as Code', 'AWS'],
        estimatedHours: 30,
        priority: 'medium'
      },
      {
        id: 'cert-rhcsa',
        name: 'Red Hat Certified System Administrator (RHCSA)',
        issuer: 'Red Hat',
        relatedSkills: ['Linux', 'Bash', 'System Administration'],
        estimatedHours: 40,
        priority: 'medium'
      }
    );
  } else if (r.includes('full stack') || r.includes('frontend') || r.includes('web')) {
    certs.push(
      {
        id: 'cert-meta-frontend',
        name: 'Meta Front-End Developer Professional Certificate',
        issuer: 'Meta (Coursera)',
        relatedSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'UI/UX'],
        estimatedHours: 40,
        priority: 'high'
      },
      {
        id: 'cert-aws-dva',
        name: 'AWS Certified Developer – Associate',
        issuer: 'Amazon Web Services',
        relatedSkills: ['AWS', 'Serverless', 'Node.js', 'REST API'],
        estimatedHours: 45,
        priority: 'high'
      },
      {
        id: 'cert-openjs-node',
        name: 'OpenJS Node.js Application Developer (JSNAD)',
        issuer: 'Linux Foundation / OpenJS',
        relatedSkills: ['Node.js', 'Express', 'JavaScript', 'REST API'],
        estimatedHours: 35,
        priority: 'medium'
      },
      {
        id: 'cert-mongo-dev',
        name: 'MongoDB Certified Developer Associate',
        issuer: 'MongoDB Inc.',
        relatedSkills: ['MongoDB', 'NoSQL', 'Database Architecture'],
        estimatedHours: 25,
        priority: 'medium'
      }
    );
  } else if (r.includes('data engineer')) {
    certs.push(
      {
        id: 'cert-databricks-de',
        name: 'Databricks Certified Data Engineer Associate',
        issuer: 'Databricks',
        relatedSkills: ['Apache Spark', 'Python', 'SQL', 'Data Warehousing'],
        estimatedHours: 45,
        priority: 'high'
      },
      {
        id: 'cert-snowflake-core',
        name: 'Snowflake SnowPro Core Certification',
        issuer: 'Snowflake',
        relatedSkills: ['Snowflake', 'SQL', 'Data Warehousing', 'ETL'],
        estimatedHours: 35,
        priority: 'high'
      },
      {
        id: 'cert-gcp-pde',
        name: 'Google Cloud Professional Data Engineer',
        issuer: 'Google Cloud',
        relatedSkills: ['BigQuery', 'Apache Spark', 'Kafka', 'Airflow'],
        estimatedHours: 50,
        priority: 'medium'
      },
      {
        id: 'cert-confluent-kafka',
        name: 'Confluent Certified Developer for Apache Kafka',
        issuer: 'Confluent',
        relatedSkills: ['Kafka', 'Event Streaming', 'Distributed Systems'],
        estimatedHours: 35,
        priority: 'medium'
      }
    );
  } else if (r.includes('data analyst') || r.includes('bi')) {
    certs.push(
      {
        id: 'cert-google-da',
        name: 'Google Data Analytics Professional Certificate',
        issuer: 'Google',
        relatedSkills: ['SQL', 'Spreadsheets', 'Data Visualization', 'R', 'Python'],
        estimatedHours: 40,
        priority: 'high'
      },
      {
        id: 'cert-powerbi-pl300',
        name: 'Microsoft Certified: Power BI Data Analyst (PL-300)',
        issuer: 'Microsoft',
        relatedSkills: ['Power BI', 'DAX', 'Data Modeling', 'Business Intelligence'],
        estimatedHours: 40,
        priority: 'high'
      },
      {
        id: 'cert-tableau-spec',
        name: 'Tableau Desktop Specialist',
        issuer: 'Tableau (Salesforce)',
        relatedSkills: ['Tableau', 'Data Visualization', 'EDA'],
        estimatedHours: 30,
        priority: 'medium'
      },
      {
        id: 'cert-aws-da',
        name: 'AWS Certified Data Analytics – Specialty',
        issuer: 'Amazon Web Services',
        relatedSkills: ['SQL', 'Athena', 'S3', 'Data Pipelines'],
        estimatedHours: 50,
        priority: 'medium'
      }
    );
  } else if (r.includes('machine learning') || r.includes('ai')) {
    certs.push(
      {
        id: 'cert-aws-mls',
        name: 'AWS Certified Machine Learning – Specialty',
        issuer: 'Amazon Web Services',
        relatedSkills: ['Machine Learning', 'Python', 'MLOps', 'SageMaker'],
        estimatedHours: 55,
        priority: 'high'
      },
      {
        id: 'cert-tf-dev',
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google TensorFlow',
        relatedSkills: ['TensorFlow', 'Deep Learning', 'Python', 'Computer Vision'],
        estimatedHours: 45,
        priority: 'high'
      },
      {
        id: 'cert-gcp-pmle',
        name: 'Google Cloud Professional Machine Learning Engineer',
        issuer: 'Google Cloud',
        relatedSkills: ['Machine Learning', 'Vertex AI', 'MLOps', 'Docker'],
        estimatedHours: 50,
        priority: 'medium'
      },
      {
        id: 'cert-deeplearning-ai',
        name: 'DeepLearning.AI Machine Learning Specialization',
        issuer: 'DeepLearning.AI (Andrew Ng)',
        relatedSkills: ['Scikit-learn', 'Statistics', 'Pandas', 'NumPy'],
        estimatedHours: 40,
        priority: 'medium'
      }
    );
  } else {
    certs.push(
      {
        id: 'cert-aws-cp',
        name: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        relatedSkills: ['Cloud Computing', 'Security', 'Architecture'],
        estimatedHours: 25,
        priority: 'medium'
      },
      {
        id: 'cert-prof-tech',
        name: `Professional Technical Specialist for ${roleName}`,
        issuer: 'Industry Technical Consortium',
        relatedSkills: missingSkills.slice(0, 3),
        estimatedHours: 35,
        priority: 'high'
      }
    );
  }

  return certs;
};

// Curated tangible portfolio evidence templates mapped to missing skills and practical deliverables
const getRolePortfolioEvidenceTemplates = (
  roleName: string,
  missingSkills: string[]
): ISimulatedPortfolioEvidence[] => {
  const topSkill = missingSkills[0] || 'Core Technical Foundations';
  const secondSkill = missingSkills[1] || 'Applied Systems';

  return [
    {
      id: 'ev-github-ci',
      title: 'Production GitHub Repository with Automated CI/CD & Test Matrix',
      type: 'github_repo',
      targetSkill: topSkill,
      estimatedHours: 12,
      description: 'Clean repository with branch protection, PR validation, ESLint/Prettier formatting, automated unit test coverage, and Docker build workflows.',
      evidenceValue: 'Proves to technical hiring managers you follow professional software engineering standards, version hygiene, and continuous integration.'
    },
    {
      id: 'ev-live-deploy',
      title: 'Live Cloud-Deployed Production Application with Custom Domain & HTTPS',
      type: 'live_deployment',
      targetSkill: secondSkill,
      estimatedHours: 14,
      description: 'Publicly accessible URL with automated health checking, TLS certificate, CDN edge caching, and real-time observability.',
      evidenceValue: 'Removes all doubt regarding whether your code functions in real-world environments with actual users and networks.'
    },
    {
      id: 'ev-tech-rfc',
      title: 'Technical Architecture RFC & System Design Document (ADR)',
      type: 'technical_case_study',
      targetSkill: topSkill,
      estimatedHours: 8,
      description: 'Comprehensive markdown architectural specification documenting requirements, API contracts, schema models, performance trade-offs, and failure recovery.',
      evidenceValue: 'Demonstrates senior-level communication, system reasoning, and architectural decision-making beyond raw coding syntax.'
    },
    {
      id: 'ev-benchmark',
      title: 'Performance Benchmark & Query Optimization Case Study',
      type: 'benchmark_report',
      targetSkill: secondSkill,
      estimatedHours: 10,
      description: 'Data-backed latency and throughput report measuring system response times before and after indexing, caching, and algorithmic tuning.',
      evidenceValue: 'Highlights an analytical, performance-driven mindset that directly saves cloud infrastructure costs for engineering teams.'
    }
  ];
};

export const ImprovementSimulatorPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary API Data State
  const [recommendations, setRecommendations] = useState<CareerRecommendationRecord | null>(null);
  const [evidences, setEvidences] = useState<SkillEvidenceRecord[]>([]);
  const [resumes, setResumes] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Target Role Selection
  const roleFromUrl = searchParams.get('role');
  const roleFromStorage = typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') : null;
  const [selectedRoleName, setSelectedRoleName] = useState<string>(roleFromUrl || roleFromStorage || '');

  // Simulation Levers State (Purely client-side state, never mutates database)
  const [simulatedSkills, setSimulatedSkills] = useState<Set<string>>(new Set());
  const [simulatedProjects, setSimulatedProjects] = useState<Set<string>>(new Set());
  const [simulatedCertifications, setSimulatedCertifications] = useState<Set<string>>(new Set());
  const [simulatedEvidence, setSimulatedEvidence] = useState<Set<string>>(new Set());

  // Custom Certification Addition
  const [customCertName, setCustomCertName] = useState('');
  const [customCertIssuer, setCustomCertIssuer] = useState('');
  const [customCertSkill, setCustomCertSkill] = useState('');
  const [customCertHours, setCustomCertHours] = useState(25);
  const [customCerts, setCustomCerts] = useState<ISimulatedCertification[]>([]);
  const [showAddCertModal, setShowAddCertModal] = useState(false);

  // Active Lever Tab: 'skills' | 'projects' | 'certifications' | 'evidence'
  const [activeTab, setActiveTab] = useState<'skills' | 'projects' | 'certifications' | 'evidence'>('skills');

  // Search filter for missing skills
  const [skillSearchQuery, setSkillSearchQuery] = useState('');

  // Fetch all user profile data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [recRes, evidRes, resumeRes] = await Promise.allSettled([
        apiClient.get<CareerRecommendationRecord>('/recommendations'),
        apiClient.get<SkillEvidenceRecord[]>('/skills/evidence'),
        apiClient.get<ResumeRecord[]>('/resume/me')
      ]);

      if (recRes.status === 'fulfilled' && recRes.value.data) {
        setRecommendations(recRes.value.data);
        if (!selectedRoleName) {
          const defaultRole =
            roleFromUrl ||
            roleFromStorage ||
            recRes.value.data.targetRole ||
            recRes.value.data.recommendedRoles?.[0]?.role ||
            'Full Stack Developer';
          setSelectedRoleName(defaultRole);
          localStorage.setItem('careerlens_selected_target_role', defaultRole);
        }
      } else if (recRes.status === 'rejected') {
        throw new Error('Unable to retrieve career recommendations.');
      }

      if (evidRes.status === 'fulfilled') {
        setEvidences(evidRes.value.data || []);
      }

      if (resumeRes.status === 'fulfilled') {
        setResumes(resumeRes.value.data || []);
      }
    } catch (err: any) {
      console.error('Simulator data load error:', err);
      setError(err.message || 'Failed to initialize the Portfolio Improvement Simulator.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sync role if query parameter updates
  useEffect(() => {
    if (roleFromUrl && roleFromUrl.trim().toLowerCase() !== selectedRoleName.trim().toLowerCase()) {
      setSelectedRoleName(roleFromUrl.trim());
      localStorage.setItem('careerlens_selected_target_role', roleFromUrl.trim());
    }
  }, [roleFromUrl]);

  // Current active recommended role object based on selectedRoleName
  const activeRole = useMemo(() => {
    if (!recommendations?.recommendedRoles || recommendations.recommendedRoles.length === 0) return null;
    const target = (selectedRoleName || recommendations.targetRole || '').trim().toLowerCase();
    const found = recommendations.recommendedRoles.find(
      r => r.role.trim().toLowerCase() === target
    );
    return found || recommendations.recommendedRoles[0];
  }, [recommendations, selectedRoleName]);

  // Handle Target Role Switch
  const handleSelectRole = (newRole: string) => {
    setSelectedRoleName(newRole);
    setSearchParams({ role: newRole });
    localStorage.setItem('careerlens_selected_target_role', newRole);
    // Clear simulated selections when switching target roles to keep role baseline accurate
    setSimulatedSkills(new Set());
    setSimulatedProjects(new Set());
    setSimulatedCertifications(new Set());
    setSimulatedEvidence(new Set());
    setSkillSearchQuery('');
  };

  // Reset all simulated levers back to baseline
  const handleResetSimulation = () => {
    setSimulatedSkills(new Set());
    setSimulatedProjects(new Set());
    setSimulatedCertifications(new Set());
    setSimulatedEvidence(new Set());
  };

  // One-click helper: Simulate acquiring all high-priority missing skills
  const handleSimulateAllHighPriority = () => {
    if (!activeRole) return;
    const highSkills = (activeRole.skillGaps || [])
      .filter(g => g.priority === 'high')
      .map(g => g.skill);

    const nextSet = new Set(simulatedSkills);
    highSkills.forEach(s => nextSet.add(s));
    setSimulatedSkills(nextSet);
  };

  // Missing skills list for active role
  const availableMissingSkills = useMemo(() => {
    if (!activeRole) return [];
    return activeRole.missingSkills || [];
  }, [activeRole]);

  // Skill gaps with metadata
  const roleSkillGaps = useMemo(() => {
    if (!activeRole) return [];
    if (activeRole.skillGaps && activeRole.skillGaps.length > 0) {
      return activeRole.skillGaps;
    }
    return availableMissingSkills.map((skill, idx) => ({
      skill,
      category: 'Technical Competency',
      priority: (idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      demandFrequency: idx < 2 ? 3 : 1,
      recommendedLearningArea: `Targeted architectural implementation patterns for ${skill} in ${activeRole.role}.`,
      estimatedHours: idx < 2 ? 30 : idx < 4 ? 20 : 12,
      suggestedProjects: [`Production ${skill} Implementation`],
      learningResources: []
    }));
  }, [activeRole, availableMissingSkills]);

  // Available practical projects for active role
  const availableProjects: IPracticalProject[] = useMemo(() => {
    if (!activeRole) return [];
    if (activeRole.practicalProjects && activeRole.practicalProjects.length > 0) {
      return activeRole.practicalProjects;
    }
    const fromGaps = (activeRole.skillGaps || []).flatMap(g => g.practicalProjects || []);
    if (fromGaps.length > 0) return fromGaps;

    // Derived from roadmap stages if available
    const fromRoadmap = (activeRole.roadmap || []).flatMap(st => {
      const projs: IPracticalProject[] = [];
      if (st.recommendedProject) {
        projs.push({
          title: st.recommendedProject.title,
          targetSkill: st.recommendedProject.targetSkill || st.skills[0] || 'Core',
          category: 'Stage Deliverable',
          difficulty: (st.stageLevel === 'beginner' ? 'Beginner' : st.stageLevel === 'advanced' ? 'Advanced' : 'Intermediate') as any,
          portfolioEvidence: st.recommendedProject.portfolioEvidence || 'Validates practical capability.',
          estimatedHours: 20,
          keyDeliverables: st.recommendedProject.keyDeliverables || ['Functional implementation', 'Tests'],
          architectureOverview: 'Client -> Service -> Persistence'
        });
      }
      if (st.practicalProjects) {
        projs.push(...st.practicalProjects);
      }
      return projs;
    });

    if (fromRoadmap.length > 0) return fromRoadmap;

    return availableMissingSkills.map(skill => ({
      title: `Hands-on Production ${skill} Implementation`,
      targetSkill: skill,
      category: 'Technical Project',
      difficulty: 'Intermediate' as const,
      portfolioEvidence: `Demonstrates verified capability to build, test, and deploy production-grade solutions with ${skill}.`,
      estimatedHours: 18,
      keyDeliverables: [
        `Production ${skill} configuration and module architecture`,
        `Automated test suite and error handling routines`,
        `README with architecture diagrams and trade-off analysis`
      ],
      architectureOverview: `Client -> ${skill} Service Layer -> Data Store`
    }));
  }, [activeRole, availableMissingSkills]);

  // Available industry certifications for active role
  const availableCertifications: ISimulatedCertification[] = useMemo(() => {
    if (!activeRole) return [];
    const baseCerts = getRoleCertifications(activeRole.role, availableMissingSkills);
    return [...baseCerts, ...customCerts];
  }, [activeRole, availableMissingSkills, customCerts]);

  // Available portfolio evidence templates
  const availableEvidence: ISimulatedPortfolioEvidence[] = useMemo(() => {
    if (!activeRole) return [];
    return getRolePortfolioEvidenceTemplates(activeRole.role, availableMissingSkills);
  }, [activeRole, availableMissingSkills]);

  // Add custom certification handler
  const handleAddCustomCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCertName) return;

    const newCert: ISimulatedCertification = {
      id: `custom-cert-${Date.now()}`,
      name: customCertName.trim(),
      issuer: customCertIssuer.trim() || 'Accredited Credential Authority',
      relatedSkills: customCertSkill
        ? customCertSkill.split(',').map(s => s.trim()).filter(Boolean)
        : availableMissingSkills.slice(0, 2),
      estimatedHours: Number(customCertHours) || 25,
      priority: 'high'
    };

    setCustomCerts(prev => [...prev, newCert]);
    // Automatically toggle on the added custom cert
    setSimulatedCertifications(prev => new Set(prev).add(newCert.id));

    setCustomCertName('');
    setCustomCertIssuer('');
    setCustomCertSkill('');
    setCustomCertHours(25);
    setShowAddCertModal(false);
  };

  // Toggle Handlers
  const toggleSkill = (skill: string) => {
    setSimulatedSkills(prev => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  };

  const toggleProject = (projectTitle: string) => {
    setSimulatedProjects(prev => {
      const next = new Set(prev);
      if (next.has(projectTitle)) {
        next.delete(projectTitle);
      } else {
        next.add(projectTitle);
      }
      return next;
    });
  };

  const toggleCert = (certId: string) => {
    setSimulatedCertifications(prev => {
      const next = new Set(prev);
      if (next.has(certId)) {
        next.delete(certId);
      } else {
        next.add(certId);
      }
      return next;
    });
  };

  const toggleEvidence = (evidenceId: string) => {
    setSimulatedEvidence(prev => {
      const next = new Set(prev);
      if (next.has(evidenceId)) {
        next.delete(evidenceId);
      } else {
        next.add(evidenceId);
      }
      return next;
    });
  };

  // ==========================================
  // DYNAMIC SIMULATION CALCULATION ENGINE
  // ==========================================
  const simulationMetrics = useMemo(() => {
    if (!activeRole) {
      return {
        baseMatch: 0,
        simulatedMatch: 0,
        deltaMatch: 0,
        currentSkills: [] as string[],
        allSkillsGained: [] as string[],
        totalSimulatedSkillsCount: 0,
        currentGaps: [] as string[],
        gapsReduced: [] as string[],
        remainingGaps: [] as string[],
        highGapsClosed: 0,
        medGapsClosed: 0,
        lowGapsClosed: 0,
        totalEffortHours: 0,
        weeksEstimate: 0,
        currentEvidenceCount: 0,
        simulatedEvidenceCount: 0,
        evidenceLevelCurrent: 'Foundational',
        evidenceLevelSimulated: 'Foundational',
        roiPer10Hours: 0,
        activeActionsCount: 0
      };
    }

    const baseMatch = activeRole.matchPercentage;
    const currentSkills = activeRole.matchedSkills || [];
    const currentGaps = activeRole.missingSkills || [];

    // 1. Unified skills gained from all 4 levers:
    // - Explicitly toggled missing skills
    // - Practical projects completed (gains project.targetSkill)
    // - Certifications earned (gains cert.relatedSkills)
    const skillsGainedSet = new Set<string>();

    simulatedSkills.forEach(s => skillsGainedSet.add(s));

    availableProjects.forEach(p => {
      if (simulatedProjects.has(p.title) && p.targetSkill) {
        skillsGainedSet.add(p.targetSkill);
      }
    });

    availableCertifications.forEach(c => {
      if (simulatedCertifications.has(c.id)) {
        (c.relatedSkills || []).forEach(s => skillsGainedSet.add(s));
      }
    });

    const allSkillsGained = Array.from(skillsGainedSet);

    // 2. Skill gaps reduced (matching case-insensitively against activeRole.missingSkills)
    const normalizedGained = new Set(allSkillsGained.map(s => s.toLowerCase()));
    const gapsReduced = currentGaps.filter(g => normalizedGained.has(g.toLowerCase()));
    const remainingGaps = currentGaps.filter(g => !normalizedGained.has(g.toLowerCase()));

    // Priority breakdown of closed gaps
    let highGapsClosed = 0;
    let medGapsClosed = 0;
    let lowGapsClosed = 0;

    gapsReduced.forEach(skillName => {
      const foundGap = roleSkillGaps.find(g => g.skill.toLowerCase() === skillName.toLowerCase());
      const p = foundGap?.priority || 'medium';
      if (p === 'high') highGapsClosed++;
      else if (p === 'medium') medGapsClosed++;
      else lowGapsClosed++;
    });

    // 3. Target-role alignment (Simulated Match Percentage):
    // Formula balances:
    // - Skill gap closures (80% weight of gap to 100%)
    // - Practical project completion bonus (+3.5% per project, up to 14%)
    // - Certification validation bonus (+4.5% per cert, up to 12%)
    // - Verified portfolio evidence attachment (+2.5% per evidence, up to 8%)
    const totalPossibleGaps = Math.max(currentGaps.length, 1);
    const maxSkillBoost = 100 - baseMatch;
    const skillClosureRatio = gapsReduced.length / totalPossibleGaps;
    const skillsGainScore = skillClosureRatio * maxSkillBoost * 0.85;

    const projectBonus = Math.min(simulatedProjects.size * 3.5, 14);
    const certBonus = Math.min(simulatedCertifications.size * 4.5, 12);
    const evidenceBonus = Math.min(simulatedEvidence.size * 2.5, 8);

    const rawSimulatedMatch = baseMatch + skillsGainScore + projectBonus + certBonus + evidenceBonus;
    const simulatedMatch = Math.min(Math.round(rawSimulatedMatch), 99);
    const deltaMatch = Math.max(simulatedMatch - baseMatch, 0);

    // 4. Estimated effort calculation (hours):
    let totalEffortHours = 0;

    // Self-study effort for directly toggled skills
    simulatedSkills.forEach(skill => {
      const gap = roleSkillGaps.find(g => g.skill.toLowerCase() === skill.toLowerCase());
      totalEffortHours += gap?.estimatedHours || 20;
    });

    // Practical project hours
    availableProjects.forEach(p => {
      if (simulatedProjects.has(p.title)) {
        totalEffortHours += p.estimatedHours || 18;
      }
    });

    // Certification study hours
    availableCertifications.forEach(c => {
      if (simulatedCertifications.has(c.id)) {
        totalEffortHours += c.estimatedHours || 35;
      }
    });

    // Evidence preparation hours
    availableEvidence.forEach(e => {
      if (simulatedEvidence.has(e.id)) {
        totalEffortHours += e.estimatedHours || 10;
      }
    });

    const weeksEstimate = totalEffortHours > 0 ? Math.max(Math.ceil(totalEffortHours / 15), 1) : 0;

    // 5. Portfolio Evidence Level
    const currentEvidenceCount = evidences.length + (resumes.length > 0 ? 1 : 0);
    const simulatedEvidenceCount =
      currentEvidenceCount +
      simulatedProjects.size +
      simulatedCertifications.size +
      simulatedEvidence.size;

    const getEvidenceLevel = (count: number) => {
      if (count >= 8) return 'Enterprise / Senior Ready';
      if (count >= 5) return 'Comprehensive Portfolio';
      if (count >= 2) return 'Solid Verified Proof';
      return 'Early / Developing Proof';
    };

    const evidenceLevelCurrent = getEvidenceLevel(currentEvidenceCount);
    const evidenceLevelSimulated = getEvidenceLevel(simulatedEvidenceCount);

    // 6. Return on Investment (ROI) efficiency: % match gain per 10 hours
    const roiPer10Hours = totalEffortHours > 0 ? Number(((deltaMatch / totalEffortHours) * 10).toFixed(1)) : 0;

    const activeActionsCount =
      simulatedSkills.size +
      simulatedProjects.size +
      simulatedCertifications.size +
      simulatedEvidence.size;

    return {
      baseMatch,
      simulatedMatch,
      deltaMatch,
      currentSkills,
      allSkillsGained,
      totalSimulatedSkillsCount: currentSkills.length + allSkillsGained.length,
      currentGaps,
      gapsReduced,
      remainingGaps,
      highGapsClosed,
      medGapsClosed,
      lowGapsClosed,
      totalEffortHours,
      weeksEstimate,
      currentEvidenceCount,
      simulatedEvidenceCount,
      evidenceLevelCurrent,
      evidenceLevelSimulated,
      roiPer10Hours,
      activeActionsCount
    };
  }, [
    activeRole,
    simulatedSkills,
    simulatedProjects,
    simulatedCertifications,
    simulatedEvidence,
    availableProjects,
    availableCertifications,
    availableEvidence,
    roleSkillGaps,
    evidences,
    resumes
  ]);

  // Filtered missing skills for Tab 1 search
  const filteredMissingSkills = useMemo(() => {
    return roleSkillGaps.filter(gap => {
      if (!skillSearchQuery) return true;
      const q = skillSearchQuery.toLowerCase();
      return gap.skill.toLowerCase().includes(q) || gap.category.toLowerCase().includes(q);
    });
  }, [roleSkillGaps, skillSearchQuery]);

  // Loading State
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-semibold mt-3 animate-pulse">
          Initializing Portfolio Improvement Simulator sandbox...
        </p>
      </div>
    );
  }

  // Error State
  if (error || !recommendations) {
    return (
      <div className="py-16 px-4 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-600 border border-rose-200">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Simulator Initialization Failed</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          {error || 'Career recommendations are required before the improvement simulator can project outcomes.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Retry Connection
          </button>
          <Link
            to="/recommendations"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
          >
            View Recommendations
          </Link>
        </div>
      </div>
    );
  }

  if (!activeRole) {
    return (
      <div className="py-16 text-center space-y-3">
        <Sliders className="w-8 h-8 text-slate-400 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">No Target Role Identified</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please upload a resume or select a target role in your profile to run the simulation engine.
        </p>
        <Link
          to="/recommendations"
          className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold inline-block"
        >
          Explore Recommended Roles
        </Link>
      </div>
    );
  }

  const roleNameDisplay = activeRole.role;

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              Portfolio Improvement Simulator
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 4A
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hidden md:inline">
              Sandbox Sandbox Mode
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model skill acquisition, practical project builds, certifications, and portfolio evidence to see real-time alignment gains for your selected target role.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetSimulation}
            disabled={simulationMetrics.activeActionsCount === 0}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            title="Reset all simulated additions"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Simulation</span>
          </button>

          <Link
            to={`/roadmap?role=${encodeURIComponent(activeRole.role)}`}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span>View Career Roadmap</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Target Role Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            Simulate Progression for Target Role:
          </span>
          <span className="text-xs text-slate-400">Simulation updates live per role</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(recommendations.recommendedRoles || []).map(r => {
            const isSelected = r.role.toLowerCase() === activeRole.role.toLowerCase();
            return (
              <button
                key={r.role}
                onClick={() => handleSelectRole(r.role)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <span>{r.role}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-white text-slate-600'
                  }`}
                >
                  {r.matchPercentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* CORE COMPARISON DASHBOARD: CURRENT VS SIMULATED PROFILE */}
      {/* ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-slate-850 to-teal-950 text-white shadow-lg space-y-6 relative overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                Phase 4A Simulation Forecast
              </span>
              <span className="text-[10px] font-bold text-slate-300">
                • Target: {roleNameDisplay}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Profile Alignment Comparison
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Evaluating how simulated skills, practical project deliverables, industry credentials, and verified GitHub proofs shift your competitiveness.
            </p>
          </div>

          {/* Quick Score Highlight Widget */}
          <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 shrink-0 self-start md:self-auto">
            <div className="text-center px-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-200">
                {simulationMetrics.baseMatch}%
              </div>
              <p className="text-[9px] text-slate-400">Baseline</p>
            </div>

            <div className="flex flex-col items-center px-1">
              <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
              {simulationMetrics.deltaMatch > 0 && (
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/90 px-1.5 py-0.2 rounded-md border border-emerald-700/80 mt-1">
                  +{simulationMetrics.deltaMatch}%
                </span>
              )}
            </div>

            <div className="text-center px-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Simulated</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                {simulationMetrics.simulatedMatch}%
              </div>
              <p className="text-[9px] text-emerald-300 font-semibold">Projected</p>
            </div>
          </div>
        </div>

        {/* Dual-State Alignment Progress Bar */}
        <div className="space-y-2 relative z-10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Target Role Alignment Projection:
            </span>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-slate-400">Baseline: {simulationMetrics.baseMatch}%</span>
              <span className="text-emerald-300">Simulated: {simulationMetrics.simulatedMatch}%</span>
              {simulationMetrics.deltaMatch > 0 && (
                <span className="text-emerald-400 font-black">
                  (Gain: +{simulationMetrics.deltaMatch}%)
                </span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-800/80 rounded-full h-3.5 overflow-hidden border border-slate-700 relative">
            {/* Projected simulated bar */}
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-all duration-500 absolute left-0 top-0"
              style={{ width: `${simulationMetrics.simulatedMatch}%` }}
            />
            {/* Baseline marker overlay */}
            <div
              className="h-full bg-emerald-700/90 transition-all duration-500 absolute left-0 top-0 border-r-2 border-white/60"
              style={{ width: `${simulationMetrics.baseMatch}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>0% Ready</span>
            <span className="text-slate-300">● Solid Candidate Baseline ({simulationMetrics.baseMatch}%)</span>
            <span>100% Core Competency</span>
          </div>
        </div>

        {/* Comparative 4-Pillar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 relative z-10">
          {/* Pillar 1: Skills Gained */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                Skills Gained
              </span>
              <span className="text-xs font-black text-emerald-400">
                +{simulationMetrics.allSkillsGained.length}
              </span>
            </div>
            <div className="text-lg font-black text-white">
              {simulationMetrics.totalSimulatedSkillsCount} Total
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-1">
              {simulationMetrics.allSkillsGained.length > 0
                ? simulationMetrics.allSkillsGained.join(', ')
                : 'No simulated skills selected yet'}
            </p>
          </div>

          {/* Pillar 2: Skill Gaps Reduced */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-rose-400" />
                Gaps Reduced
              </span>
              <span className="text-xs font-black text-emerald-400">
                -{simulationMetrics.gapsReduced.length} Closed
              </span>
            </div>
            <div className="text-lg font-black text-white">
              {simulationMetrics.remainingGaps.length} Remaining
            </div>
            <p className="text-[11px] text-slate-300">
              {simulationMetrics.highGapsClosed} High • {simulationMetrics.medGapsClosed} Med gaps closed
            </p>
          </div>

          {/* Pillar 3: Portfolio Evidence Level */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <FolderGit2 className="w-3 h-3 text-emerald-400" />
                Evidence Level
              </span>
              <span className="text-xs font-black text-emerald-400">
                {simulationMetrics.simulatedEvidenceCount} Artifacts
              </span>
            </div>
            <div className="text-sm font-black text-white truncate">
              {simulationMetrics.evidenceLevelSimulated}
            </div>
            <p className="text-[11px] text-slate-400">
              Baseline: {simulationMetrics.evidenceLevelCurrent}
            </p>
          </div>

          {/* Pillar 4: Estimated Effort & Timeline */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Estimated Effort
              </span>
              <span className="text-xs font-black text-amber-400">
                ~{simulationMetrics.totalEffortHours} hrs
              </span>
            </div>
            <div className="text-lg font-black text-white">
              {simulationMetrics.weeksEstimate > 0
                ? `~${simulationMetrics.weeksEstimate} Weeks`
                : '0 Weeks'}
            </div>
            <p className="text-[11px] text-slate-300">
              {simulationMetrics.roiPer10Hours > 0
                ? `+${simulationMetrics.roiPer10Hours}% boost / 10 hrs`
                : '15 hrs/week pace'}
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SIMULATION LEVERS (4 ACTION TABS) */}
      {/* ======================================================== */}
      <div className="space-y-4">
        {/* Lever Switcher Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Tab 1: Missing Skills */}
            <button
              onClick={() => setActiveTab('skills')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>1. Missing Skills</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'skills' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {simulatedSkills.size} / {availableMissingSkills.length}
              </span>
            </button>

            {/* Tab 2: Practical Projects */}
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'projects'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>2. Practical Projects</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'projects' ? 'bg-slate-800 text-emerald-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {simulatedProjects.size} / {availableProjects.length}
              </span>
            </button>

            {/* Tab 3: Industry Certifications */}
            <button
              onClick={() => setActiveTab('certifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'certifications'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>3. Certifications</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'certifications' ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {simulatedCertifications.size} / {availableCertifications.length}
              </span>
            </button>

            {/* Tab 4: Portfolio Evidence */}
            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-sky-500" />
              <span>4. Portfolio Evidence</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeTab === 'evidence' ? 'bg-slate-800 text-sky-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {simulatedEvidence.size} / {availableEvidence.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeTab === 'skills' && (
              <button
                onClick={handleSimulateAllHighPriority}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
              >
                <Flame className="w-3 h-3 text-emerald-600" />
                <span>Simulate All High Priority Gaps</span>
              </button>
            )}

            {activeTab === 'certifications' && (
              <button
                onClick={() => setShowAddCertModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Cert</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* LEVER TAB 1: ADDING MISSING SKILLS */}
        {/* ======================================================== */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Simulate Closing Skill Gaps for {roleNameDisplay}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any missing technical skill below to simulate having attained it. See your match score surge in real time.
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={e => setSkillSearchQuery(e.target.value)}
                  placeholder="Filter missing skills..."
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-emerald-600"
                />
              </div>
            </div>

            {filteredMissingSkills.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/70 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">No matching skill gaps</h4>
                <p className="text-xs text-slate-500">
                  {skillSearchQuery ? 'Try clearing your search query filter.' : 'All identified core skills for this role are satisfied!'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredMissingSkills.map(gap => {
                  const isSimulated = simulatedSkills.has(gap.skill);
                  const isHigh = gap.priority === 'high';
                  const isMed = gap.priority === 'medium';

                  const badgeClass = isHigh
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : isMed
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200';

                  return (
                    <div
                      key={gap.skill}
                      onClick={() => toggleSkill(gap.skill)}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between space-y-3 cursor-pointer select-none ${
                        isSimulated
                          ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                            <span>{gap.skill}</span>
                            {isSimulated && (
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-md">
                                Gained
                              </span>
                            )}
                          </h4>

                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeClass}`}>
                            {gap.priority}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {gap.recommendedLearningArea}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          ~{gap.estimatedHours || 20}h effort
                        </span>

                        <div
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            isSimulated
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          {isSimulated ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Simulated</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Simulate</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* LEVER TAB 2: COMPLETING PRACTICAL PROJECTS */}
        {/* ======================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-emerald-600" />
                Simulate Completing Practical Portfolio Projects
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulating project completion demonstrates verified capability, adds repository portfolio evidence, and automatically acquires the project's target skill.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProjects.map((project, idx) => {
                const isCompleted = simulatedProjects.has(project.title);

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                      isCompleted
                        ? 'bg-emerald-50/60 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {project.difficulty}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              Targets: {project.targetSkill}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {project.title}
                          </h4>
                        </div>

                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                          ~{project.estimatedHours}h
                        </span>
                      </div>

                      {/* Portfolio Evidence Callout */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                          <Award className="w-3 h-3 text-emerald-600" />
                          Hiring / Interview Verification Value:
                        </span>
                        <p className="text-[11px] leading-relaxed font-medium text-slate-700">
                          {project.portfolioEvidence}
                        </p>
                      </div>

                      {/* Key Deliverables */}
                      {project.keyDeliverables && project.keyDeliverables.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Simulated Deliverables:
                          </span>
                          <ul className="space-y-1">
                            {project.keyDeliverables.slice(0, 3).map((del, dIdx) => (
                              <li key={dIdx} className="text-xs text-slate-600 flex items-start gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                <span>{del}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                        {project.architectureOverview || 'Architecture Verified'}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleProject(project.title)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isCompleted
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Completed in Sandbox</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Simulate Completion</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LEVER TAB 3: ADDING CERTIFICATIONS */}
        {/* ======================================================== */}
        {activeTab === 'certifications' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  Simulate Industry Technical Certifications
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Industry credentials provide standardized proof of competency that bypasses initial recruiter screening filters.
                </p>
              </div>

              <button
                onClick={() => setShowAddCertModal(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Certification</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCertifications.map(cert => {
                const isEarned = simulatedCertifications.has(cert.id);

                return (
                  <div
                    key={cert.id}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                      isEarned
                        ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                            {cert.issuer}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 mt-1">
                            {cert.name}
                          </h4>
                        </div>

                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                          ~{cert.estimatedHours}h study
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Validates Technologies:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cert.relatedSkills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Accredited Verification
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleCert(cert.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isEarned
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isEarned ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Earned in Sandbox</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Simulate Earning</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* LEVER TAB 4: ADDING PORTFOLIO EVIDENCE */}
        {/* ======================================================== */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                Simulate Attaching Portfolio Evidence Proofs
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical employers heavily weigh public artifacts (GitHub repos, live URLs, architectural RFCs) over unsupported resume claims.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableEvidence.map(evItem => {
                const isAttached = simulatedEvidence.has(evItem.id);

                return (
                  <div
                    key={evItem.id}
                    className={`p-5 rounded-3xl border transition flex flex-col justify-between space-y-4 ${
                      isAttached
                        ? 'bg-sky-50/60 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md border border-sky-200">
                            Artifact: {evItem.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <h4 className="font-black text-sm text-slate-900 mt-1">
                            {evItem.title}
                          </h4>
                        </div>

                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                          ~{evItem.estimatedHours}h
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {evItem.description}
                      </p>

                      <div className="p-3 rounded-2xl bg-white border border-slate-200/70 text-xs text-slate-700">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Employer Evaluation Proof:
                        </span>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {evItem.evidenceValue}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-sky-700">
                        Targets: {evItem.targetSkill}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleEvidence(evItem.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                          isAttached
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {isAttached ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Attached in Sandbox</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Simulate Attaching</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* DETAILED SIDE-BY-SIDE SUMMARY & ACTIONABLE TAKEAWAYS */}
      {/* ======================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Simulation Impact Summary
            </span>
            <h3 className="text-base font-black text-slate-900 mt-1">
              Current Profile vs. Simulated Profile Outcomes
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Active sandbox levers: <strong className="text-emerald-700">{simulationMetrics.activeActionsCount}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Current Baseline Profile */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Current Baseline Profile
              </h4>
              <span className="text-xs font-black text-slate-700">
                {simulationMetrics.baseMatch}% Role Fit
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Verified Skills ({simulationMetrics.currentSkills.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {simulationMetrics.currentSkills.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Identified Skill Gaps ({simulationMetrics.currentGaps.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {simulationMetrics.currentGaps.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
              <span>Evidence Baseline:</span>
              <span className="font-bold text-slate-700">{simulationMetrics.evidenceLevelCurrent}</span>
            </div>
          </div>

          {/* Right Column: Simulated Profile Projection */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-300 ring-1 ring-emerald-400/20 space-y-3.5">
            <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Simulated Profile Projection
              </h4>
              <span className="text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                {simulationMetrics.simulatedMatch}% Projected Fit (+{simulationMetrics.deltaMatch}%)
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                Simulated Skills Gained ({simulationMetrics.allSkillsGained.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {simulationMetrics.allSkillsGained.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                    <span>{skill}</span>
                  </span>
                ))}
                {simulationMetrics.allSkillsGained.length === 0 && (
                  <p className="text-xs text-slate-400 italic">Toggle missing skills or practical projects above.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Remaining Unclosed Gaps ({simulationMetrics.remainingGaps.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {simulationMetrics.remainingGaps.map(skill => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {simulationMetrics.remainingGaps.length === 0 && (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All core gaps closed in simulation!
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs text-emerald-900">
              <span>Projected Evidence Level:</span>
              <span className="font-extrabold text-emerald-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                {simulationMetrics.evidenceLevelSimulated}
              </span>
            </div>
          </div>
        </div>

        {/* Actionable Strategy Takeaway Banner */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-emerald-950">
                Strategic Career Recommendation for {roleNameDisplay}
              </h5>
              <p className="text-slate-600 mt-0.5">
                {simulationMetrics.activeActionsCount === 0
                  ? 'Start by toggling the high-priority missing skills above to model your optimal trajectory.'
                  : `This simulated pathway achieves a +${simulationMetrics.deltaMatch}% match boost with ~${simulationMetrics.totalEffortHours} total hours of hands-on learning and artifact building.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to={`/roadmap?role=${encodeURIComponent(activeRole.role)}`}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <span>Commit Plan to Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Certification */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Add Custom Certification to Sandbox
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCertModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomCert} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  required
                  value={customCertName}
                  onChange={e => setCustomCertName(e.target.value)}
                  placeholder="e.g. Certified Kubernetes Application Developer (CKAD)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Issuing Organization
                </label>
                <input
                  type="text"
                  value={customCertIssuer}
                  onChange={e => setCustomCertIssuer(e.target.value)}
                  placeholder="e.g. Linux Foundation / Cloud Native"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Related Technologies (comma-separated)
                </label>
                <input
                  type="text"
                  value={customCertSkill}
                  onChange={e => setCustomCertSkill(e.target.value)}
                  placeholder="e.g. Kubernetes, Docker, Helm"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Estimated Study Effort (Hours)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={customCertHours}
                  onChange={e => setCustomCertHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 text-xs focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition shadow-xs"
                >
                  Add to Sandbox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementSimulatorPage;
