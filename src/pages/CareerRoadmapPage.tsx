import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { CareerRecommendationRecord, IRoadmapStage, IRoadmapMilestone } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Map,
  Check,
  Clock,
  Target,
  RefreshCw,
  FolderGit2,
  AlertCircle,
  Briefcase,
  ChevronRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  Layers,
  GraduationCap
} from 'lucide-react';

// Fallback client-side generator to guarantee immediate 3-tier roadmap generation
const generateFallbackRoleRoadmap = (
  roleName: string,
  missingSkills: string[],
  matchedSkills: string[]
): IRoadmapStage[] => {
  const hasSkill = (name: string) => matchedSkills.some(s => s.toLowerCase() === name.toLowerCase());

  switch (roleName) {
    case 'Full Stack Developer':
      return [
        {
          stage: 1,
          stageLevel: 'beginner',
          title: 'Foundational Prerequisites & Modern JavaScript Syntax',
          duration: '2-3 Weeks',
          estimatedHours: 35,
          prerequisites: ['Basic computational logic', 'HTML5/CSS3 semantics & DOM basics'],
          skills: ['JavaScript', 'TypeScript', 'Git', 'REST API'],
          milestones: [
            {
              description: 'Master ES6+ asynchronous JavaScript, event loop, and modular imports/exports.',
              completed: hasSkill('JavaScript'),
              skillTarget: 'JavaScript',
              estimatedHours: 12,
              status: hasSkill('JavaScript') ? 'completed' : 'not_started'
            },
            {
              description: 'Implement static types, interfaces, generics, and compiler configuration in TypeScript.',
              completed: hasSkill('TypeScript'),
              skillTarget: 'TypeScript',
              estimatedHours: 15,
              status: hasSkill('TypeScript') ? 'completed' : 'not_started'
            },
            {
              description: 'Configure Git version control with atomic commits and branching workflows.',
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
};

export const CareerRoadmapPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CareerRecommendationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  // Active selected role state
  const roleFromUrl = searchParams.get('role');
  const [selectedRoleName, setSelectedRoleName] = useState<string>(roleFromUrl || '');

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<CareerRecommendationRecord>('/recommendations');
      if (res.data) {
        setData(res.data);
        if (!selectedRoleName) {
          setSelectedRoleName(res.data.targetRole || res.data.recommendedRoles?.[0]?.role || 'Data Analyst');
        }
      }
    } catch (err: any) {
      console.error('Failed to load roadmap:', err);
      setError(err.message || 'Unable to retrieve career roadmap.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await apiClient.post<CareerRecommendationRecord>('/recommendations/generate', {});
      if (res.data) {
        setData(res.data);
      }
    } catch (err: any) {
      console.error('Failed to regenerate roadmap:', err);
      setError(err.message || 'Failed to regenerate roadmap.');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  // Update selected role if URL query changes
  useEffect(() => {
    if (roleFromUrl && roleFromUrl !== selectedRoleName) {
      setSelectedRoleName(roleFromUrl);
    }
  }, [roleFromUrl]);

  // Current active role object
  const activeRole = useMemo(() => {
    if (!data?.recommendedRoles) return null;
    return (
      data.recommendedRoles.find(
        r => r.role.toLowerCase() === (selectedRoleName || data.targetRole).toLowerCase()
      ) || data.recommendedRoles[0]
    );
  }, [data, selectedRoleName]);

  // Dynamic 3-stage Beginner -> Intermediate -> Advanced roadmap for the selected role
  const activeRoadmapStages: IRoadmapStage[] = useMemo(() => {
    if (!activeRole) return data?.roadmap || [];

    // If backend provided a 3-stage roadmap for this role, use it
    if (activeRole.roadmap && activeRole.roadmap.length > 0) {
      return activeRole.roadmap;
    }

    // Otherwise, generate the role-specific 3-stage roadmap
    return generateFallbackRoleRoadmap(
      activeRole.role,
      activeRole.missingSkills || [],
      activeRole.matchedSkills || []
    );
  }, [activeRole, data]);

  // Milestone toggling with MongoDB persistence
  const toggleMilestone = async (stageIndex: number, milestoneIndex: number, currentCompleted: boolean) => {
    const key = `${stageIndex}-${milestoneIndex}`;
    setUpdatingMilestone(key);
    try {
      const nextCompleted = !currentCompleted;

      // Optimistic local update
      if (activeRoadmapStages[stageIndex]?.milestones[milestoneIndex]) {
        const updatedStages = [...activeRoadmapStages];
        updatedStages[stageIndex].milestones[milestoneIndex].completed = nextCompleted;
        updatedStages[stageIndex].milestones[milestoneIndex].status = nextCompleted
          ? 'completed'
          : 'in_progress';

        if (data && activeRole) {
          const updatedRoles = (data.recommendedRoles || []).map(r => {
            if (r.role === activeRole.role) {
              return { ...r, roadmap: updatedStages };
            }
            return r;
          });
          setData({ ...data, recommendedRoles: updatedRoles });
        }
      }

      await apiClient.patch<{ data: CareerRecommendationRecord }>('/recommendations/roadmap/milestone', {
        roleName: activeRole?.role,
        stageIndex,
        milestoneIndex,
        completed: nextCompleted
      });
    } catch (err: any) {
      console.error('Failed to update milestone:', err);
    } finally {
      setUpdatingMilestone(null);
    }
  };

  // Switch role handler
  const handleSelectRole = (roleName: string) => {
    setSelectedRoleName(roleName);
    setSearchParams({ role: roleName });
  };

  // Progress metrics for active role
  const { totalMilestones, completedMilestones, progressPercentage, totalHours } = useMemo(() => {
    let total = 0;
    let completed = 0;
    let hours = 0;

    activeRoadmapStages.forEach(st => {
      hours += st.estimatedHours || 30;
      (st.milestones || []).forEach(m => {
        total++;
        if (m.completed) completed++;
      });
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      totalMilestones: total,
      completedMilestones: completed,
      progressPercentage: pct,
      totalHours: hours
    };
  }, [activeRoadmapStages]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-medium mt-3">Synthesizing personalized learning roadmap...</p>
      </div>
    );
  }

  const roleNameDisplay = activeRole?.role || selectedRoleName || data?.targetRole || 'Target Career Role';

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-600" />
              Personalized Career Roadmap & Learning Path
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 3A + 3B
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-specific learning trajectory organized across Beginner → Intermediate → Advanced stages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/recommendations"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role Recommendations</span>
          </Link>
          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Re-generate'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Selection Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            Select Career Target Roadmap:
          </span>
          <span className="text-xs text-slate-400">Roadmap updates dynamically</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(data?.recommendedRoles || []).map(r => {
            const isSelected = r.role.toLowerCase() === (activeRole?.role || '').toLowerCase();
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

      {/* Target Progress Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                Phase 3A + 3B Learning Path
              </span>
              <span className="text-[10px] font-bold text-emerald-200">
                • {activeRole?.matchPercentage || 70}% Current Profile Fit
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Roadmap for {roleNameDisplay}
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Targeted progression addressing {activeRole?.missingSkills?.length || 0} identified skill gaps. Check off milestones as you learn to track verified skill readiness.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Total Hours</span>
              <div className="text-2xl font-black text-white">~{totalHours}h</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Completed</span>
              <div className="text-2xl font-black text-white">{progressPercentage}%</div>
              <p className="text-[9px] text-emerald-200">{completedMilestones} of {totalMilestones} tasks</p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-emerald-950/60 rounded-full h-2.5 overflow-hidden border border-emerald-700/60">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 3-Tier Roadmap: Beginner -> Intermediate -> Advanced */}
      <div className="space-y-6">
        {activeRoadmapStages.map((stage, stageIdx) => {
          const allCompleted = stage.milestones.length > 0 && stage.milestones.every(m => m.completed);
          const hasInProgress = stage.milestones.some(m => m.completed) && !allCompleted;

          // Distinct styling for Beginner, Intermediate, and Advanced stages
          const isBeginner = stage.stageLevel === 'beginner' || stage.stage === 1;
          const isIntermediate = stage.stageLevel === 'intermediate' || stage.stage === 2;
          const isAdvanced = stage.stageLevel === 'advanced' || stage.stage === 3;

          const levelBadgeColor = isBeginner
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : isIntermediate
            ? 'bg-sky-50 text-sky-800 border-sky-200'
            : 'bg-purple-50 text-purple-800 border-purple-200';

          const stageNumberBg = allCompleted
            ? 'bg-emerald-600 text-white'
            : isBeginner
            ? 'bg-emerald-700 text-white'
            : isIntermediate
            ? 'bg-sky-700 text-white'
            : 'bg-purple-700 text-white';

          return (
            <div
              key={`${roleNameDisplay}-${stage.stage}`}
              className={`p-6 rounded-3xl bg-white border shadow-2xs space-y-5 transition ${
                allCompleted
                  ? 'border-emerald-200 bg-emerald-50/15'
                  : hasInProgress
                  ? 'border-emerald-300 ring-1 ring-emerald-300/40'
                  : 'border-slate-200/70'
              }`}
            >
              {/* Stage Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl font-black text-xs flex items-center justify-center shadow-2xs ${stageNumberBg}`}
                  >
                    {allCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : stage.stage}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${levelBadgeColor}`}>
                        {stage.stageLevel.toUpperCase()} STAGE
                      </span>
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {stage.duration} (~{stage.estimatedHours} hrs)
                      </span>
                    </div>
                    <h3 className="font-black text-base text-slate-900 mt-1">{stage.title}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                      allCompleted
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : hasInProgress
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {allCompleted ? 'Completed' : hasInProgress ? 'In Progress' : 'Planned'}
                  </span>
                </div>
              </div>

              {/* Prerequisites Banner */}
              {stage.prerequisites && stage.prerequisites.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                  <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">
                      Prerequisites for this Stage:
                    </span>
                    <p className="mt-0.5 text-amber-900/90 font-medium leading-relaxed">
                      {stage.prerequisites.join(' • ')}
                    </p>
                  </div>
                </div>
              )}

              {/* Skills targeted in this stage */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Target Competencies:
                </span>
                {(stage.skills || []).map(skill => {
                  const isVerified = (activeRole?.matchedSkills || []).some(
                    s => s.toLowerCase() === skill.toLowerCase()
                  );
                  return (
                    <span
                      key={skill}
                      className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {isVerified && <Check className="w-3 h-3 text-emerald-600" />}
                      <span>{skill}</span>
                    </span>
                  );
                })}
              </div>

              {/* Interactive Milestones Checklist */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Actionable Learning Milestones & Progress Tracking (Click to toggle)
                  </span>
                  <span className="text-[10px] text-slate-400">Updates saved to database</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {(stage.milestones || []).map((milestone, mIdx) => {
                    const isUpdating = updatingMilestone === `${stageIdx}-${mIdx}`;
                    const statusText = milestone.completed
                      ? 'Completed'
                      : milestone.status === 'in_progress'
                      ? 'In Progress'
                      : 'Not Started';

                    const statusPill = milestone.completed
                      ? 'bg-emerald-100 text-emerald-800'
                      : milestone.status === 'in_progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200/70 text-slate-600';

                    return (
                      <div
                        key={mIdx}
                        onClick={() => toggleMilestone(stageIdx, mIdx, milestone.completed)}
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 transition cursor-pointer select-none ${
                          milestone.completed
                            ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-800'
                            : 'bg-slate-50/70 border-slate-200/70 text-slate-700 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                                milestone.completed
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-slate-300 bg-white hover:border-emerald-500'
                              }`}
                            >
                              {milestone.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`font-semibold leading-relaxed ${
                                milestone.completed ? 'line-through text-slate-500' : 'text-slate-800'
                              }`}
                            >
                              {milestone.description}
                            </span>
                            {milestone.skillTarget && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                {milestone.skillTarget}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {milestone.estimatedHours && (
                            <span className="text-[10px] font-bold text-slate-400">
                              ~{milestone.estimatedHours}h
                            </span>
                          )}
                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${statusPill}`}>
                            {statusText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Project Deliverable */}
              {stage.recommendedProject && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center gap-2">
                    <FolderGit2 className="w-4 h-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Hands-on Deliverable: {stage.recommendedProject.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {stage.recommendedProject.description}
                  </p>
                  {stage.recommendedProject.keyDeliverables && (
                    <ul className="space-y-1 pt-1">
                      {stage.recommendedProject.keyDeliverables.map((del, dIdx) => (
                        <li key={dIdx} className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
