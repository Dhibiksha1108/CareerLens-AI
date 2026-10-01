import mongoose from 'mongoose';
import { CareerRecommendation, ICareerRecommendation, IRecommendedRole, ISkillGap, IRoadmapStage } from '../models/CareerRecommendation.js';
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
   * Retrieves or computes recommendations for the user
   */
  static async getRecommendations(userId: string): Promise<ICareerRecommendation> {
    const existing = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });
    if (existing) {
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

      // Generate role-specific skill gaps tailored to this role's missing skills
      const roleSkillGaps: ISkillGap[] = missing.map((skill, mIdx) => {
        const isCoreRoleReq = roleData.skills.slice(0, 3).some(s => s.toLowerCase() === skill.toLowerCase());
        const freq = missingSkillsFreq[skill] || 1;
        const priority: 'high' | 'medium' | 'low' = isCoreRoleReq || mIdx < 2 ? 'high' : mIdx < 4 ? 'medium' : 'low';
        const area = this.determineLearningArea(skill);
        const projects = this.suggestProjectsForSkill(skill, roleName);

        return {
          skill,
          category: area.category,
          priority,
          demandFrequency: Math.ceil(freq),
          recommendedLearningArea: area.description,
          estimatedHours: priority === 'high' ? 30 : priority === 'medium' ? 20 : 12,
          suggestedProjects: projects,
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

      recommendedRoles.push({
        role: roleName,
        matchPercentage,
        matchedSkills: matched,
        missingSkills: missing,
        reason,
        skillGaps: roleSkillGaps,
        roadmap: roleRoadmap
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
      const projects = this.suggestProjectsForSkill(skill);

      return {
        skill,
        category: area.category,
        priority,
        demandFrequency: Math.ceil(freq),
        recommendedLearningArea: area.description,
        estimatedHours: priority === 'high' ? 30 : priority === 'medium' ? 20 : 12,
        suggestedProjects: projects,
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

    // If no missing skills detected, supply defaults for target role
    if (skillGaps.length === 0) {
      ['Machine Learning', 'Statistics', 'Docker', 'Cloud Deployment'].forEach(s => {
        skillGaps.push({
          skill: s,
          category: 'Core Competency',
          priority: 'medium',
          demandFrequency: 1,
          recommendedLearningArea: `Foundations of ${s}`,
          estimatedHours: 20,
          suggestedProjects: [`Implement a modular ${s} demo project`],
          learningResources: [
            {
              title: `${s} Essentials`,
              type: 'Course & Lab',
              level: 'Intermediate',
              description: `Deep-dive guide into ${s}.`
            }
          ]
        });
      });
    }

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
   * Generates a 3-Stage Beginner -> Intermediate -> Advanced Roadmap for a given role
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
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
              ]
            }
          }
        ];
    }
  }

  /**
   * Updates milestone completion status
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

  private static suggestProjectsForSkill(skill: string, roleName?: string): string[] {
    const s = skill.toLowerCase();
    const r = (roleName || '').toLowerCase();

    // DevOps / Cloud
    if (s.includes('kubernetes')) {
      return ['Production Kubernetes Cluster with Ingress & Helm', 'Self-Healing Pod Autoscaling Deployment'];
    }
    if (s.includes('docker')) {
      return ['Multi-Stage Docker Microservices Containerization', 'Docker Compose Local Distributed Dev Environment'];
    }
    if (s.includes('terraform')) {
      return ['Infrastructure-as-Code AWS VPC & EKS Cluster', 'Automated Multi-Environment Terraform State Pipeline'];
    }
    if (s.includes('ci/cd') || s.includes('actions')) {
      return ['GitHub Actions CI/CD Pipeline with Testing & Security Scanning', 'Zero-Downtime Blue/Green Deployment Workflow'];
    }
    if (s.includes('aws') || s.includes('cloud')) {
      return ['Serverless Event Processor on AWS Lambda, S3 & SQS', 'Secure Multi-AZ Web Tier with RDS & Auto Scaling'];
    }

    // Data Engineering
    if (s.includes('spark')) {
      return ['Distributed Log Ingestion & Aggregation with Apache Spark', 'PySpark Parquet ETL Pipeline on Cloud Storage'];
    }
    if (s.includes('kafka')) {
      return ['Real-Time Sensor Event Stream Pipeline with Kafka', 'High-Throughput Pub/Sub Message Queue Architecture'];
    }
    if (s.includes('airflow')) {
      return ['Automated Multi-Stage ETL Pipeline DAGs with Airflow', 'Scheduled Data Pipeline Monitoring & Slack Alerting'];
    }
    if (s.includes('data warehouse') || s.includes('snowflake')) {
      return ['Dimensional Modeling & Star Schema Analytics Warehouse', 'Snowflake Snowpipe Automated Ingestion Pipeline'];
    }

    // Full Stack & Web
    if (s.includes('react') || s.includes('next')) {
      return ['Interactive Responsive Analytics Dashboard in React', 'Modern Server-Side Rendered Web App with Next.js'];
    }
    if (s.includes('typescript')) {
      return ['Strictly-Typed Full-Stack Application with Shared Types', 'Type-Safe REST API Client with Zod Validation'];
    }
    if (s.includes('node') || s.includes('express')) {
      return ['Resilient RESTful Microservice with Authentication & Rate Limiting', 'Real-Time WebSocket Notification Service'];
    }
    if (s.includes('mongo') || s.includes('postgres') || s.includes('sql')) {
      return ['Optimized Database Schema with Indexing & Transactions', 'High-Concurrency Data Ingestion & Caching Layer'];
    }

    // Data & Machine Learning
    if (s.includes('machine learning')) {
      return ['Predictive Customer Churn Classifier Pipeline', 'Automated NLP Entity Extraction Service'];
    }
    if (s.includes('power bi') || s.includes('tableau')) {
      return ['Executive Sales & Inventory Intelligence Dashboard', 'Customer Retention Cohort Analysis with Interactive Slicers'];
    }
    if (s.includes('statistics') || s.includes('eda')) {
      return ['Exploratory Multivariate Hypothesis Testing & EDA Report', 'Statistical A/B Testing Experimentation Framework'];
    }

    return [`Production ${skill} Implementation for ${roleName || 'Production'}`, `Hands-on ${skill} Verification Module`];
  }
}
