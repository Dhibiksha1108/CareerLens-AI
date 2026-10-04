import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import type { CareerRecommendationRecord, IRoadmapStage, IRoadmapMilestone, IPracticalProject, ISkillGap } from '../types';
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
  GraduationCap,
  Code2,
  CheckCircle2,
  Award,
  ExternalLink,
  Flame,
  FileCheck2,
  SlidersHorizontal,
  BarChart3
} from 'lucide-react';

// Client-side helper to ensure practical projects are always populated
const getFallbackPracticalProject = (
  skill: string,
  roleName: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
): IPracticalProject => {
  const s = skill.toLowerCase();

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

  return {
    title: `Production ${skill} Verification Project for ${roleName}`,
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
};

// Client-side 3-stage Beginner -> Intermediate -> Advanced roadmap generator ensuring dynamic role alignment
const generateRoleRoadmapClient = (
  roleName: string,
  missingSkills: string[],
  matchedSkills: string[]
): IRoadmapStage[] => {
  const hasSkill = (name: string) =>
    matchedSkills.some(s => s.toLowerCase() === name.toLowerCase());

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
              description: 'Establish version control hygiene: semantic git commits, branching, and PR workflows.',
              completed: hasSkill('Git'),
              skillTarget: 'Git',
              estimatedHours: 8,
              status: hasSkill('Git') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Foundational Type-Safe CLI & REST Micro-Client',
            description: 'A strictly-typed CLI and client module querying public REST APIs with retry exponential backoff.',
            targetSkill: 'TypeScript',
            portfolioEvidence: 'Validates ability to write strict TypeScript configurations and consume RESTful endpoints.',
            keyDeliverables: [
              'Command-line executable with flag parsing',
              'Strict Zod schema validation for response payloads',
              'Unit test coverage mocking HTTP requests'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('TypeScript', roleName, 'Beginner'),
            getFallbackPracticalProject('REST API', roleName, 'Beginner')
          ]
        },
        {
          stage: 2,
          stageLevel: 'intermediate',
          title: 'Core Architecture, Applied Services & Full-Stack Integration',
          duration: '3-4 Weeks',
          estimatedHours: 45,
          prerequisites: ['Stage 1 Completion or verified TypeScript/REST proficiency'],
          skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker'],
          milestones: [
            {
              description: 'Build performant, accessible React interfaces with modular hooks and Tailwind styling.',
              completed: hasSkill('React'),
              skillTarget: 'React',
              estimatedHours: 18,
              status: hasSkill('React') ? 'completed' : 'not_started'
            },
            {
              description: 'Architect Express REST API with JWT authentication, role authorization, and validation middleware.',
              completed: hasSkill('Node.js') || hasSkill('Express'),
              skillTarget: 'Node.js',
              estimatedHours: 15,
              status: hasSkill('Node.js') ? 'completed' : 'not_started'
            },
            {
              description: 'Model relational schemas, migrations, indexes, and transactions in PostgreSQL.',
              completed: hasSkill('PostgreSQL') || hasSkill('SQL'),
              skillTarget: 'PostgreSQL',
              estimatedHours: 12,
              status: hasSkill('PostgreSQL') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Full-Stack Responsive Workspace Application',
            description: 'Multi-tenant web application featuring reactive client dashboard, REST API tier, and relational persistence.',
            targetSkill: 'React',
            portfolioEvidence: 'Proves end-to-end full stack competence: frontend UI, backend API routing, database schema design.',
            keyDeliverables: [
              'React SPA with Tailwind CSS responsive layout and optimistic updates',
              'Node/Express backend with JWT session authentication and rate limiting',
              'PostgreSQL schema with foreign keys and compound indexing'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('React', roleName, 'Intermediate'),
            getFallbackPracticalProject('Node.js', roleName, 'Intermediate'),
            getFallbackPracticalProject('PostgreSQL', roleName, 'Intermediate')
          ]
        },
        {
          stage: 3,
          stageLevel: 'advanced',
          title: 'Production Systems, Scalability, Caching & Specialization',
          duration: '4-5 Weeks',
          estimatedHours: 50,
          prerequisites: ['Stage 2 Full-Stack project deployment experience'],
          skills: ['Redis', 'CI/CD', 'Docker', 'AWS', 'System Design'],
          milestones: [
            {
              description: 'Multi-stage Docker containerization and Docker Compose orchestration with health probes.',
              completed: hasSkill('Docker'),
              skillTarget: 'Docker',
              estimatedHours: 16,
              status: hasSkill('Docker') ? 'completed' : 'not_started'
            },
            {
              description: 'Set up automated CI/CD pipeline running test matrix, linting, and zero-downtime deployment.',
              completed: hasSkill('CI/CD'),
              skillTarget: 'CI/CD',
              estimatedHours: 16,
              status: hasSkill('CI/CD') ? 'completed' : 'not_started'
            },
            {
              description: 'Implement distributed Redis caching layer and pub/sub message bus with backpressure handling.',
              completed: hasSkill('Redis'),
              skillTarget: 'Redis',
              estimatedHours: 18,
              status: hasSkill('Redis') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Cloud-Deployed High-Availability Microservices Stack',
            description: 'Horizontally scalable full-stack system with Redis cache layer and automated CI/CD deployment.',
            targetSkill: 'Docker',
            portfolioEvidence: 'Validates senior-level infrastructure awareness and production deployment capabilities.',
            keyDeliverables: [
              'Multi-stage Docker build producing lightweight distroless images',
              'GitHub Actions workflow with automated unit testing and container image tagging',
              'Redis caching strategy demonstrating measurable query latency reductions'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Docker', roleName, 'Advanced'),
            getFallbackPracticalProject('CI/CD', roleName, 'Advanced')
          ]
        }
      ];

    case 'DevOps Engineer':
      return [
        {
          stage: 1,
          stageLevel: 'beginner',
          title: 'Linux Systems, Scripting & Container Foundations',
          duration: '2-3 Weeks',
          estimatedHours: 35,
          prerequisites: ['Basic CLI familiarity', 'Networking fundamentals (TCP/IP, DNS, HTTP)'],
          skills: ['Linux', 'Bash', 'Docker', 'Git'],
          milestones: [
            {
              description: 'Master Linux system administration: systemd, file permissions, cron jobs, and SSH key management.',
              completed: hasSkill('Linux'),
              skillTarget: 'Linux',
              estimatedHours: 12,
              status: hasSkill('Linux') ? 'completed' : 'not_started'
            },
            {
              description: 'Author POSIX-compliant Bash automation scripts with robust error trapping and logging.',
              completed: hasSkill('Bash'),
              skillTarget: 'Bash',
              estimatedHours: 11,
              status: hasSkill('Bash') ? 'completed' : 'not_started'
            },
            {
              description: 'Construct secure, multi-stage Dockerfiles adhering to non-root execution principles.',
              completed: hasSkill('Docker'),
              skillTarget: 'Docker',
              estimatedHours: 12,
              status: hasSkill('Docker') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Production Multi-Service Container Environment',
            description: 'Automated local environment running isolated web, worker, and database services via Docker Compose.',
            targetSkill: 'Docker',
            portfolioEvidence: 'Validates container isolation, networking, volume management, and environment variable configuration.',
            keyDeliverables: [
              'Optimized multi-stage Dockerfile minimizing image layer size',
              'docker-compose.yml configuration with network isolation and volume mounts',
              'Automated container health check script with Slack/Discord alert hooks'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Docker', roleName, 'Beginner')
          ]
        },
        {
          stage: 2,
          stageLevel: 'intermediate',
          title: 'Continuous Integration, Orchestration & Cloud Infrastructure',
          duration: '3-4 Weeks',
          estimatedHours: 45,
          prerequisites: ['Stage 1 Container and Linux proficiency'],
          skills: ['Kubernetes', 'CI/CD', 'GitHub Actions', 'AWS'],
          milestones: [
            {
              description: 'Design enterprise GitHub Actions pipelines with matrix testing, cache acceleration, and image registries.',
              completed: hasSkill('CI/CD'),
              skillTarget: 'CI/CD',
              estimatedHours: 15,
              status: hasSkill('CI/CD') ? 'completed' : 'not_started'
            },
            {
              description: 'Deploy resilient Kubernetes manifests: Deployments, StatefulSets, Ingress controllers, and Helm charts.',
              completed: hasSkill('Kubernetes'),
              skillTarget: 'Kubernetes',
              estimatedHours: 18,
              status: hasSkill('Kubernetes') ? 'completed' : 'not_started'
            },
            {
              description: 'Configure foundational AWS services: VPC networking, IAM least privilege, EC2, and S3 security.',
              completed: hasSkill('AWS'),
              skillTarget: 'AWS',
              estimatedHours: 12,
              status: hasSkill('AWS') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Automated Kubernetes Deployment Pipeline',
            description: 'End-to-end GitOps workflow publishing container images to ECR/GHCR and triggering Helm releases.',
            targetSkill: 'Kubernetes',
            portfolioEvidence: 'Proves ability to build automated release pipelines delivering code safely to Kubernetes clusters.',
            keyDeliverables: [
              'Parameterized Helm chart packaging deployment, service, and ingress manifests',
              'GitHub Actions workflow with branch protection and automated artifact tagging',
              'Rolling deployment strategy with zero downtime and automatic rollback'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Kubernetes', roleName, 'Intermediate'),
            getFallbackPracticalProject('CI/CD', roleName, 'Intermediate'),
            getFallbackPracticalProject('AWS', roleName, 'Intermediate')
          ]
        },
        {
          stage: 3,
          stageLevel: 'advanced',
          title: 'Infrastructure as Code, Observability & Site Reliability Engineering',
          duration: '4-5 Weeks',
          estimatedHours: 50,
          prerequisites: ['Stage 2 CI/CD and Kubernetes experience'],
          skills: ['Terraform', 'Prometheus', 'Grafana', 'Security & Compliance'],
          milestones: [
            {
              description: 'Write declarative Terraform blueprints with remote S3 state, DynamoDB locking, and reusable modules.',
              completed: hasSkill('Terraform'),
              skillTarget: 'Terraform',
              estimatedHours: 18,
              status: hasSkill('Terraform') ? 'completed' : 'not_started'
            },
            {
              description: 'Implement Prometheus metric scrapers and Grafana dashboards for cluster resource observability.',
              completed: hasSkill('Prometheus') || hasSkill('Grafana'),
              skillTarget: 'Observability',
              estimatedHours: 16,
              status: hasSkill('Prometheus') ? 'completed' : 'not_started'
            },
            {
              description: 'Enforce secret scanning, image vulnerability checks (Trivy), and network security policies.',
              completed: hasSkill('Security'),
              skillTarget: 'Security',
              estimatedHours: 16,
              status: 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Multi-Environment Terraform Cloud Infrastructure',
            description: 'Production-ready Infrastructure-as-Code repository provisioning multi-AZ VPC, EKS cluster, and monitoring stack.',
            targetSkill: 'Terraform',
            portfolioEvidence: 'Shows senior mastery of enterprise cloud infrastructure automation and state management.',
            keyDeliverables: [
              'Modular Terraform codebase supporting staging and production environments',
              'Remote state backend with automated state locking and encryption',
              'Grafana dashboard JSON exports displaying Kubernetes node and pod metrics'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Terraform', roleName, 'Advanced')
          ]
        }
      ];

    case 'Data Engineer':
      return [
        {
          stage: 1,
          stageLevel: 'beginner',
          title: 'Advanced Relational Modeling, SQL & Scripting Pipelines',
          duration: '2-3 Weeks',
          estimatedHours: 35,
          prerequisites: ['Python syntax', 'Basic SQL queries (SELECT, JOIN, GROUP BY)'],
          skills: ['SQL', 'Python', 'PostgreSQL', 'Git'],
          milestones: [
            {
              description: 'Master advanced SQL: window functions, Common Table Expressions (CTEs), and query optimization.',
              completed: hasSkill('SQL'),
              skillTarget: 'SQL',
              estimatedHours: 14,
              status: hasSkill('SQL') ? 'completed' : 'not_started'
            },
            {
              description: 'Build Python data extraction scripts handling API pagination, rate limits, and schema validation.',
              completed: hasSkill('Python'),
              skillTarget: 'Python',
              estimatedHours: 12,
              status: hasSkill('Python') ? 'completed' : 'not_started'
            },
            {
              description: 'Implement relational database normalization, star schemas, and indexing strategies in PostgreSQL.',
              completed: hasSkill('PostgreSQL'),
              skillTarget: 'PostgreSQL',
              estimatedHours: 9,
              status: hasSkill('PostgreSQL') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Automated Relational ETL Pipeline',
            description: 'Python script extracting raw API transactional records, transforming schema, and loading into PostgreSQL.',
            targetSkill: 'SQL',
            portfolioEvidence: 'Proves capability to extract, clean, and reliably load relational datasets with idempotency.',
            keyDeliverables: [
              'Idempotent Python extraction script with retry mechanisms',
              'PostgreSQL schema with primary keys, foreign keys, and indexes',
              'Automated SQL data quality verification queries'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('SQL', roleName, 'Beginner')
          ]
        },
        {
          stage: 2,
          stageLevel: 'intermediate',
          title: 'Workflow Orchestration, Data Warehousing & Big Data Processing',
          duration: '3-4 Weeks',
          estimatedHours: 45,
          prerequisites: ['Stage 1 SQL and Python pipeline proficiency'],
          skills: ['Apache Spark', 'Airflow', 'Snowflake', 'Docker'],
          milestones: [
            {
              description: 'Author declarative Apache Airflow DAGs with custom operators, upstream dependencies, and SLA alerts.',
              completed: hasSkill('Airflow'),
              skillTarget: 'Airflow',
              estimatedHours: 18,
              status: hasSkill('Airflow') ? 'completed' : 'not_started'
            },
            {
              description: 'Process multi-gigabyte analytical datasets using PySpark DataFrame transformations and partitioning.',
              completed: hasSkill('Spark') || hasSkill('Apache Spark'),
              skillTarget: 'Apache Spark',
              estimatedHours: 17,
              status: hasSkill('Spark') ? 'completed' : 'not_started'
            },
            {
              description: 'Design analytical dimensional data models and partition keys in modern cloud data warehouses.',
              completed: hasSkill('Snowflake') || hasSkill('BigQuery'),
              skillTarget: 'Data Warehousing',
              estimatedHours: 10,
              status: hasSkill('Snowflake') ? 'completed' : 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Orchestrated PySpark Lakehouse Ingestion Engine',
            description: 'Scheduled Airflow pipeline orchestrating distributed PySpark batch transformation and Parquet table writing.',
            targetSkill: 'Apache Spark',
            portfolioEvidence: 'Demonstrates distributed big data engineering, task scheduling, and columnar data warehousing.',
            keyDeliverables: [
              'Airflow DAG definition file with retry policies and Slack alerts',
              'PySpark transformation script with schema enforcement and windowing',
              'Optimized Parquet partitioned lakehouse dataset'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Apache Spark', roleName, 'Intermediate'),
            getFallbackPracticalProject('Airflow', roleName, 'Intermediate')
          ]
        },
        {
          stage: 3,
          stageLevel: 'advanced',
          title: 'Real-Time Streaming, Distributed Messaging & Data Governance',
          duration: '4-5 Weeks',
          estimatedHours: 50,
          prerequisites: ['Stage 2 Spark and Airflow batch experience'],
          skills: ['Kafka', 'Streaming', 'dbt', 'Data Governance'],
          milestones: [
            {
              description: 'Construct event streaming pipelines with Apache Kafka: topic partitioning, consumer groups, and offset commit.',
              completed: hasSkill('Kafka'),
              skillTarget: 'Kafka',
              estimatedHours: 20,
              status: hasSkill('Kafka') ? 'completed' : 'not_started'
            },
            {
              description: 'Implement declarative data transformation models with dbt: automated tests, documentation, and lineage.',
              completed: hasSkill('dbt'),
              skillTarget: 'dbt',
              estimatedHours: 15,
              status: hasSkill('dbt') ? 'completed' : 'not_started'
            },
            {
              description: 'Enforce data contracts, schema registries, and automated data quality validation checkpoints.',
              completed: hasSkill('Data Governance'),
              skillTarget: 'Data Governance',
              estimatedHours: 15,
              status: 'not_started'
            }
          ],
          recommendedProject: {
            title: 'Real-Time High-Throughput Event Streaming Pipeline',
            description: 'Kafka producer/consumer architecture consuming simulated high-frequency event telemetry into streaming storage.',
            targetSkill: 'Kafka',
            portfolioEvidence: 'Demonstrates ability to design decoupled streaming architectures with event ordering guarantees.',
            keyDeliverables: [
              'Kafka producer publishing JSON events to partitioned topics',
              'Idempotent streaming consumer with dead-letter queue routing',
              'dbt transformation project validating schema consistency'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject('Kafka', roleName, 'Advanced')
          ]
        }
      ];

    default: {
      // Dynamic 3-stage generation tailored to this specific role and missing skills
      const missingChunk = Math.ceil(missingSkills.length / 3) || 1;
      const s1Missing = missingSkills.slice(0, missingChunk);
      const s2Missing = missingSkills.slice(missingChunk, missingChunk * 2);
      const s3Missing = missingSkills.slice(missingChunk * 2);

      const s1Skills = [...matchedSkills.slice(0, 2), ...s1Missing];
      const s2Skills = s2Missing.length > 0 ? s2Missing : ['Core Systems', 'Applied Frameworks'];
      const s3Skills = s3Missing.length > 0 ? s3Missing : ['Production Systems', 'Enterprise Architecture'];

      return [
        {
          stage: 1,
          stageLevel: 'beginner',
          title: `Foundations & Core Prerequisites for ${roleName}`,
          duration: '2-3 Weeks',
          estimatedHours: 35,
          prerequisites: ['Basic technical background', 'Core development environment'],
          skills: s1Skills,
          milestones: s1Skills.map(skill => ({
            description: `Attain verified baseline mastery of ${skill} syntax, tooling, and environment setup.`,
            completed: hasSkill(skill),
            skillTarget: skill,
            estimatedHours: 12,
            status: (hasSkill(skill) ? 'completed' : 'not_started') as any
          })),
          recommendedProject: {
            title: `Foundational ${s1Skills[0] || 'Core'} Implementation Prototype`,
            description: `Build an initial prototype exercising core concepts of ${s1Skills.join(', ')}.`,
            targetSkill: s1Skills[0] || 'Technical Foundations',
            portfolioEvidence: `Validates foundational readiness and syntax fluency in ${roleName} requirements.`,
            keyDeliverables: [
              'Functional implementation with clean project architecture',
              'Comprehensive unit test coverage',
              'README documenting setup and design decisions'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject(s1Skills[0] || 'Technical Foundations', roleName, 'Beginner')
          ]
        },
        {
          stage: 2,
          stageLevel: 'intermediate',
          title: `Core Architecture & Applied Services for ${roleName}`,
          duration: '3-4 Weeks',
          estimatedHours: 45,
          prerequisites: ['Stage 1 Foundations or verified equivalent experience'],
          skills: s2Skills,
          milestones: s2Skills.map(skill => ({
            description: `Design and implement production workflows incorporating ${skill}.`,
            completed: hasSkill(skill),
            skillTarget: skill,
            estimatedHours: 15,
            status: (hasSkill(skill) ? 'completed' : 'not_started') as any
          })),
          recommendedProject: {
            title: `Applied ${s2Skills[0] || 'Service'} Architecture System`,
            description: `Construct a multi-component system demonstrating practical competence in ${s2Skills.join(', ')}.`,
            targetSkill: s2Skills[0] || 'Applied Systems',
            portfolioEvidence: `Demonstrates ability to build production-grade modules solving real-world ${roleName} problems.`,
            keyDeliverables: [
              'Scalable architectural structure following industry best practices',
              'Automated validation and integration tests',
              'Detailed documentation of trade-offs and performance characteristics'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject(s2Skills[0] || 'Applied Systems', roleName, 'Intermediate')
          ]
        },
        {
          stage: 3,
          stageLevel: 'advanced',
          title: `Production Deployment, Scalability & Specialization for ${roleName}`,
          duration: '4-5 Weeks',
          estimatedHours: 50,
          prerequisites: ['Stage 2 Systems Implementation'],
          skills: s3Skills,
          milestones: s3Skills.map(skill => ({
            description: `Hardening, performance optimization, and enterprise deployment of ${skill}.`,
            completed: hasSkill(skill),
            skillTarget: skill,
            estimatedHours: 17,
            status: (hasSkill(skill) ? 'completed' : 'not_started') as any
          })),
          recommendedProject: {
            title: `Production-Grade ${roleName} Capstone Deliverable`,
            description: `Complete enterprise-ready implementation demonstrating full mastery of ${s3Skills.join(', ')}.`,
            targetSkill: s3Skills[0] || 'Production Systems',
            portfolioEvidence: `Validates candidate seniority, production readiness, and architectural judgment to recruiters.`,
            keyDeliverables: [
              'End-to-end deployed solution with monitoring and error logging',
              'CI/CD workflow with automated testing and quality gates',
              'Architecture decision record (ADR) justifying design choices'
            ]
          },
          practicalProjects: [
            getFallbackPracticalProject(s3Skills[0] || 'Production Systems', roleName, 'Advanced')
          ]
        }
      ];
    }
  }
};

export const CareerRoadmapPage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CareerRecommendationRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingMilestone, setUpdatingMilestone] = useState<string | null>(null);

  // Tab view: 'timeline' (Timeline & Roadmap View) vs 'projects' (Practical Projects Portfolio)
  const [activeTab, setActiveTab] = useState<'timeline' | 'projects'>('timeline');

  // Filter for practical projects
  const [projectSkillFilter, setProjectSkillFilter] = useState<string>('all');
  const [projectDifficultyFilter, setProjectDifficultyFilter] = useState<string>('all');

  // Active selected role state passed from Phase 2D Recommendations
  const roleFromUrl = searchParams.get('role');
  const roleFromState = (location.state as any)?.selectedRole;
  const roleFromStorage = typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') : null;
  const initialRole = roleFromUrl || roleFromState || roleFromStorage || '';
  const [selectedRoleName, setSelectedRoleName] = useState<string>(initialRole);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get<CareerRecommendationRecord>('/recommendations');
      if (res.data) {
        setData(res.data);
        const preferredRole =
          searchParams.get('role') ||
          (location.state as any)?.selectedRole ||
          (typeof window !== 'undefined' ? localStorage.getItem('careerlens_selected_target_role') : null) ||
          res.data.targetRole ||
          res.data.recommendedRoles?.[0]?.role ||
          '';
        if (preferredRole) {
          setSelectedRoleName(preferredRole);
          localStorage.setItem('careerlens_selected_target_role', preferredRole);
          if (!searchParams.get('role')) {
            setSearchParams({ role: preferredRole }, { replace: true });
          }
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

  // Update selected role if URL query changes or navigation state updates (Phase 3E)
  useEffect(() => {
    const roleParam = searchParams.get('role') || (location.state as any)?.selectedRole;
    if (roleParam && roleParam.trim().toLowerCase() !== selectedRoleName.trim().toLowerCase()) {
      setSelectedRoleName(roleParam.trim());
      localStorage.setItem('careerlens_selected_target_role', roleParam.trim());
    }
  }, [searchParams, location.state]);

  // Current active role object corresponding strictly to selected role
  const activeRole = useMemo(() => {
    if (!data?.recommendedRoles || data.recommendedRoles.length === 0) return null;
    const target = (selectedRoleName || data.targetRole || '').trim().toLowerCase();
    const match = data.recommendedRoles.find(
      r => r.role.trim().toLowerCase() === target
    );
    return match || data.recommendedRoles[0];
  }, [data, selectedRoleName]);

  // Flag if the requested role was not found in recommendedRoles
  const isRequestedRoleMissing = useMemo(() => {
    if (!data?.recommendedRoles || !selectedRoleName) return false;
    const found = data.recommendedRoles.some(
      r => r.role.trim().toLowerCase() === selectedRoleName.trim().toLowerCase()
    );
    return !found;
  }, [data, selectedRoleName]);

  // Dynamic 3-stage Beginner -> Intermediate -> Advanced roadmap for the selected role
  const activeRoadmapStages: IRoadmapStage[] = useMemo(() => {
    if (!activeRole) return data?.roadmap || [];

    // 1. If activeRole already has a tailored roadmap array with stages, use it
    if (activeRole.roadmap && activeRole.roadmap.length > 0) {
      return activeRole.roadmap;
    }

    // 2. If data.targetRole matches activeRole.role and top-level roadmap exists, use it
    if (
      data?.targetRole &&
      data.targetRole.trim().toLowerCase() === activeRole.role.trim().toLowerCase() &&
      data.roadmap &&
      data.roadmap.length > 0
    ) {
      return data.roadmap;
    }

    // 3. Dynamic synthesis tailored specifically for activeRole (never use generic/wrong role roadmap)
    return generateRoleRoadmapClient(
      activeRole.role,
      activeRole.missingSkills || [],
      activeRole.matchedSkills || []
    );
  }, [activeRole, data]);

  // Prioritized skill gaps strictly for the selected role (Phase 3E + Phase 2D)
  const activeRoleSkillGaps: ISkillGap[] = useMemo(() => {
    if (!activeRole) return [];
    if (activeRole.skillGaps && activeRole.skillGaps.length > 0) {
      return activeRole.skillGaps;
    }
    return (activeRole.missingSkills || []).map((skill, idx) => ({
      skill,
      category: 'Technical Competency',
      priority: idx < 2 ? 'high' : idx < 4 ? 'medium' : 'low',
      demandFrequency: idx < 2 ? 3 : 1,
      recommendedLearningArea: `Targeted architectural patterns and testing standards for ${skill} in ${activeRole.role}.`,
      estimatedHours: idx < 2 ? 30 : idx < 4 ? 20 : 12,
      suggestedProjects: [`Production ${skill} Deliverable for ${activeRole.role}`],
      learningResources: []
    }));
  }, [activeRole]);

  // All practical projects for the selected role (Phase 3C)
  const allRoleProjects: IPracticalProject[] = useMemo(() => {
    if (!activeRole) return [];

    // If activeRole has practicalProjects attached directly
    if (activeRole.practicalProjects && activeRole.practicalProjects.length > 0) {
      return activeRole.practicalProjects;
    }

    // Collect from skillGaps
    const fromSkillGaps: IPracticalProject[] = (activeRole.skillGaps || []).flatMap(g => g.practicalProjects || []);
    if (fromSkillGaps.length > 0) {
      return fromSkillGaps;
    }

    // Fallback: derive practical projects from missingSkills
    return (activeRole.missingSkills || []).map(skill =>
      getFallbackPracticalProject(skill, activeRole.role, 'Intermediate')
    );
  }, [activeRole]);

  // Filtered practical projects for the Project Portfolio view
  const filteredProjects = useMemo(() => {
    return allRoleProjects.filter(proj => {
      const matchSkill = projectSkillFilter === 'all' || proj.targetSkill.toLowerCase() === projectSkillFilter.toLowerCase();
      const matchDiff = projectDifficultyFilter === 'all' || proj.difficulty.toLowerCase() === projectDifficultyFilter.toLowerCase();
      return matchSkill && matchDiff;
    });
  }, [allRoleProjects, projectSkillFilter, projectDifficultyFilter]);

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
    setProjectSkillFilter('all');
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

  // Loading State
  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" />
        <p className="text-xs text-slate-500 font-semibold mt-3 animate-pulse">
          Synthesizing personalized learning roadmap & practical projects...
        </p>
      </div>
    );
  }

  // Empty State
  if (!data || !activeRole) {
    return (
      <div className="py-16 px-4 text-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 shadow-2xs">
          <Map className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">No Career Roadmap Found</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Generate your personalized career recommendations and roadmap based on your verified skills and target roles.
        </p>
        <button
          onClick={handleRegenerate}
          disabled={refreshing}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Generate Career Roadmap</span>
        </button>
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
              <Map className="w-5 h-5 text-emerald-600" />
              Personalized Career Roadmap & Practical Projects
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Phase 3A–3E
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-specific progression organized across Beginner → Intermediate → Advanced stages with portfolio evidence projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/recommendations?role=${encodeURIComponent(activeRole?.role || '')}`}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Role Recommendations</span>
          </Link>
          <Link
            to={`/benchmarking?role=${encodeURIComponent(activeRole?.role || '')}`}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Benchmark</span>
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
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchRoadmap}
            className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Role Selection Selector Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-600" />
            Select Career Target Pathway:
          </span>
          <span className="text-xs text-slate-400">Roadmap & projects update dynamically</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(data.recommendedRoles || []).map(r => {
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

      {/* Target Progress & Readiness Overview Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 text-white shadow-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-700/60">
                Phase 3A–3D Career Roadmap
              </span>
              <span className="text-[10px] font-bold text-emerald-200">
                • {activeRole.matchPercentage}% Profile Fit
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Roadmap for {roleNameDisplay}
            </h2>
            <p className="text-xs text-emerald-100 leading-relaxed">
              Targeted progression addressing {activeRole.missingSkills.length} identified skill gaps with {allRoleProjects.length} practical portfolio projects. Toggle milestones to track verified mastery.
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex flex-wrap items-center gap-3 bg-white/10 p-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Total Hours</span>
              <div className="text-xl font-black text-white">~{totalHours}h</div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Completed</span>
              <div className="text-xl font-black text-white">{progressPercentage}%</div>
              <p className="text-[9px] text-emerald-200">{completedMilestones} of {totalMilestones} done</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold text-emerald-200">Projects</span>
              <div className="text-xl font-black text-white">{allRoleProjects.length}</div>
              <p className="text-[9px] text-emerald-200">Evidence</p>
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

      {/* Missing Requested Role Notice (Graceful fallback handling) */}
      {isRequestedRoleMissing && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Target role <strong>"{selectedRoleName}"</strong> was not found in your currently recommended pathways. Showing <strong>"{activeRole.role}"</strong> roadmap instead.
            </span>
          </div>
          <Link
            to="/recommendations"
            className="px-3 py-1.5 rounded-xl bg-amber-200/70 hover:bg-amber-300 text-amber-950 font-bold text-xs shrink-0 self-start sm:self-auto transition"
          >
            Review Available Roles
          </Link>
        </div>
      )}

      {/* Phase 3E — Role Alignment & Skill Evidence Overview for the Selected Target Role */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Phase 2D Role Alignment
              </span>
              <h3 className="text-sm font-black text-slate-900">
                Skills & Gap Closure Breakdown for {roleNameDisplay}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified skills and targeted gap closures configured for this target role.
            </p>
          </div>

          <Link
            to={`/recommendations?role=${encodeURIComponent(activeRole.role)}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition flex items-center gap-1.5 shrink-0"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>View Full Recommendations Breakdown</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Matched Verified Skills */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Matched Verified Skills ({activeRole.matchedSkills.length})
              </h4>
              <span className="text-[10px] font-bold text-emerald-700">Verified Evidence</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRole.matchedSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                  <span>{skill}</span>
                </span>
              ))}
              {activeRole.matchedSkills.length === 0 && (
                <p className="text-xs text-slate-400 italic">No direct matches recorded for this role.</p>
              )}
            </div>
          </div>

          {/* Identified Skill Gaps to Close */}
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                Prioritized Skill Gaps to Close ({activeRole.missingSkills.length})
              </h4>
              <span className="text-[10px] font-bold text-rose-700">Roadmap Target</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeRole.missingSkills.map(skill => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-xs font-semibold shadow-2xs flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{skill}</span>
                </span>
              ))}
              {activeRole.missingSkills.length === 0 && (
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" /> All core requirements satisfied for this pathway!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Prioritized Skill Gaps Breakdown Bar */}
        {activeRoleSkillGaps.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                Gap Priority Distribution:
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                {activeRoleSkillGaps.filter(g => g.priority === 'high').length} High
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                {activeRoleSkillGaps.filter(g => g.priority === 'medium').length} Medium
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold">
                {activeRoleSkillGaps.filter(g => g.priority === 'low').length} Low
              </span>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Total estimated learning effort: ~{activeRoleSkillGaps.reduce((acc, g) => acc + (g.estimatedHours || 20), 0)} hours
            </span>
          </div>
        )}
      </div>

      {/* Empty Roadmap Stages State (if no stages found) */}
      {activeRoadmapStages.length === 0 && (
        <div className="p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Learning Stages Available for {activeRole.role}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click below to generate a tailored 3-stage learning roadmap and practical projects for {activeRole.role}.
          </p>
          <button
            onClick={handleRegenerate}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Generate Stages for {activeRole.role}</span>
          </button>
        </div>
      )}

      {/* View Switcher Tabs: Timeline vs Practical Projects Portfolio */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Timeline & Stage Roadmap</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'timeline' ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-500'}`}>
              3 Stages
            </span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'projects'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Practical Projects Portfolio (Phase 3C)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${activeTab === 'projects' ? 'bg-slate-800 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
              {allRoleProjects.length}
            </span>
          </button>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          {activeTab === 'timeline' ? 'Chronological timeline view' : 'Portfolio evidence projects'}
        </span>
      </div>

      {/* TAB 1: TIMELINE & PROGRESS VIEW (Phase 3D) */}
      {activeTab === 'timeline' && (
        <div className="relative pl-6 sm:pl-10 space-y-10">
          {/* Vertical Timeline Track Line */}
          <div className="absolute left-[17px] sm:left-[27px] top-6 bottom-6 w-0.5 bg-linear-to-b from-emerald-500 via-sky-500 to-purple-500" />

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

            const stageNodeBg = allCompleted
              ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
              : isBeginner
              ? 'bg-emerald-700 text-white ring-4 ring-emerald-100'
              : isIntermediate
              ? 'bg-sky-700 text-white ring-4 ring-sky-100'
              : 'bg-purple-700 text-white ring-4 ring-purple-100';

            // Stage-specific practical projects
            const stagePracticalProjects = stage.practicalProjects || [
              getFallbackPracticalProject(stage.skills[0] || 'Core', roleNameDisplay, stage.stageLevel as any)
            ];

            return (
              <div key={`${roleNameDisplay}-${stage.stage}`} className="relative group">
                {/* Timeline Circular Step Marker */}
                <div
                  className={`absolute -left-[27px] sm:-left-[39px] top-4 w-7 h-7 sm:w-9 sm:h-9 rounded-2xl font-black text-xs flex items-center justify-center shadow-md transition-transform group-hover:scale-110 z-10 ${stageNodeBg}`}
                >
                  {allCompleted ? <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" /> : stage.stage}
                </div>

                {/* Stage Main Card */}
                <div
                  className={`p-6 rounded-3xl bg-white border shadow-2xs space-y-6 transition ${
                    allCompleted
                      ? 'border-emerald-200 bg-emerald-50/10'
                      : hasInProgress
                      ? 'border-emerald-300 ring-1 ring-emerald-300/40'
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Stage Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${levelBadgeColor}`}>
                          {stage.stageLevel.toUpperCase()} STAGE
                        </span>
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {stage.duration} (~{stage.estimatedHours} hrs)
                        </span>
                      </div>
                      <h3 className="font-black text-lg text-slate-900 mt-1">{stage.title}</h3>
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

                  {/* Prerequisites Callout Banner */}
                  {stage.prerequisites && stage.prerequisites.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
                      <GraduationCap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-800">
                          Prerequisites for this Stage:
                        </span>
                        <p className="mt-0.5 text-amber-950 font-medium leading-relaxed">
                          {stage.prerequisites.join(' • ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SECTION 1: RELEVANT SKILLS IN SKILL CARDS (Phase 3D Requirement) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-600" />
                        Relevant Skills in this Stage
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {stage.skills.length} competencies targeted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {(stage.skills || []).map(skill => {
                        const isVerified = (activeRole.matchedSkills || []).some(
                          s => s.toLowerCase() === skill.toLowerCase()
                        );
                        const isGap = (activeRole.missingSkills || []).some(
                          s => s.toLowerCase() === skill.toLowerCase()
                        );

                        return (
                          <div
                            key={skill}
                            className={`p-3.5 rounded-2xl border transition flex flex-col justify-between gap-2.5 ${
                              isVerified
                                ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                                : 'bg-slate-50/80 border-slate-200/80 shadow-2xs'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {skill}
                                </span>
                                {isVerified ? (
                                  <span className="text-[9px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-emerald-200">
                                    <Check className="w-2.5 h-2.5" /> Verified
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-black text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 border border-rose-200">
                                    <AlertCircle className="w-2.5 h-2.5" /> Skill Gap
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 font-medium">
                                {isVerified ? 'Demonstrated in your experience' : 'Requires targeted project mastery'}
                              </p>
                            </div>

                            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 font-medium">Stage {stage.stage}</span>
                              <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                                {isVerified ? 'Portfolio Asset' : 'Growth Area'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION 2: INTERACTIVE LEARNING MILESTONES (Phase 3D Requirement) */}
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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

                  {/* SECTION 3: RECOMMENDED PRACTICAL PROJECTS WITHIN THE ROADMAP (Phase 3C + 3D Requirement) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderGit2 className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                          Recommended Practical Projects & Portfolio Evidence
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Builds Hiring Evidence
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {/* Primary Stage Capstone Deliverable */}
                      {stage.recommendedProject && (
                        <div className="p-4 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-700 text-white">
                                  Stage Deliverable
                                </span>
                                <span className="text-xs font-black text-slate-900">
                                  {stage.recommendedProject.title}
                                </span>
                              </div>
                            </div>
                            {stage.recommendedProject.targetSkill && (
                              <span className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md self-start sm:self-auto">
                                Targets: {stage.recommendedProject.targetSkill}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {stage.recommendedProject.description}
                          </p>

                          {/* Portfolio Evidence Callout */}
                          {stage.recommendedProject.portfolioEvidence && (
                            <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 text-xs text-emerald-900 flex items-start gap-2">
                              <Award className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                                  Portfolio Evidence Value:
                                </span>
                                <p className="text-[11px] leading-relaxed font-medium text-emerald-950">
                                  {stage.recommendedProject.portfolioEvidence}
                                </p>
                              </div>
                            </div>
                          )}

                          {stage.recommendedProject.keyDeliverables && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Key Deliverables:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {stage.recommendedProject.keyDeliverables.map((del, dIdx) => (
                                  <div key={dIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-medium bg-white p-2 rounded-lg border border-slate-200/60 shadow-2xs">
                                    <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{del}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Additional Practical Projects specific to this stage's skills */}
                      {stagePracticalProjects.map((proj, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-emerald-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Code2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <h5 className="font-extrabold text-xs text-slate-900">
                                {proj.title}
                              </h5>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                                Validates: {proj.targetSkill}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                ~{proj.estimatedHours}h
                              </span>
                            </div>
                          </div>

                          {/* Portfolio evidence explanation */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 flex items-start gap-2">
                            <FileCheck2 className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="text-[10px] font-extrabold uppercase text-slate-600 tracking-wider">
                                Recruiter / Interview Value:
                              </span>
                              <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">
                                {proj.portfolioEvidence}
                              </p>
                            </div>
                          </div>

                          {proj.keyDeliverables && (
                            <div className="space-y-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Architecture & Verification Requirements:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {proj.keyDeliverables.map((del, dIdx) => (
                                  <div key={dIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                                    <span>{del}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {proj.architectureOverview && (
                            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Stack:</span>
                              <span className="truncate">{proj.architectureOverview}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: PRACTICAL PROJECTS PORTFOLIO EXPLORER (Phase 3C) */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          {/* Header & Filter Card */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/70 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-600" />
                  Portfolio Evidence Projects for {roleNameDisplay}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Building these practical projects closes your identified skill gaps and creates tangible GitHub repositories for hiring managers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  {filteredProjects.length} Projects Available
                </span>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Filter by Skill Gap:
              </span>
              <button
                onClick={() => setProjectSkillFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  projectSkillFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                All Skills
              </button>
              {(activeRole.missingSkills || []).map(skill => (
                <button
                  key={skill}
                  onClick={() => setProjectSkillFilter(skill)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    projectSkillFilter.toLowerCase() === skill.toLowerCase()
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Practical Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((project, pIdx) => (
              <div
                key={pIdx}
                className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 flex flex-col justify-between hover:border-emerald-300 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {project.difficulty}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {project.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {project.title}
                      </h4>
                    </div>

                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl shrink-0">
                      ~{project.estimatedHours}h
                    </span>
                  </div>

                  {/* Connected Skill Badge */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Targeted Gap:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      {project.targetSkill}
                    </span>
                  </div>

                  {/* Portfolio Evidence Box */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/60 text-xs text-emerald-950 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Award className="w-3 h-3 text-emerald-600" />
                      What This Proves to Employers:
                    </span>
                    <p className="text-[11px] leading-relaxed font-medium">
                      {project.portfolioEvidence}
                    </p>
                  </div>

                  {/* Key Deliverables */}
                  {project.keyDeliverables && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Key Deliverables & Verification:
                      </span>
                      <ul className="space-y-1.5">
                        {project.keyDeliverables.map((del, dIdx) => (
                          <li key={dIdx} className="text-xs text-slate-600 flex items-start gap-2 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {project.architectureOverview && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-400">Architecture:</span>
                    <span className="font-mono text-slate-700 font-medium truncate max-w-[280px]">
                      {project.architectureOverview}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/70 text-slate-500 space-y-2">
              <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-semibold">No projects match the selected filter.</p>
              <button
                onClick={() => {
                  setProjectSkillFilter('all');
                  setProjectDifficultyFilter('all');
                }}
                className="text-xs text-emerald-700 font-bold underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer Navigation CTA */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm text-slate-900">
            Finished reviewing your roadmap for {roleNameDisplay}?
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore detailed role recommendations or review candidate job match scores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/recommendations"
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-600" />
            <span>Role Analysis</span>
          </Link>
          <Link
            to="/job-match"
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>Analyze Job Descriptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
