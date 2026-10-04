import mongoose from 'mongoose';
import {
  CareerRecommendation,
  ICareerRecommendation,
  IRecommendedRole,
  ISkillGap,
  IRoadmapStage,
  IRoadmapMilestone,
  IPracticalProject
} from '../models/CareerRecommendation.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { Resume } from '../models/Resume.js';
import { JobAnalysis } from '../models/JobAnalysis.js';
import { User } from '../models/User.js';

// Standard market taxonomy definition for career roles
const ROLE_TAXONOMY: Record<string, { skills: string[]; category: string; description: string }> = {
  'Data Analyst': {
    skills: ['Python', 'SQL', 'Power BI', 'Data Visualization', 'Tableau', 'Excel', 'Statistics', 'Pandas', 'EDA'],
    category: 'Data & Analytics',
    description: 'Transform raw data into business intelligence and actionable insights through statistical analysis and dashboards.'
  },
  'Full Stack Developer': {
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Docker', 'REST API', 'Git'],
    category: 'Software Engineering',
    description: 'Design and architect end-to-end web applications, encompassing responsive clients and resilient backend APIs.'
  },
  'Machine Learning Engineer': {
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Statistics', 'Pandas', 'NumPy', 'Docker', 'MLOps'],
    category: 'Artificial Intelligence',
    description: 'Develop and deploy predictive machine learning pipelines and mathematical models into real-world production.'
  },
  'Backend Engineer': {
    skills: ['Node.js', 'Express', 'Python', 'PostgreSQL', 'SQL', 'Redis', 'Docker', 'Microservices', 'REST API', 'Linux', 'Git'],
    category: 'Backend & Systems',
    description: 'Build high-throughput server backends, database schemas, and microservice communication pipelines.'
  },
  'Frontend Engineer': {
    skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux', 'Responsive Design', 'Git'],
    category: 'Frontend Engineering',
    description: 'Deliver high-performance, accessible, and fluid user interfaces with modern client frameworks.'
  },
  'DevOps / Cloud Engineer': {
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Git', 'Terraform', 'PostgreSQL', 'Networking', 'Python'],
    category: 'Cloud & Infrastructure',
    description: 'Automate build pipelines, container orchestration, and cloud infrastructure for highly reliable deployments.'
  },
  'Data Engineer': {
    skills: ['Python', 'SQL', 'Apache Spark', 'Kafka', 'Airflow', 'PostgreSQL', 'Docker', 'Data Warehousing', 'ETL', 'Redis'],
    category: 'Data Engineering',
    description: 'Construct robust data pipelines, scalable storage lakes, and real-time streaming architectures.'
  }
};

