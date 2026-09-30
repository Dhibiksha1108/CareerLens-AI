import { CareerRoadmap } from '../models/CareerRoadmap.js';

export class RoadmapService {
  static async getUserRoadmaps(userId: string) {
    return await CareerRoadmap.find({ userId }).sort({ createdAt: -1 });
  }

  static async generateRoadmap(userId: string, targetRole: string) {
    const defaultStages = [
      {
        order: 1,
        title: 'Core Fundamentals & CS Essentials',
        description: 'Master data structures, algorithms, and system design basics.',
        durationWeeks: 4,
        status: 'in_progress' as const,
        tasks: [
          { id: 't1', title: 'Complete Data Structures Refresher', completed: false },
          { id: 't2', title: 'Build 2 Object-Oriented Design Projects', completed: false }
        ]
      },
      {
        order: 2,
        title: 'Advanced Skill Specialization',
        description: 'Build production-grade projects with modern tech stack.',
        durationWeeks: 6,
        status: 'pending' as const,
        tasks: [
          { id: 't3', title: 'Implement Express REST API microservices', completed: false },
          { id: 't4', title: 'Deploy frontend application to cloud provider', completed: false }
        ]
      },
      {
        order: 3,
        title: 'Portfolio & Job Market Readiness',
        description: 'Verify skill evidence and perform resume optimizations.',
        durationWeeks: 4,
        status: 'pending' as const,
        tasks: [
          { id: 't5', title: 'Publish 3 showcase projects with unit tests', completed: false }
        ]
      }
    ];

    const roadmap = await CareerRoadmap.create({
      userId,
      targetRole,
      stages: defaultStages,
      skills: ['TypeScript', 'React', 'Node.js', 'MongoDB', 'System Design'],
      recommendedProjects: ['Career Profile Evaluator', 'Microservices API Gateway'],
      progress: 0
    });

    return roadmap;
  }

  static async updateStageStatus(roadmapId: string, userId: string, stageOrder: number, status: 'pending' | 'in_progress' | 'completed') {
    const roadmap = await CareerRoadmap.findOne({ _id: roadmapId, userId });
    if (!roadmap) throw new Error('Roadmap not found');

    const stage = roadmap.stages.find(s => s.order === stageOrder);
    if (stage) {
      stage.status = status;
    }

    const completedStages = roadmap.stages.filter(s => s.status === 'completed').length;
    roadmap.progress = Math.round((completedStages / roadmap.stages.length) * 100);

    await roadmap.save();
    return roadmap;
  }
}