export class RecommendationService {
  /**
   * Generates relevant practical projects for a specific skill and target role (Phase 3C)
   */
  static getPracticalProjectForSkill(
    skill: string,
    roleName: string,
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
  ): IPracticalProject {
    const s = skill.toLowerCase();

    // Docker
    if (s.includes('docker')) {
      return {
        title: 'Production Multi-Stage Microservice Containerization',
        targetSkill: 'Docker',
        category: 'DevOps & Containers',
        difficulty,
        portfolioEvidence: 'Validates ability to author production-hardened Dockerfiles, minimize container footprint with Alpine/distroless multi-stage builds, and orchestrate multi-container local environments with Docker Compose.',
        estimatedHours: 18,
        keyDeliverables: [
          'Multi-stage Dockerfile adhering to non-root security principles',
          'docker-compose.yml networking client, API, database, and Redis cache',
          'Automated container health check probes and restart policies'
        ],
        architectureOverview: 'Client SPA -> Nginx Reverse Proxy -> Node.js Express API -> PostgreSQL & Redis Volumes'
      };
    }

    // Kubernetes
    if (s.includes('kubernetes')) {
      return {
        title: 'Resilient Microservices Orchestration with Kubernetes & Helm',
        targetSkill: 'Kubernetes',
        category: 'Cloud & Infrastructure',
        difficulty: 'Advanced',
        portfolioEvidence: 'Proves enterprise readiness in configuring Horizontal Pod Autoscalers (HPA), Ingress controllers, declarative Secrets/ConfigMaps, and zero-downtime rolling deployment strategies.',
        estimatedHours: 24,
        keyDeliverables: [
          'K8s Deployment, Service, and Ingress manifests with TLS termination',
          'ConfigMap and Secret isolation with resource requests/limits',
          'HPA configuration with CPU and memory utilization thresholds'
        ],
        architectureOverview: 'Cluster Ingress -> Service Mesh -> Auto-scaled ReplicaSets -> StatefulSet DB'
      };
    }

    // AWS / Cloud
    if (s.includes('aws') || s.includes('cloud')) {
      return {
        title: 'Serverless Event-Driven Infrastructure on AWS',
        targetSkill: 'AWS',
        category: 'Cloud Computing',
        difficulty,
        portfolioEvidence: 'Demonstrates practical competence in architecting scalable serverless pipelines using AWS Lambda, S3, SQS/SNS, and DynamoDB with IAM least-privilege policies.',
        estimatedHours: 20,
        keyDeliverables: [
          'Event-driven AWS Lambda ingestion pipeline triggered by S3 bucket events',
          'SQS dead-letter queues handling transient downstream processing failures',
          'CloudWatch dashboards with custom error rate and latency alarms'
        ],
        architectureOverview: 'S3 Event -> SQS Queue -> Lambda Worker -> DynamoDB -> CloudWatch Metrics'
      };
    }

    // Terraform
    if (s.includes('terraform')) {
      return {
        title: 'Infrastructure-as-Code AWS VPC & Cluster Automation',
        targetSkill: 'Terraform',
        category: 'Infrastructure as Code',
        difficulty: 'Advanced',
        portfolioEvidence: 'Validates proficiency with modular HCL, remote S3 state management with DynamoDB state locking, and multi-environment reproducible cloud provisioning.',
        estimatedHours: 22,
        keyDeliverables: [
          'Modular Terraform modules for multi-AZ VPC, subnets, and NAT gateways',
          'Remote S3 backend with DynamoDB state locking for team concurrency',
          'CI/CD terraform plan/apply validation with automated linting'
        ],
        architectureOverview: 'Git PR -> GitHub Actions Terraform Plan -> AWS VPC & EKS Cluster Provisioning'
      };
    }

    // CI/CD
    if (s.includes('ci/cd') || s.includes('actions') || s.includes('pipeline')) {
      return {
        title: 'Automated Enterprise CI/CD Pipeline with GitHub Actions',
        targetSkill: 'CI/CD',
        category: 'DevOps & Automation',
        difficulty,
        portfolioEvidence: 'Shows employers you can construct resilient deployment pipelines with branch protection, matrix testing, security vulnerability scanning, and automated artifact publishing.',
        estimatedHours: 16,
        keyDeliverables: [
          'GitHub Actions workflow running linting, unit tests, and coverage enforcement',
          'Automated Docker build, security vulnerability scanning (Trivy), and registry push',
          'Automated staging deployment with rollback triggers on healthcheck failure'
        ],
        architectureOverview: 'Git Push -> Matrix Test -> Trivy Scan -> Docker Registry -> Staging Deploy'
      };
    }

    // Apache Spark
    if (s.includes('spark')) {
      return {
        title: 'Distributed Big Data Lakehouse Pipeline with PySpark',
        targetSkill: 'Apache Spark',
        category: 'Big Data & Distributed Computing',
        difficulty: 'Advanced',
        portfolioEvidence: 'Exhibits ability to process multi-gigabyte analytical datasets using distributed DataFrame transformations, partitioning, caching, and Parquet storage optimization.',
        estimatedHours: 25,
        keyDeliverables: [
          'PySpark data transformation script with window functions and schema enforcement',
          'Partitioned columnar Parquet data warehouse tables optimized for querying',
          'Spark benchmark report demonstrating shuffle optimization and broadcast joins'
        ],
        architectureOverview: 'Raw Log Ingestion -> PySpark Distributed Processing -> Partitioned Parquet Lakehouse'
      };
    }

    // Kafka
    if (s.includes('kafka')) {
      return {
        title: 'Real-Time Event Streaming & Ingestion Architecture with Kafka',
        targetSkill: 'Kafka',
        category: 'Distributed Messaging',
        difficulty: 'Advanced',
        portfolioEvidence: 'Demonstrates practical knowledge of decoupled pub/sub message brokers, consumer group offset management, backpressure control, and schema serialization.',
        estimatedHours: 22,
        keyDeliverables: [
          'High-throughput producer publishing simulated sensor telemetry with JSON schema',
          'Consumer group workers processing partitions concurrently with idempotency',
          'Dead-letter topic handling schema validation and parsing anomalies'
        ],
        architectureOverview: 'Producer Client -> Kafka Topic Partitioning -> Consumer Workers -> TimescaleDB'
      };
    }

    // Airflow
    if (s.includes('airflow')) {
      return {
        title: 'Orchestrated Multi-Stage Data Pipeline with Apache Airflow',
        targetSkill: 'Airflow',
        category: 'Workflow Orchestration',
        difficulty,
        portfolioEvidence: 'Shows mastery of declarative DAG modeling, task dependencies, idempotent retries, backfilling, and operational alerting for enterprise ETL pipelines.',
        estimatedHours: 20,
        keyDeliverables: [
          'Declarative Airflow DAG with custom Python operators and Postgres sensors',
          'SLA and retry policies with automated Slack/Email alert integration',
          'Docker Compose stack running Airflow Webserver, Scheduler, and Worker'
        ],
        architectureOverview: 'Airflow Scheduler -> Extraction DAG -> Data Cleansing Task -> Warehouse Load'
      };
    }

    // Power BI
    if (s.includes('power bi')) {
      return {
        title: 'Executive Sales & Cohort Retention Intelligence Dashboard',
        targetSkill: 'Power BI',
        category: 'Business Intelligence',
        difficulty,
        portfolioEvidence: 'Proves ability to construct interactive executive dashboards with star-schema data models, complex DAX calculations, and dynamic drill-through filters.',
        estimatedHours: 18,
        keyDeliverables: [
          'Star-schema dimensional data model connecting Fact tables with Date/Product dims',
          'Dynamic DAX measures for Year-over-Year revenue growth and customer retention rates',
          'Interactive executive summary with drill-through detail views and custom slicers'
        ],
        architectureOverview: 'Relational SQL Source -> Dimensional Star Schema -> Interactive Power BI Dashboard'
      };
    }

    // Tableau
    if (s.includes('tableau')) {
      return {
        title: 'Strategic Executive Business Intelligence Storyboard in Tableau',
        targetSkill: 'Tableau',
        category: 'Data Visualization & BI',
        difficulty: 'Advanced',
        portfolioEvidence: 'Demonstrates expert visual storytelling, Level of Detail (LOD) expressions, parameter actions, and responsive layout formatting.',
        estimatedHours: 18,
        keyDeliverables: [
          'Interactive Tableau workbook with LOD expressions for cohort calculations',
          'Parameter actions enabling user-driven metric toggling and scenario testing',
          'Comprehensive executive presentation deck interpreting business drivers'
        ],
        architectureOverview: 'Clean Analytical Dataset -> Tableau Data Engine -> Interactive Executive Storyboard'
      };
    }

    // Machine Learning / Scikit-learn / PyTorch / TensorFlow
    if (s.includes('machine learning') || s.includes('scikit') || s.includes('tensorflow') || s.includes('pytorch')) {
      return {
        title: 'End-to-End Customer Churn Prediction & Scoring API',
        targetSkill: skill,
        category: 'Applied Machine Learning',
        difficulty: 'Intermediate',
        portfolioEvidence: 'Validates proficiency across the entire ML lifecycle: exploratory feature engineering, model selection, hyperparameter tuning, and REST API inference serving.',
        estimatedHours: 22,
        keyDeliverables: [
          'Jupyter Notebook with exploratory feature engineering and class imbalance handling',
          'Trained classification model evaluated with ROC-AUC and precision-recall metrics',
          'FastAPI microservice serving real-time churn prediction probabilities'
        ],
        architectureOverview: 'Customer Data -> Feature Pipeline -> Trained Model -> FastAPI Scoring Endpoint'
      };
    }

    // PostgreSQL / MongoDB / SQL
    if (s.includes('postgres') || s.includes('mongo') || s.includes('sql')) {
      return {
        title: 'High-Concurrency Database Architecture & Query Optimization',
        targetSkill: skill,
        category: 'Database Architecture',
        difficulty,
        portfolioEvidence: 'Demonstrates advanced database competence: complex joins/aggregations, compound indexing, query execution plan tuning (EXPLAIN ANALYZE), and transactional integrity.',
        estimatedHours: 18,
        keyDeliverables: [
          'Normalized relational schema or document model with indexing strategies',
          'Query execution benchmark comparing performance before and after compound indexing',
          'Transactional operations with atomic commits and optimistic concurrency control'
        ],
        architectureOverview: 'Application Tier -> Connection Pool -> Database Engine with Compound Indexes'
      };
    }

    // React / Next.js / TypeScript
    if (s.includes('react') || s.includes('next') || s.includes('typescript')) {
      return {
        title: 'Type-Safe Reactive Dashboard with Component Design System',
        targetSkill: skill,
        category: 'Frontend Engineering',
        difficulty,
        portfolioEvidence: 'Proves ability to engineer scalable client applications with strict type safety, modular component architecture, accessible UI design, and responsive layouts.',
        estimatedHours: 20,
        keyDeliverables: [
          'Accessible component library styled with Tailwind CSS and responsive design',
          'Custom React hooks for asynchronous data fetching, caching, and state synchronization',
          'End-to-end form workflows with Zod schema validation and error boundaries'
        ],
        architectureOverview: 'React Custom Hooks -> Tailwind Components -> Type-Safe API Client'
      };
    }

    // Node.js / Express
    if (s.includes('node') || s.includes('express')) {
      return {
        title: 'Resilient RESTful Microservice with Authentication & Rate Limiting',
        targetSkill: skill,
        category: 'Backend & Systems',
        difficulty,
        portfolioEvidence: 'Shows employers you can construct production-ready APIs with JWT authentication, role-based access control, input validation, and structured error handling.',
        estimatedHours: 18,
        keyDeliverables: [
          'REST API endpoints with JWT auth middleware and role-based permissions',
          'Input sanitization and request schema validation with informative error payloads',
          'Redis token-bucket rate limiting protecting against denial-of-service abuse'
        ],
        architectureOverview: 'Client Request -> Rate Limiter -> JWT Auth Middleware -> Controller -> Database'
      };
    }

    // Python / Pandas / Statistics / EDA
    if (s.includes('pandas') || s.includes('python') || s.includes('statistics') || s.includes('eda')) {
      return {
        title: 'Automated Exploratory Data Analysis & Statistical Profiling Engine',
        targetSkill: skill,
        category: 'Data Science & Analysis',
        difficulty,
        portfolioEvidence: 'Demonstrates mastery of multivariate hypothesis testing, statistical distribution analysis, data wrangling with Pandas, and actionable insight synthesis.',
        estimatedHours: 16,
        keyDeliverables: [
          'Python data wrangling script cleaning multi-source messy survey or sales records',
          'Statistical profiling module calculating correlation matrices and significance tests',
          'Markdown / HTML analytical report summarizing statistical findings and charts'
        ],
        architectureOverview: 'Disparate Datasets -> Pandas Cleansing Pipeline -> Statistical Profiling -> Executive Report'
      };
    }

    // Linux / Networking / Git
    if (s.includes('linux') || s.includes('network') || s.includes('git')) {
      return {
        title: 'Automated Server Hardening & Infrastructure Telemetry Daemon',
        targetSkill: skill,
        category: 'Systems & Administration',
        difficulty: 'Beginner',
        portfolioEvidence: 'Shows command of Linux POSIX administration, systemd service management, secure SSH configuration, and automated Bash/Python administration tooling.',
        estimatedHours: 14,
        keyDeliverables: [
          'Automated server provisioning script enforcing firewall and SSH hardening',
          'Systemd daemon monitoring process memory thresholds and streaming log alerts',
          'Git repository with branch protection rules and reproducible setup scripts'
        ],
        architectureOverview: 'Linux Kernel -> Systemd Daemon -> Bash/Python Health Probe -> Alert Webhook'
      };
    }

    // Default Fallback
    return {
      title: `Hands-on ${skill} Production Verification Project for ${roleName}`,
      targetSkill: skill,
      category: 'Specialized Implementation',
      difficulty,
      portfolioEvidence: `Validates practical capability to implement and deploy production-grade solutions using ${skill} within modern ${roleName} environments.`,
      estimatedHours: 16,
      keyDeliverables: [
        `Modular architecture blueprint incorporating industry best practices for ${skill}`,
        `Comprehensive test suite validating functional requirements and edge cases`,
        `README documentation detailing setup, configuration, and architecture trade-offs`
      ],
      architectureOverview: `Domain Client -> ${skill} Service Layer -> Persistence & Observability`
    };
  }

  /**
   * Retrieves or computes recommendations for the user
   */
  static async getRecommendations(userId: string): Promise<ICareerRecommendation> {
    const existing = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });
    if (existing) {
      let needsSave = false;
      for (const r of existing.recommendedRoles) {
        if (!r.roadmap || r.roadmap.length === 0) {
          r.roadmap = RecommendationService.generateRoleRoadmap(
            r.role,
            r.missingSkills || [],
            r.matchedSkills || []
          );
          needsSave = true;
        }
        if (!r.practicalProjects || r.practicalProjects.length === 0) {
          r.practicalProjects = (r.missingSkills || []).map(skill =>
            RecommendationService.getPracticalProjectForSkill(skill, r.role, 'Intermediate')
          );
          needsSave = true;
        }
      }
      if (needsSave) {
        existing.markModified('recommendedRoles');
        await existing.save();
      }
      return existing;
    }
    return await this.generateRecommendations(userId);
  }

  /**
   * Generates fresh recommendations based on user's Phase 2B skills and Phase 2C job matches
   */
  static async generateRecommendations(userId: string): Promise<ICareerRecommendation> {
    const user = await User.findById(userId);
    const targetRole = (user?.targetRoles && user.targetRoles[0]) || 'Data Analyst';

    // 1. Gather all candidate skills from SkillEvidence and Resume
    const skillEvidences = await SkillEvidence.find({ userId });
    const resumes = await Resume.find({ userId, analysisStatus: 'completed' }).sort({ createdAt: -1 });
    const latestJobMatches = await JobAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(5);

    const userSkillSet = new Set<string>();

    skillEvidences.forEach(ev => {
      if (ev.skill) userSkillSet.add(ev.skill.trim());
    });

    resumes.forEach(r => {
      (r.skills || []).forEach(s => userSkillSet.add(s.trim()));
      if (r.analysisResult && Array.isArray(r.analysisResult.extractedSkills)) {
        r.analysisResult.extractedSkills.forEach((s: any) => {
          if (s.name) userSkillSet.add(s.name.trim());
        });
      }
    });

    latestJobMatches.forEach(jm => {
      (jm.matchingSkills || []).forEach(s => userSkillSet.add(s.trim()));
      (jm.matchedSkillsDetails || []).forEach(d => userSkillSet.add(d.skill.trim()));
    });

    // Fallback baseline if user has not yet uploaded a resume
    if (userSkillSet.size === 0) {
      ['Python', 'SQL', 'Data Visualization', 'Git', 'Power BI'].forEach(s => userSkillSet.add(s));
    }

    const candidateSkills = Array.from(userSkillSet);

    // 2. Identify missing skills from Phase 2C job analyses and target role taxonomy
    const missingSkillsFreq: Record<string, number> = {};

    latestJobMatches.forEach(jm => {
      (jm.missingSkills || []).forEach(skill => {
        const normalized = skill.trim();
        missingSkillsFreq[normalized] = (missingSkillsFreq[normalized] || 0) + 1;
      });
      (jm.partialSkills || []).forEach(p => {
        const normalized = p.jobSkill.trim();
        missingSkillsFreq[normalized] = (missingSkillsFreq[normalized] || 0) + 0.5;
      });
    });

    // Ensure target role skills are also evaluated
    const targetRoleTaxonomy = ROLE_TAXONOMY[targetRole] || ROLE_TAXONOMY['Data Analyst'];
    targetRoleTaxonomy.skills.forEach(skill => {
      const hasSkill = candidateSkills.some(cs => cs.toLowerCase() === skill.toLowerCase());
      if (!hasSkill) {
        missingSkillsFreq[skill] = (missingSkillsFreq[skill] || 0) + 2;
      }
    });

    // 3. Compute Career Role Recommendations
    const recommendedRoles: IRecommendedRole[] = [];

    Object.entries(ROLE_TAXONOMY).forEach(([roleName, roleData]) => {
      const totalRequired = roleData.skills.length;
      const matched = roleData.skills.filter(reqSkill =>
        candidateSkills.some(cs => cs.toLowerCase() === reqSkill.toLowerCase())
      );
      const missing = roleData.skills.filter(reqSkill =>
        !candidateSkills.some(cs => cs.toLowerCase() === reqSkill.toLowerCase())
      );

      const matchPercentage = Math.round((matched.length / totalRequired) * 100);

      let reason = '';
      if (matchPercentage >= 75) {
        reason = `Strong match (${matchPercentage}%). You already possess foundational competencies (${matched.slice(0, 3).join(', ')}).`;
      } else if (matchPercentage >= 50) {
        reason = `Moderate alignment (${matchPercentage}%). Bridging ${missing.slice(0, 2).join(' & ')} will unlock this role.`;
      } else {
        reason = `Growth pathway (${matchPercentage}%). Requires targeted development in ${missing.slice(0, 3).join(', ')}.`;
      }

      // Generate role-specific skill gaps tailored to this role's missing skills (Phase 2D + 3C)
      const roleSkillGaps: ISkillGap[] = missing.map((skill, mIdx) => {
        const isCoreRoleReq = roleData.skills.slice(0, 3).some(s => s.toLowerCase() === skill.toLowerCase());
        const freq = missingSkillsFreq[skill] || 1;
        const priority: 'high' | 'medium' | 'low' = isCoreRoleReq || mIdx < 2 ? 'high' : mIdx < 4 ? 'medium' : 'low';
        const area = this.determineLearningArea(skill);
        const practicalProj = RecommendationService.getPracticalProjectForSkill(
          skill,
          roleName,
          priority === 'high' ? 'Intermediate' : 'Beginner'
        );

        return {
          skill,
          category: area.category,
          priority,
          demandFrequency: Math.ceil(freq),
          recommendedLearningArea: area.description,
          estimatedHours: priority === 'high' ? 30 : priority === 'medium' ? 20 : 12,
          suggestedProjects: [practicalProj.title],
          practicalProjects: [practicalProj],
          learningResources: [
            {
              title: `Hands-on ${skill} Mastery for ${roleName}`,
              type: 'Interactive Tutorial & Lab',
              level: priority === 'high' ? 'Foundational to Intermediate' : 'Intermediate',
              description: `Guided architectural exercises for integrating ${skill} into ${roleName} projects.`
            },
            {
              title: `Production ${skill} Best Practices`,
              type: 'Documentation & Patterns',
              level: 'Advanced',
              description: `Industry testing, anti-patterns, and architectural standards for ${skill}.`
            }
          ]
        };
      });

      const roleRoadmap = RecommendationService.generateRoleRoadmap(roleName, missing, matched);
      const rolePracticalProjects = roleSkillGaps.flatMap(g => g.practicalProjects || []);

      recommendedRoles.push({
        role: roleName,
        matchPercentage,
        matchedSkills: matched,
        missingSkills: missing,
        reason,
        skillGaps: roleSkillGaps,
        roadmap: roleRoadmap,
        practicalProjects: rolePracticalProjects
      });
    });

    // Sort roles: target role first or highest match %
    recommendedRoles.sort((a, b) => {
      if (a.role.toLowerCase() === targetRole.toLowerCase()) return -1;
      if (b.role.toLowerCase() === targetRole.toLowerCase()) return 1;
      return b.matchPercentage - a.matchPercentage;
    });

    // 4. Construct Structured Skill Gaps
    const skillGapEntries = Object.entries(missingSkillsFreq).sort((a, b) => b[1] - a[1]);
    const skillGaps: ISkillGap[] = skillGapEntries.map(([skill, freq]) => {
      let priority: 'high' | 'medium' | 'low' = 'medium';
      if (freq >= 2 || targetRoleTaxonomy.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        priority = 'high';
      } else if (freq < 1) {
        priority = 'low';
      }

      const area = this.determineLearningArea(skill);
      const practicalProj = RecommendationService.getPracticalProjectForSkill(
        skill,
        targetRole,
        priority === 'high' ? 'Intermediate' : 'Beginner'
      );

      return {
        skill,
        category: area.category,
        priority,
        demandFrequency: Math.ceil(freq),
        recommendedLearningArea: area.description,
        estimatedHours: priority === 'high' ? 30 : priority === 'medium' ? 20 : 12,
        suggestedProjects: [practicalProj.title],
        practicalProjects: [practicalProj],
        learningResources: [
          {
            title: `Hands-on ${skill} Mastery Guide`,
            type: 'Interactive Tutorial & Lab',
            level: priority === 'high' ? 'Foundational to Intermediate' : 'Intermediate',
            description: `Guided architectural exercises for integrating ${skill} into end-to-end projects.`
          },
          {
            title: `Production ${skill} Best Practices`,
            type: 'Documentation & Patterns',
            level: 'Advanced',
            description: `Official documentation, anti-patterns, and industry testing methodologies for ${skill}.`
          }
        ]
      };
    });

    // 5. Default Primary Target Role Roadmap (3-tier Beginner -> Intermediate -> Advanced)
    const primaryRole = recommendedRoles.find(r => r.role.toLowerCase() === targetRole.toLowerCase()) || recommendedRoles[0];
    const roadmap = primaryRole?.roadmap || this.generateRoleRoadmap(targetRole, primaryRole?.missingSkills || [], primaryRole?.matchedSkills || []);

    // Compute overall readiness
    const primaryRoleMatch = primaryRole?.matchPercentage || 72;

    const recommendationData = {
      userId: new mongoose.Types.ObjectId(userId),
      targetRole,
      recommendedRoles,
      skillGaps,
      roadmap,
      overallReadiness: primaryRoleMatch,
      sourceJobAnalysisId: latestJobMatches[0]?._id
    };

    const saved = await CareerRecommendation.findOneAndUpdate(
      { userId },
      recommendationData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return saved;
  }

  /**
   * Generates a 3-Stage Beginner -> Intermediate -> Advanced Roadmap for a given role (Phase 3A, 3B, 3C)
   */
  static generateRoleRoadmap(
    roleName: string,
    missingSkills: string[],
    matchedSkills: string[]
  ): IRoadmapStage[] {
    const hasSkill = (name: string) => matchedSkills.some(s => s.toLowerCase() === name.toLowerCase());

    // Role-specific roadmap blueprints organized Beginner -> Intermediate -> Advanced
    switch (roleName) {
      case 'Full Stack Developer':
        return [
          {
            stage: 1,
            stageLevel: 'beginner',
            title: 'Foundational Prerequisites & Modern JavaScript Syntax',
            duration: '2-3 Weeks',
            estimatedHours: 35,
            prerequisites: ['Basic computational thinking', 'Familiarity with HTML/CSS fundamentals'],
            skills: ['JavaScript', 'TypeScript', 'Git', 'REST API'],
            milestones: [
              {
                description: 'Master ES6+ asynchronous JavaScript, event loop, and modular exports.',
                completed: hasSkill('JavaScript'),
                skillTarget: 'JavaScript',
                estimatedHours: 12,
                status: hasSkill('JavaScript') ? 'completed' : 'not_started'
              },
              {
                description: 'Implement static types, interfaces, and generics with TypeScript compiler setup.',
                completed: hasSkill('TypeScript'),
                skillTarget: 'TypeScript',
                estimatedHours: 15,
                status: hasSkill('TypeScript') ? 'completed' : 'not_started'
              },
              {
                description: 'Configure Git version control with feature branching and commit best practices.',
                completed: hasSkill('Git'),
                skillTarget: 'Git',
                estimatedHours: 8,
                status: hasSkill('Git') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Type-Safe Command Line & API Client Utility',
              description: 'Build a modular TypeScript CLI communicating with a public REST API featuring strict schema validation.',
              keyDeliverables: [
                'TypeScript configuration with strict type checking enabled',
                'Zod or schema validation for incoming JSON responses',
                'Comprehensive unit tests using Vitest or Jest'
              ],
              targetSkill: 'TypeScript & Git',
              portfolioEvidence: 'Proves to engineering managers that you write maintainable, type-safe code with automated testing and standard CLI architecture.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('TypeScript', roleName, 'Beginner'),
              RecommendationService.getPracticalProjectForSkill('Git', roleName, 'Beginner')
            ]
          },
          {
            stage: 2,
            stageLevel: 'intermediate',
            title: 'Core Full-Stack Architecture & Reactive Client Engineering',
            duration: '3-4 Weeks',
            estimatedHours: 50,
            prerequisites: ['Stage 1: TypeScript syntax fluency and asynchronous programming'],
            skills: ['React', 'Node.js', 'Express', 'MongoDB'],
            milestones: [
              {
                description: 'Build responsive single-page interfaces with React custom hooks and state management.',
                completed: hasSkill('React'),
                skillTarget: 'React',
                estimatedHours: 18,
                status: hasSkill('React') ? 'completed' : 'not_started'
              },
              {
                description: 'Develop structured RESTful micro-endpoints using Express with JWT authentication.',
                completed: hasSkill('Node.js') && hasSkill('Express'),
                skillTarget: 'Node.js & Express',
                estimatedHours: 18,
                status: hasSkill('Node.js') ? 'completed' : 'not_started'
              },
              {
                description: 'Design relational or document data schemas with indexing and transactional integrity.',
                completed: hasSkill('MongoDB') || hasSkill('PostgreSQL'),
                skillTarget: 'MongoDB / PostgreSQL',
                estimatedHours: 14,
                status: hasSkill('MongoDB') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Full-Stack Collaborative Productivity Platform',
              description: 'An authenticated CRUD web application with real-time UI updates, database persistence, and API rate limiting.',
              keyDeliverables: [
                'React frontend with clean Tailwind CSS component design',
                'Node/Express backend with JWT auth middleware and error handling',
                'Database models with indexing and aggregation queries'
              ],
              targetSkill: 'React, Node.js & Express',
              portfolioEvidence: 'Demonstrates end-to-end full stack execution: client-state synchronization, secure authentication, and resilient API contracts.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('React', roleName, 'Intermediate'),
              RecommendationService.getPracticalProjectForSkill('Node.js', roleName, 'Intermediate')
            ]
          },
          {
            stage: 3,
            stageLevel: 'advanced',
            title: 'Production Hardening, Containerization & Scalability',
            duration: '3-4 Weeks',
            estimatedHours: 60,
            prerequisites: ['Stage 2: Completed end-to-end full-stack application development'],
            skills: ['Docker', 'Microservices', 'PostgreSQL', 'CI/CD'],
            milestones: [
              {
                description: 'Containerize multi-tier application using multi-stage Dockerfiles and compose networks.',
                completed: hasSkill('Docker'),
                skillTarget: 'Docker',
                estimatedHours: 20,
                status: hasSkill('Docker') ? 'completed' : 'not_started'
              },
              {
                description: 'Implement relational joins, connection pooling, and ACID migrations with PostgreSQL.',
                completed: hasSkill('PostgreSQL'),
                skillTarget: 'PostgreSQL',
                estimatedHours: 18,
                status: hasSkill('PostgreSQL') ? 'completed' : 'not_started'
              },
              {
                description: 'Configure automated CI/CD pipeline running automated tests, linting, and cloud deploy.',
                completed: false,
                skillTarget: 'CI/CD Automation',
                estimatedHours: 22,
                status: 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Containerized Cloud-Ready Microservice Platform',
              description: 'Production-ready full-stack application with multi-container Docker deployment, SSL, and automated GitHub Actions.',
              keyDeliverables: [
                'Docker multi-stage build configurations with non-root security',
                'GitHub Actions workflow running linting, test suites, and automated build',
                'Live deployed application with public URL and API health checks'
              ],
              targetSkill: 'Docker & CI/CD',
              portfolioEvidence: 'Provides verifiable proof of DevOps readiness: immutable containers, automated testing gates, and production container networking.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Docker', roleName, 'Advanced'),
              RecommendationService.getPracticalProjectForSkill('CI/CD', roleName, 'Advanced')
            ]
          }
        ];

      case 'DevOps / Cloud Engineer':
        return [
          {
            stage: 1,
            stageLevel: 'beginner',
            title: 'System Foundations, Linux Administration & Automation Scripting',
            duration: '2-3 Weeks',
            estimatedHours: 35,
            prerequisites: ['Command-line basics', 'Basic computer networking concepts (IP, DNS, Ports)'],
            skills: ['Linux', 'Networking', 'Python', 'Git'],
            milestones: [
              {
                description: 'Master Linux POSIX administration: file permissions, systemd, process isolation, and SSH.',
                completed: hasSkill('Linux'),
                skillTarget: 'Linux',
                estimatedHours: 15,
                status: hasSkill('Linux') ? 'completed' : 'not_started'
              },
              {
                description: 'Write automated bash and Python infrastructure administration utilities.',
                completed: hasSkill('Python'),
                skillTarget: 'Python Scripting',
                estimatedHours: 12,
                status: hasSkill('Python') ? 'completed' : 'not_started'
              },
              {
                description: 'Implement structured Git branch workflows and pull request protection rules.',
                completed: hasSkill('Git'),
                skillTarget: 'Git',
                estimatedHours: 8,
                status: hasSkill('Git') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Automated Server Provisioning & Health Audit Daemon',
              description: 'A modular Python/Bash utility monitoring system metrics, CPU thresholds, and reporting alerts.',
              keyDeliverables: [
                'Automated health check scripts with configurable alert triggers',
                'Systemd daemon service configuration and logging',
                'Documented setup guide and reproducible execution scripts'
              ],
              targetSkill: 'Linux & Python',
              portfolioEvidence: 'Proves sysadmin fundamentals: system-level scripting, daemon lifecycle, and automated health monitoring.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Linux', roleName, 'Beginner'),
              RecommendationService.getPracticalProjectForSkill('Git', roleName, 'Beginner')
            ]
          },
          {
            stage: 2,
            stageLevel: 'intermediate',
            title: 'Containerization, CI/CD Pipelines & Cloud Architecture',
            duration: '3-4 Weeks',
            estimatedHours: 55,
            prerequisites: ['Stage 1: Linux system administration and basic scripting'],
            skills: ['Docker', 'CI/CD', 'AWS', 'PostgreSQL'],
            milestones: [
              {
                description: 'Build minimal, secure Docker images using multi-stage builds and layer caching.',
                completed: hasSkill('Docker'),
                skillTarget: 'Docker',
                estimatedHours: 20,
                status: hasSkill('Docker') ? 'completed' : 'not_started'
              },
              {
                description: 'Construct automated GitHub Actions workflows for continuous integration and registry publishing.',
                completed: hasSkill('CI/CD'),
                skillTarget: 'CI/CD Pipelines',
                estimatedHours: 18,
                status: hasSkill('CI/CD') ? 'completed' : 'not_started'
              },
              {
                description: 'Deploy resilient cloud infrastructure in AWS (VPC subnets, IAM policies, and RDS databases).',
                completed: hasSkill('AWS'),
                skillTarget: 'AWS Core Services',
                estimatedHours: 17,
                status: hasSkill('AWS') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Automated Cloud-Native Deployment Pipeline',
              description: 'A complete GitHub Actions CI/CD pipeline testing, building, and publishing containerized applications to AWS.',
              keyDeliverables: [
                'Dockerfile with multi-stage build optimization and vulnerability scanning',
                'Automated GitHub Actions workflow publishing to container registry',
                'AWS cloud configuration documentation with security groups'
              ],
              targetSkill: 'Docker & AWS',
              portfolioEvidence: 'Showcases container build automation, registry integration, and cloud workload provisioning.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Docker', roleName, 'Intermediate'),
              RecommendationService.getPracticalProjectForSkill('AWS', roleName, 'Intermediate')
            ]
          },
          {
            stage: 3,
            stageLevel: 'advanced',
            title: 'Kubernetes Orchestration, Infrastructure as Code & Observability',
            duration: '3-4 Weeks',
            estimatedHours: 65,
            prerequisites: ['Stage 2: Containerization and automated cloud pipeline experience'],
            skills: ['Kubernetes', 'Terraform', 'Networking', 'Monitoring'],
            milestones: [
              {
                description: 'Deploy and manage containerized microservices on Kubernetes with Ingress, Secrets, and HPA.',
                completed: hasSkill('Kubernetes'),
                skillTarget: 'Kubernetes',
                estimatedHours: 25,
                status: hasSkill('Kubernetes') ? 'completed' : 'not_started'
              },
              {
                description: 'Provision modular, reproducible cloud environments using Terraform Infrastructure as Code.',
                completed: hasSkill('Terraform'),
                skillTarget: 'Terraform',
                estimatedHours: 22,
                status: hasSkill('Terraform') ? 'completed' : 'not_started'
              },
              {
                description: 'Establish end-to-end observability with centralized logging, metrics dashboards, and alerts.',
                completed: false,
                skillTarget: 'Production Observability',
                estimatedHours: 18,
                status: 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Enterprise Kubernetes Platform with Terraform IaC',
              description: 'Complete infrastructure-as-code repository provisioning an EKS/GKE cluster with Helm releases and monitoring.',
              keyDeliverables: [
                'Modular Terraform code provisioning VPC, subnets, and Kubernetes cluster',
                'Kubernetes manifests with ConfigMaps, Secrets, Ingress, and Autoscaler',
                'Architecture diagram detailing zero-downtime rolling update strategy'
              ],
              targetSkill: 'Kubernetes & Terraform',
              portfolioEvidence: 'Validates senior-level infrastructure mastery: codified environments, production cluster management, and automated scaling.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Kubernetes', roleName, 'Advanced'),
              RecommendationService.getPracticalProjectForSkill('Terraform', roleName, 'Advanced')
            ]
          }
        ];

      case 'Data Engineer':
        return [
          {
            stage: 1,
            stageLevel: 'beginner',
            title: 'Relational Database Foundations, Advanced SQL & Python Data Modeling',
            duration: '2-3 Weeks',
            estimatedHours: 35,
            prerequisites: ['Basic programming syntax', 'Fundamental relational database concepts'],
            skills: ['SQL', 'Python', 'PostgreSQL', 'Git'],
            milestones: [
              {
                description: 'Write complex analytical SQL queries: CTEs, window functions, and partitioning.',
                completed: hasSkill('SQL'),
                skillTarget: 'SQL Analytics',
                estimatedHours: 15,
                status: hasSkill('SQL') ? 'completed' : 'not_started'
              },
              {
                description: 'Develop Python scripts for automated data extraction, sanitization, and typing.',
                completed: hasSkill('Python'),
                skillTarget: 'Python ETL',
                estimatedHours: 12,
                status: hasSkill('Python') ? 'completed' : 'not_started'
              },
              {
                description: 'Model normalized relational databases in PostgreSQL with indexing and constraint enforcement.',
                completed: hasSkill('PostgreSQL'),
                skillTarget: 'PostgreSQL',
                estimatedHours: 8,
                status: hasSkill('PostgreSQL') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Automated Relational ETL & Schema Validation Utility',
              description: 'A Python ingestion pipeline reading disparate CSV/JSON sources, performing validation, and loading into PostgreSQL.',
              keyDeliverables: [
                'Idempotent ingestion scripts with data type validation',
                'PostgreSQL relational schema with foreign keys and compound indexes',
                'Unit tests verifying edge-case data cleansing'
              ],
              targetSkill: 'SQL & PostgreSQL',
              portfolioEvidence: 'Proves schema modeling accuracy, data typing enforcement, and idempotent batch ingestion.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('SQL', roleName, 'Beginner'),
              RecommendationService.getPracticalProjectForSkill('Python', roleName, 'Beginner')
            ]
          },
          {
            stage: 2,
            stageLevel: 'intermediate',
            title: 'Data Warehousing, Pipeline Orchestration & Containerized Workflows',
            duration: '3-4 Weeks',
            estimatedHours: 55,
            prerequisites: ['Stage 1: Advanced SQL queries and Python data pipeline basics'],
            skills: ['Data Warehousing', 'Airflow', 'ETL', 'Docker'],
            milestones: [
              {
                description: 'Design star and snowflake dimensional schemas for business intelligence data warehouses.',
                completed: hasSkill('Data Warehousing'),
                skillTarget: 'Data Warehousing',
                estimatedHours: 18,
                status: hasSkill('Data Warehousing') ? 'completed' : 'not_started'
              },
              {
                description: 'Orchestrate scheduled, dependency-driven ETL workflows using Apache Airflow DAGs.',
                completed: hasSkill('Airflow'),
                skillTarget: 'Apache Airflow',
                estimatedHours: 20,
                status: hasSkill('Airflow') ? 'completed' : 'not_started'
              },
              {
                description: 'Containerize pipeline execution environments with Docker for reliable multi-stage builds.',
                completed: hasSkill('Docker'),
                skillTarget: 'Docker',
                estimatedHours: 17,
                status: hasSkill('Docker') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Orchestrated Batch ETL Data Warehouse Pipeline',
              description: 'An automated Airflow DAG scheduling daily batch ETL into a dimensional warehouse with alerting and data lineage.',
              keyDeliverables: [
                'Modular Airflow DAG code with custom operators and sensors',
                'Dimensional star-schema models with fact and dimension tables',
                'Docker Compose stack running Airflow scheduler, webserver, and database'
              ],
              targetSkill: 'Airflow & ETL',
              portfolioEvidence: 'Demonstrates enterprise data engineering: dependency DAGs, dimensional modeling, and scheduled task monitoring.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Airflow', roleName, 'Intermediate'),
              RecommendationService.getPracticalProjectForSkill('Docker', roleName, 'Intermediate')
            ]
          },
          {
            stage: 3,
            stageLevel: 'advanced',
            title: 'Distributed Big Data Processing & Real-Time Event Streaming',
            duration: '3-4 Weeks',
            estimatedHours: 65,
            prerequisites: ['Stage 2: Orchestrated batch pipeline and data warehouse architecture'],
            skills: ['Apache Spark', 'Kafka', 'Redis', 'Cloud Lakes'],
            milestones: [
              {
                description: 'Process large-scale distributed datasets using Apache Spark / PySpark transformations and caching.',
                completed: hasSkill('Apache Spark'),
                skillTarget: 'Apache Spark',
                estimatedHours: 25,
                status: hasSkill('Apache Spark') ? 'completed' : 'not_started'
              },
              {
                description: 'Implement real-time event streaming pub/sub pipelines using Apache Kafka topics and consumers.',
                completed: hasSkill('Kafka'),
                skillTarget: 'Apache Kafka',
                estimatedHours: 22,
                status: hasSkill('Kafka') ? 'completed' : 'not_started'
              },
              {
                description: 'Deploy scalable in-memory caching and real-time state aggregates with Redis.',
                completed: hasSkill('Redis'),
                skillTarget: 'Redis Caching',
                estimatedHours: 18,
                status: hasSkill('Redis') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Real-Time Streaming Analytics & Lakehouse Platform',
              description: 'An end-to-end streaming architecture processing event streams with Kafka and Spark into Parquet storage.',
              keyDeliverables: [
                'Kafka producer/consumer pipelines with JSON schema validation',
                'PySpark structured streaming script aggregating windowed metrics',
                'System architecture diagrams and throughput benchmark metrics'
              ],
              targetSkill: 'Apache Spark & Kafka',
              portfolioEvidence: 'Confirms ability to engineer high-throughput real-time event pipelines and distributed storage lakes.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Apache Spark', roleName, 'Advanced'),
              RecommendationService.getPracticalProjectForSkill('Kafka', roleName, 'Advanced')
            ]
          }
        ];

      case 'Data Analyst':
      default:
        return [
          {
            stage: 1,
            stageLevel: 'beginner',
            title: 'Analytical Foundations, Structured Querying & Descriptive Statistics',
            duration: '2-3 Weeks',
            estimatedHours: 30,
            prerequisites: ['Basic spreadsheet comfort', 'Numeric analysis and critical reasoning'],
            skills: ['SQL', 'Excel', 'Statistics', 'Python'],
            milestones: [
              {
                description: 'Write multi-table relational joins, groupings, aggregations, and subqueries in SQL.',
                completed: hasSkill('SQL'),
                skillTarget: 'SQL Foundations',
                estimatedHours: 12,
                status: hasSkill('SQL') ? 'completed' : 'not_started'
              },
              {
                description: 'Calculate descriptive statistics: mean, median, standard deviation, and distributions.',
                completed: hasSkill('Statistics'),
                skillTarget: 'Statistics',
                estimatedHours: 10,
                status: hasSkill('Statistics') ? 'completed' : 'not_started'
              },
              {
                description: 'Learn fundamental Python syntax and basic data operations with Jupyter Notebooks.',
                completed: hasSkill('Python'),
                skillTarget: 'Python Syntax',
                estimatedHours: 8,
                status: hasSkill('Python') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Exploratory Data Analysis & Statistical Profiling Report',
              description: 'A comprehensive Jupyter Notebook analyzing raw survey or e-commerce records with clean SQL extractions.',
              keyDeliverables: [
                'Documented SQL queries extracting customer transaction cohorts',
                'Descriptive statistical summary report with distribution histograms',
                'Clean GitHub repository with reproducible dataset instructions'
              ],
              targetSkill: 'SQL & Statistics',
              portfolioEvidence: 'Proves quantitative reasoning, accurate SQL aggregations, and data distribution profiling.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('SQL', roleName, 'Beginner'),
              RecommendationService.getPracticalProjectForSkill('Statistics', roleName, 'Beginner')
            ]
          },
          {
            stage: 2,
            stageLevel: 'intermediate',
            title: 'Data Transformation, Exploratory Analysis & Interactive Dashboards',
            duration: '3-4 Weeks',
            estimatedHours: 45,
            prerequisites: ['Stage 1: Relational SQL querying and basic statistical calculations'],
            skills: ['Pandas', 'Power BI', 'Data Visualization', 'EDA'],
            milestones: [
              {
                description: 'Clean, reshape, and merge multi-table datasets using Python Pandas and NumPy.',
                completed: hasSkill('Pandas') || hasSkill('Python'),
                skillTarget: 'Pandas & NumPy',
                estimatedHours: 16,
                status: hasSkill('Python') ? 'completed' : 'not_started'
              },
              {
                description: 'Build interactive business intelligence dashboards in Power BI with slicers and KPIs.',
                completed: hasSkill('Power BI'),
                skillTarget: 'Power BI',
                estimatedHours: 15,
                status: hasSkill('Power BI') ? 'completed' : 'not_started'
              },
              {
                description: 'Synthesize data visualization principles to communicate insights with clarity.',
                completed: hasSkill('Data Visualization'),
                skillTarget: 'Data Visualization',
                estimatedHours: 14,
                status: hasSkill('Data Visualization') ? 'completed' : 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Executive Sales & Retention Intelligence Dashboard',
              description: 'A multi-page interactive Power BI dashboard tracking revenue trends, cohort retention, and customer lifetime value.',
              keyDeliverables: [
                'Clean star-schema data model with calendar and product dimensions',
                'Dynamic DAX measures calculating Year-over-Year growth and retention rate',
                'Executive summary slide deck interpreting strategic takeaways'
              ],
              targetSkill: 'Power BI & Pandas',
              portfolioEvidence: 'Demonstrates business acumen, DAX modeling, and visual communication tailored to non-technical stakeholders.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Power BI', roleName, 'Intermediate'),
              RecommendationService.getPracticalProjectForSkill('Pandas', roleName, 'Intermediate')
            ]
          },
          {
            stage: 3,
            stageLevel: 'advanced',
            title: 'Advanced BI Modeling, Hypothesis Testing & Machine Learning Basics',
            duration: '3-4 Weeks',
            estimatedHours: 50,
            prerequisites: ['Stage 2: Interactive BI dashboard building and Pandas proficiency'],
            skills: ['Tableau', 'Machine Learning', 'A/B Testing', 'DAX'],
            milestones: [
              {
                description: 'Design advanced Tableau interactive dashboards with level-of-detail (LOD) calculations.',
                completed: hasSkill('Tableau'),
                skillTarget: 'Tableau',
                estimatedHours: 18,
                status: hasSkill('Tableau') ? 'completed' : 'not_started'
              },
              {
                description: 'Apply basic machine learning algorithms (linear regression, decision trees) for predictive insights.',
                completed: hasSkill('Machine Learning'),
                skillTarget: 'Predictive ML',
                estimatedHours: 18,
                status: hasSkill('Machine Learning') ? 'completed' : 'not_started'
              },
              {
                description: 'Design statistical A/B testing experiment plans with p-value and confidence interval evaluation.',
                completed: false,
                skillTarget: 'Hypothesis Testing',
                estimatedHours: 14,
                status: 'not_started'
              }
            ],
            recommendedProject: {
              title: 'Predictive Customer Churn Analysis & Experimentation Framework',
              description: 'An analytical case study forecasting customer churn probabilities and proposing actionable retention strategies.',
              keyDeliverables: [
                'Predictive classification notebook in Python with ROC-AUC evaluation',
                'Interactive Tableau or Power BI dashboard highlighting high-risk segments',
                'Executive report recommending retention interventions with ROI modeling'
              ],
              targetSkill: 'Tableau & Machine Learning',
              portfolioEvidence: 'Validates senior analytical skills: predictive modeling, A/B testing experimental rigor, and executive storytelling.'
            },
            practicalProjects: [
              RecommendationService.getPracticalProjectForSkill('Tableau', roleName, 'Advanced'),
              RecommendationService.getPracticalProjectForSkill('Machine Learning', roleName, 'Advanced')
            ]
          }
        ];
    }
  }

  /**
   * Updates milestone completion status and syncs state
   */
  static async updateMilestoneStatus(
    userId: string,
    stageIndex: number,
    milestoneIndex: number,
    completed: boolean,
    roleName?: string
  ): Promise<ICareerRecommendation | null> {
    const rec = await CareerRecommendation.findOne({ userId });
    if (!rec) throw new Error('Recommendation record not found');

    const statusVal = completed ? 'completed' : 'in_progress';

    // 1. If roleName is specified, find and update that role
    if (roleName) {
      const roleIndex = rec.recommendedRoles.findIndex(
        r => r.role.toLowerCase() === roleName.toLowerCase()
      );
      if (roleIndex !== -1) {
        const targetRole = rec.recommendedRoles[roleIndex];
        if (!targetRole.roadmap || targetRole.roadmap.length === 0) {
          targetRole.roadmap = RecommendationService.generateRoleRoadmap(
            targetRole.role,
            targetRole.missingSkills || [],
            targetRole.matchedSkills || []
          );
        }

        const stage = targetRole.roadmap[stageIndex];
        if (stage && stage.milestones && stage.milestones[milestoneIndex]) {
          stage.milestones[milestoneIndex].completed = completed;
          stage.milestones[milestoneIndex].status = statusVal;
        }
        rec.markModified(`recommendedRoles.${roleIndex}.roadmap`);
        rec.markModified('recommendedRoles');
      }
    }

    // 2. Also update top-level roadmap if matches or no roleName
    if (!roleName || rec.targetRole.toLowerCase() === roleName.toLowerCase()) {
      if (rec.roadmap && rec.roadmap[stageIndex] && rec.roadmap[stageIndex].milestones[milestoneIndex]) {
        rec.roadmap[stageIndex].milestones[milestoneIndex].completed = completed;
        rec.roadmap[stageIndex].milestones[milestoneIndex].status = statusVal;
        rec.markModified(`roadmap.${stageIndex}.milestones.${milestoneIndex}`);
        rec.markModified('roadmap');
      }
    }

    await rec.save();
    return rec;
  }

  static async updateProjectStatus(
    userId: string,
    projectId: string,
    completed: boolean,
    roleName?: string,
    status?: string
  ): Promise<ICareerRecommendation | null> {
    const rec = await CareerRecommendation.findOne({ userId });
    if (!rec) throw new Error('Recommendation record not found');

    if (roleName) {
      const role = rec.recommendedRoles.find(r => r.role.toLowerCase() === roleName.toLowerCase());
      if (role && role.practicalProjects) {
        const proj = role.practicalProjects.find(p => p.title.toLowerCase().includes(projectId.toLowerCase()) || p.targetSkill.toLowerCase().includes(projectId.toLowerCase()));
        if (proj) {
          rec.markModified('recommendedRoles');
        }
      }
    }

    await rec.save();
    return rec;
  }

  // Helpers
  private static determineLearningArea(skill: string): { category: string; description: string } {
    const s = skill.toLowerCase();
    if (s.includes('python') || s.includes('javascript') || s.includes('typescript') || s.includes('sql') || s.includes('go') || s.includes('java')) {
      return {
        category: 'Programming Languages',
        description: `Core language idioms, standard libraries, and high-performance algorithms in ${skill}.`
      };
    }
    if (s.includes('react') || s.includes('vue') || s.includes('angular') || s.includes('next') || s.includes('css') || s.includes('tailwind')) {
      return {
        category: 'Frontend Engineering',
        description: `Modern reactive interfaces, state management, and component architecture with ${skill}.`
      };
    }
    if (s.includes('node') || s.includes('express') || s.includes('api') || s.includes('microservice') || s.includes('redis') || s.includes('kafka')) {
      return {
        category: 'Backend & Systems',
        description: `Scalable service design, caching strategies, and event-driven backends using ${skill}.`
      };
    }
    if (s.includes('docker') || s.includes('kubernetes') || s.includes('aws') || s.includes('ci/cd') || s.includes('terraform') || s.includes('linux')) {
      return {
        category: 'DevOps & Cloud',
        description: `Infrastructure automation, container orchestration, and cloud deployments with ${skill}.`
      };
    }
    if (s.includes('machine learning') || s.includes('tensorflow') || s.includes('pytorch') || s.includes('scikit') || s.includes('statistics') || s.includes('power bi') || s.includes('tableau') || s.includes('visualization')) {
      return {
        category: 'Data & Machine Learning',
        description: `Applied mathematical modeling, exploratory data analysis, and dashboard synthesis in ${skill}.`
      };
    }
    return {
      category: 'Specialized Technical Competency',
      description: `Targeted implementation patterns and best practices for ${skill}.`
    };
  }
}
