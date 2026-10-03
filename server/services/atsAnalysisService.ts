import mongoose from 'mongoose';
import { Resume } from '../models/Resume.js';
import { User } from '../models/User.js';
import { CareerRecommendation } from '../models/CareerRecommendation.js';
import { SKILL_TAXONOMY } from './nlpAnalysisService.js';
import {
  IAtsAnalysisResult,
  IAtsSectionAnalysis,
  IAtsFormattingRisk,
  IBulletPointAnalysis
} from '../types/index.js';

// Common strong action verbs for technical resumes
const ACTION_VERBS = new Set([
  'architected', 'engineered', 'implemented', 'developed', 'designed', 'built',
  'optimized', 'spearheaded', 'streamlined', 'automated', 'orchestrated', 'deployed',
  'scaled', 'refactored', 'mentored', 'led', 'delivered', 'launched', 'resolved',
  'accelerated', 'transformed', 'reduced', 'increased', 'generated', 'managed',
  'created', 'integrated', 'configured', 'published', 'established', 'standardized',
  'modernized', 'overhauled', 'programmed', 'authored', 'championed', 'instituted'
]);

// Weak or passive phrases to flag
const WEAK_PHRASES = [
  'responsible for', 'helped with', 'assisted with', 'worked on', 'tasked with',
  'duties included', 'was involved in', 'participated in', 'tried to', 'handled various'
];

// Empty buzzwords / clichés
const BUZZWORDS = [
  'synergy', 'hardworking', 'go-getter', 'think outside the box', 'team player',
  'detail-oriented', 'dynamic', 'self-starter', 'results-driven', 'fast learner',
  'proactive', 'strategic thinker', 'ninja', 'rockstar', 'guru', 'passionate individual'
];

// Standard role skills lookup fallback if recommendation not yet cached
const DEFAULT_ROLE_SKILLS: Record<string, { high: string[]; medium: string[]; low: string[] }> = {
  'full stack developer': {
    high: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    medium: ['Express', 'Docker', 'REST API', 'Git', 'MongoDB'],
    low: ['Redis', 'CI/CD', 'Tailwind CSS', 'Next.js']
  },
  'devops / cloud engineer': {
    high: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    medium: ['Terraform', 'Bash', 'Git', 'Networking'],
    low: ['Prometheus', 'Grafana', 'Security', 'Python']
  },
  'devops engineer': {
    high: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'],
    medium: ['Terraform', 'Bash', 'Git', 'Networking'],
    low: ['Prometheus', 'Grafana', 'Security', 'Python']
  },
  'data analyst': {
    high: ['SQL', 'Python', 'Power BI', 'Data Visualization'],
    medium: ['Tableau', 'Pandas', 'Excel', 'Statistics'],
    low: ['EDA', 'R', 'ETL', 'Dashboard Design']
  },
  'data engineer': {
    high: ['SQL', 'Python', 'Apache Spark', 'Kafka'],
    medium: ['Airflow', 'PostgreSQL', 'Docker', 'Data Warehousing'],
    low: ['Snowflake', 'dbt', 'ETL', 'Redis']
  },
  'machine learning engineer': {
    high: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch'],
    medium: ['Scikit-learn', 'Statistics', 'Pandas', 'MLOps'],
    low: ['Docker', 'NumPy', 'FastAPI', 'Data Engineering']
  },
  'backend engineer': {
    high: ['Node.js', 'Python', 'SQL', 'PostgreSQL', 'REST API'],
    medium: ['Express', 'Docker', 'Redis', 'Microservices'],
    low: ['Git', 'Linux', 'Message Queues', 'Security']
  },
  'frontend engineer': {
    high: ['JavaScript', 'TypeScript', 'React', 'HTML5', 'CSS3'],
    medium: ['Next.js', 'Tailwind CSS', 'Redux', 'Responsive Design'],
    low: ['Git', 'REST API', 'Web Performance', 'UI/UX']
  }
};

export class AtsAnalysisService {
  /**
   * Analyzes an uploaded resume against a target role for ATS and human readability
   */
  static async analyzeResumeAts(
    userId: string,
    resumeId: string,
    targetRoleName?: string,
    jobDescription?: string
  ): Promise<IAtsAnalysisResult> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    const rawText = resume.extractedText || '';
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Resume has no extracted text to analyze. Please upload a readable document.');
    }

    // 1. Resolve Target Role
    const user = await User.findById(userId);
    const rec = await CareerRecommendation.findOne({ userId }).sort({ updatedAt: -1 });

    const targetRole =
      (targetRoleName && targetRoleName.trim()) ||
      rec?.targetRole ||
      (user?.targetRoles && user.targetRoles[0]) ||
      'Full Stack Developer';

    // 2. Fetch role required skills from Phase 2D recommendation if available
    let roleSkillsList: { high: string[]; medium: string[]; low: string[] };

    const roleObj = rec?.recommendedRoles?.find(
      r => r.role.toLowerCase() === targetRole.toLowerCase()
    );

    if (roleObj) {
      const highSkills = (roleObj.skillGaps || [])
        .filter(g => g.priority === 'high')
        .map(g => g.skill);
      const medSkills = (roleObj.skillGaps || [])
        .filter(g => g.priority === 'medium')
        .map(g => g.skill);
      const lowSkills = (roleObj.skillGaps || [])
        .filter(g => g.priority === 'low')
        .map(g => g.skill);

      // Add matched skills to the pool
      roleObj.matchedSkills.forEach((s, idx) => {
        if (idx < 2) highSkills.push(s);
        else medSkills.push(s);
      });

      roleSkillsList = {
        high: Array.from(new Set(highSkills)),
        medium: Array.from(new Set(medSkills)),
        low: Array.from(new Set(lowSkills))
      };
    } else {
      const fallbackKey = Object.keys(DEFAULT_ROLE_SKILLS).find(k =>
        targetRole.toLowerCase().includes(k)
      );
      roleSkillsList = fallbackKey
        ? {
            high: [...DEFAULT_ROLE_SKILLS[fallbackKey].high],
            medium: [...DEFAULT_ROLE_SKILLS[fallbackKey].medium],
            low: [...DEFAULT_ROLE_SKILLS[fallbackKey].low]
          }
        : {
            high: [...DEFAULT_ROLE_SKILLS['full stack developer'].high],
            medium: [...DEFAULT_ROLE_SKILLS['full stack developer'].medium],
            low: [...DEFAULT_ROLE_SKILLS['full stack developer'].low]
          };
    }

    // Incorporate Job Description keywords if supplied
    if (jobDescription && jobDescription.trim().length > 0) {
      const jdLower = jobDescription.toLowerCase();
      SKILL_TAXONOMY.forEach(def => {
        const isPresent = def.aliases.some(alias => {
          const regex = new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i');
          return regex.test(jdLower);
        });
        if (isPresent) {
          if (!roleSkillsList.high.includes(def.canonicalName) && !roleSkillsList.medium.includes(def.canonicalName)) {
            roleSkillsList.high.push(def.canonicalName);
          }
        }
      });
    }

    const textLower = rawText.toLowerCase();

    // 3. Section & Structure Analysis
    const sectionsAnalysis = this.analyzeSections(rawText);

    // 4. Keyword & Skill Matching (Role-Specific)
    const allRoleSkills = [
      ...roleSkillsList.high.map(s => ({ skill: s, priority: 'high' as const, freq: 3 })),
      ...roleSkillsList.medium.map(s => ({ skill: s, priority: 'medium' as const, freq: 2 })),
      ...roleSkillsList.low.map(s => ({ skill: s, priority: 'low' as const, freq: 1 }))
    ];

    const relevantSkillsDetected: string[] = [];
    const missingKeywords: Array<{
      keyword: string;
      priority: 'high' | 'medium' | 'low';
      frequencyInRole: number;
      category: string;
    }> = [];

    // Helper to check skill presence using alias dictionary if available
    const checkSkillInText = (skillName: string): boolean => {
      const sLower = skillName.toLowerCase();
      // Direct boundary check
      const regex = new RegExp(`\\b${escapeRegExp(sLower)}\\b`, 'i');
      if (regex.test(textLower)) return true;

      // Check taxonomy aliases
      const tax = SKILL_TAXONOMY.find(t => t.canonicalName.toLowerCase() === sLower);
      if (tax) {
        return tax.aliases.some(alias => {
          const aliasRegex = new RegExp(`\\b${escapeRegExp(alias.toLowerCase())}\\b`, 'i');
          return aliasRegex.test(textLower);
        });
      }
      return false;
    };

    allRoleSkills.forEach(({ skill, priority, freq }) => {
      const tax = SKILL_TAXONOMY.find(t => t.canonicalName.toLowerCase() === skill.toLowerCase());
      const category = tax?.category || 'Technical Competency';

      if (checkSkillInText(skill)) {
        relevantSkillsDetected.push(skill);
      } else {
        missingKeywords.push({
          keyword: skill,
          priority,
          frequencyInRole: freq,
          category
        });
      }
    });

    const totalPossibleSkills = Math.max(allRoleSkills.length, 1);
    const keywordMatchPercentage = Math.min(
      Math.round((relevantSkillsDetected.length / totalPossibleSkills) * 100),
      100
    );

    // 5. ATS Formatting Risks
    const formattingRisks = this.detectFormattingRisks(rawText, sectionsAnalysis);

    // 6. Human Readability & Content Quality
    const readability = this.computeReadability(rawText);
    const bulletQuality = this.analyzeBulletPoints(rawText);
    const repetitionAnalysis = this.analyzeRepetition(rawText);

    // Content clarity score based on readability, bullet structure, and word count
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;
    let contentClarityScore = 75;
    if (wordCount >= 350 && wordCount <= 900) contentClarityScore += 10;
    if (bulletQuality.score >= 70) contentClarityScore += 10;
    if (repetitionAnalysis.repetitionScore >= 80) contentClarityScore += 5;
    contentClarityScore = Math.min(contentClarityScore, 98);

    const contentClaritySummary =
      contentClarityScore >= 85
        ? 'High structural clarity with logical flow, concise bulleting, and clean typography hierarchy.'
        : contentClarityScore >= 70
        ? 'Solid organization with minor opportunities to sharpen sentence brevity and impact metrics.'
        : 'Dense paragraphs and uneven bullet structuring may slow down human technical screeners.';

    // 7. Overall ATS Compatibility Score Calculation (0-100)
    // Formula balances:
    // - Keyword Match: 40%
    // - Section Completeness: 25%
    // - Absence of Formatting Risks: 20%
    // - Parsability & Contact Details: 15%
    const optimalSections = sectionsAnalysis.filter(s => s.status === 'optimal').length;
    const sectionScore = Math.round((optimalSections / sectionsAnalysis.length) * 100);

    const highRiskCount = formattingRisks.filter(r => r.severity === 'high').length;
    const medRiskCount = formattingRisks.filter(r => r.severity === 'medium').length;
    const riskDeductions = highRiskCount * 12 + medRiskCount * 6;
    const formattingScore = Math.max(100 - riskDeductions, 20);

    const contactSection = sectionsAnalysis.find(s => s.name === 'Contact Information');
    const contactScore = contactSection?.status === 'optimal' ? 100 : 50;

    const rawAtsScore =
      keywordMatchPercentage * 0.40 +
      sectionScore * 0.25 +
      formattingScore * 0.20 +
      contactScore * 0.15;

    const atsScore = Math.min(Math.max(Math.round(rawAtsScore), 15), 98);

    // 8. Strengths Identification
    const strengths: string[] = [];
    if (keywordMatchPercentage >= 60) {
      strengths.push(`High keyword alignment (${keywordMatchPercentage}%) with ${targetRole} market expectations.`);
    }
    if (relevantSkillsDetected.length >= 4) {
      strengths.push(`Strong core competencies detected: ${relevantSkillsDetected.slice(0, 4).join(', ')}.`);
    }
    if (bulletQuality.actionVerbsCount >= 5) {
      strengths.push(`Action-oriented bullet phrasing: ${bulletQuality.actionVerbsCount} strong engineering verbs identified.`);
    }
    if (bulletQuality.metricsCount >= 2) {
      strengths.push(`Quantifiable impact demonstrated with ${bulletQuality.metricsCount} specific numerical metrics/outcomes.`);
    }
    if (formattingRisks.filter(r => r.severity === 'high').length === 0) {
      strengths.push('Clean document structure without high-severity ATS parsing blockades.');
    }
    if (readability.score >= 60) {
      strengths.push(`Favorable reading score (${readability.score}/100) for fast 6-second recruiter scanning.`);
    }
    if (strengths.length === 0) {
      strengths.push('Document contains readable text extractable by modern applicant tracking systems.');
    }

    // 9. Specific Prioritized Improvement Suggestions
    const improvementSuggestions = this.generateImprovementSuggestions(
      targetRole,
      missingKeywords,
      sectionsAnalysis,
      formattingRisks,
      bulletQuality,
      repetitionAnalysis
    );

    return {
      resumeId: resume._id.toString(),
      targetRole,
      analyzedAt: new Date().toISOString(),
      atsScore,
      keywordMatchPercentage,
      relevantSkillsDetected,
      missingKeywords,
      sectionsAnalysis,
      formattingRisks,
      readabilityScore: readability.score,
      readabilityLevel: readability.level,
      contentClarityScore,
      contentClaritySummary,
      bulletQuality,
      repetitionAnalysis,
      strengths,
      improvementSuggestions
    };
  }

  // --- Helpers ---

  private static analyzeSections(text: string): IAtsSectionAnalysis[] {
    const textLower = text.toLowerCase();

    // Section 1: Contact Information
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
    const hasPhone = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);
    const hasLinkedIn = /linkedin\.com\/in\//i.test(text);
    const hasGitHub = /github\.com\//i.test(text);

    const contactFound = hasEmail || hasPhone;
    const contactOptimal = hasEmail && hasPhone;

    const sections: IAtsSectionAnalysis[] = [
      {
        name: 'Contact Information',
        found: contactFound,
        status: contactOptimal ? 'optimal' : contactFound ? 'warning' : 'missing',
        feedback: contactOptimal
          ? `Detected professional email and phone number${hasLinkedIn ? ', plus LinkedIn profile' : ''}${hasGitHub ? ' and GitHub URL' : ''}.`
          : contactFound
          ? 'Missing either phone number or email address in header.'
          : 'No standard contact email or phone number detected.'
      },
      {
        name: 'Professional Summary / Objective',
        found: /(summary|professional summary|about me|career objective|profile)\b/i.test(textLower),
        status: /(summary|professional summary|about me|career objective|profile)\b/i.test(textLower) ? 'optimal' : 'warning',
        feedback: /(summary|professional summary|about me|career objective|profile)\b/i.test(textLower)
          ? 'Summary section clearly defined, allowing recruiters to quickly evaluate role alignment.'
          : 'No explicit "Professional Summary" header found. A 3-sentence summary primes recruiters and ATS matching.'
      },
      {
        name: 'Work Experience',
        found: /(experience|work experience|employment history|professional experience|work history)\b/i.test(textLower),
        status: /(experience|work experience|employment history|professional experience|work history)\b/i.test(textLower) ? 'optimal' : 'missing',
        feedback: /(experience|work experience|employment history|professional experience|work history)\b/i.test(textLower)
          ? 'Standard Work Experience section identified with chronological milestones.'
          : 'CRITICAL: No recognizable Work Experience heading detected. ATS systems rely on this exact heading.'
      },
      {
        name: 'Technical Skills',
        found: /(skills|technical skills|technologies|competencies|core competencies|areas of expertise)\b/i.test(textLower),
        status: /(skills|technical skills|technologies|competencies|core competencies|areas of expertise)\b/i.test(textLower) ? 'optimal' : 'warning',
        feedback: /(skills|technical skills|technologies|competencies|core competencies|areas of expertise)\b/i.test(textLower)
          ? 'Dedicated Skills section detected, enabling high-speed keyword tokenization.'
          : 'Skills are dispersed throughout body text without an isolated "Skills" inventory heading.'
      },
      {
        name: 'Education',
        found: /(education|academic background|qualifications|academic history|degrees)\b/i.test(textLower),
        status: /(education|academic background|qualifications|academic history|degrees)\b/i.test(textLower) ? 'optimal' : 'warning',
        feedback: /(education|academic background|qualifications|academic history|degrees)\b/i.test(textLower)
          ? 'Education and degree credentials present.'
          : 'No dedicated Education section detected.'
      },
      {
        name: 'Projects & Portfolio',
        found: /(projects|technical projects|personal projects|portfolio|key projects)\b/i.test(textLower),
        status: /(projects|technical projects|personal projects|portfolio|key projects)\b/i.test(textLower) ? 'optimal' : 'warning',
        feedback: /(projects|technical projects|personal projects|portfolio|key projects)\b/i.test(textLower)
          ? 'Technical Projects section highlighted with practical application proofs.'
          : 'No separate Projects section found. Adding project repositories gives hiring managers verified evidence.'
      }
    ];

    return sections;
  }

  private static detectFormattingRisks(text: string, sections: IAtsSectionAnalysis[]): IAtsFormattingRisk[] {
    const risks: IAtsFormattingRisk[] = [];
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    // Risk 1: Missing Contact Info
    const contact = sections.find(s => s.name === 'Contact Information');
    if (contact?.status === 'missing') {
      risks.push({
        type: 'contact_missing',
        severity: 'high',
        title: 'Missing Contact Information Header',
        description: 'ATS parsers could not identify an email address and phone number in standard header positioning.',
        recommendation: 'Place your full name, email, phone number, and LinkedIn URL in plain text at the very top of page 1.'
      });
    }

    // Risk 2: Missing Core Experience Heading
    const exp = sections.find(s => s.name === 'Work Experience');
    if (exp?.status === 'missing') {
      risks.push({
        type: 'missing_experience_heading',
        severity: 'high',
        title: 'Standard Experience Heading Absent',
        description: 'Parsers could not identify "Work Experience" or "Professional Experience" headings.',
        recommendation: 'Use canonical section titles: "Work Experience" or "Professional Experience" without creative phrasing.'
      });
    }

    // Risk 3: Document Word Count / Length
    if (wordCount < 200) {
      risks.push({
        type: 'length_under',
        severity: 'high',
        title: 'Document Too Short for Complete ATS Indexing',
        description: `Your resume contains only ~${wordCount} words. Standard resumes typically range between 400 and 800 words.`,
        recommendation: 'Expand on specific responsibilities, tools utilized, and quantifiable achievements in each role.'
      });
    } else if (wordCount > 1200) {
      risks.push({
        type: 'length_over',
        severity: 'medium',
        title: 'Dense Document Length (>1,200 Words)',
        description: `At ~${wordCount} words, recruiters may lose focus during the initial 6-second scan.`,
        recommendation: 'Trim older or irrelevant roles and condense bullet points to keep early-to-mid career resumes within 1-2 pages.'
      });
    }

    // Risk 4: Multi-column or table delimiter indicators
    if (text.includes('|') && (text.match(/\|/g) || []).length > 8) {
      risks.push({
        type: 'pipe_delimiters',
        severity: 'low',
        title: 'Excessive Pipe Characters or Multi-Column Table Layout',
        description: 'Frequent vertical bars (|) indicate tables or columnar formatting which some older ATS software reads out of order.',
        recommendation: 'Use clean standard linear single-column layouts for maximum compatibility across enterprise ATS systems.'
      });
    }

    // Risk 5: Dense unbulleted paragraphs
    const paragraphs = text.split(/\n\s*\n/);
    const longParagraphs = paragraphs.filter(p => {
      const words = p.split(/\s+/).length;
      const isBulleted = /^[•\-*–\d.]/m.test(p);
      return words > 65 && !isBulleted;
    });

    if (longParagraphs.length >= 2) {
      risks.push({
        type: 'dense_paragraphs',
        severity: 'medium',
        title: 'Dense Paragraph Blocks Impairing Parsing',
        description: 'Long blocks of text without bullet points reduce ATS keyword extraction accuracy and fatigue human reviewers.',
        recommendation: 'Convert narrative paragraphs in your experience section into 2-4 punchy, quantifiable bullet points.'
      });
    }

    return risks;
  }

  private static computeReadability(text: string): {
    score: number;
    level: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult';
  } {
    const words = text.split(/\s+/).filter(Boolean);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const totalWords = Math.max(words.length, 1);
    const totalSentences = Math.max(sentences.length, 1);

    // Approximate syllable count
    let totalSyllables = 0;
    words.forEach(word => {
      const clean = word.toLowerCase().replace(/[^a-z]/g, '');
      if (clean.length <= 3) {
        totalSyllables += 1;
        return;
      }
      const matches = clean.match(/[aeiouy]{1,2}/g);
      totalSyllables += matches ? matches.length : 1;
    });

    // Flesch Reading Ease Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
    const wordsPerSentence = totalWords / totalSentences;
    const syllablesPerWord = totalSyllables / totalWords;
    const flesch = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);

    const score = Math.min(Math.max(Math.round(flesch), 20), 95);

    let level: 'Very Easy' | 'Easy' | 'Fairly Easy' | 'Standard' | 'Fairly Difficult' | 'Difficult' = 'Standard';
    if (score >= 90) level = 'Very Easy';
    else if (score >= 80) level = 'Easy';
    else if (score >= 70) level = 'Fairly Easy';
    else if (score >= 60) level = 'Standard';
    else if (score >= 50) level = 'Fairly Difficult';
    else level = 'Difficult';

    return { score, level };
  }

  private static analyzeBulletPoints(text: string): IBulletPointAnalysis {
    const lines = text.split(/\n/).map(l => l.trim()).filter(Boolean);
    const bulletLines = lines.filter(l => /^[•\-*–\d+.]/i.test(l) || (l.length > 25 && l.length < 180));

    const totalBullets = Math.max(bulletLines.length, 1);
    let strongBullets = 0;
    let weakBullets = 0;
    let actionVerbsCount = 0;
    let metricsCount = 0;

    const sampleStrengths: string[] = [];
    const sampleWeaknesses: string[] = [];

    bulletLines.forEach(line => {
      const lineClean = line.replace(/^[•\-*–\d+.]\s*/, '').trim();
      const firstWord = lineClean.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');

      const hasActionVerb = ACTION_VERBS.has(firstWord);
      if (hasActionVerb) actionVerbsCount++;

      // Check metrics (percentages, numbers, dollars, X multipliers)
      const hasMetric = /\b\d+%\b|\$\d+[\d,]*|\b\d+x\b|\b\d+\+?\s*(users|clients|customers|requests|transactions|services|endpoints|repos|microservices|servers|nodes|queries|seconds|minutes|hours|days|weeks|months|years|members|engineers|teams)\b/i.test(lineClean);
      if (hasMetric) metricsCount++;

      // Check weak phrase
      const hasWeakPhrase = WEAK_PHRASES.some(wp => lineClean.toLowerCase().startsWith(wp) || lineClean.toLowerCase().includes(wp));

      if (hasActionVerb && hasMetric && !hasWeakPhrase) {
        strongBullets++;
        if (sampleStrengths.length < 2) {
          sampleStrengths.push(lineClean);
        }
      } else if (hasWeakPhrase || (!hasActionVerb && !hasMetric)) {
        weakBullets++;
        if (sampleWeaknesses.length < 2 && lineClean.length > 15) {
          sampleWeaknesses.push(lineClean);
        }
      }
    });

    // Score: 0-100 based on action verbs, metrics, and low weak phrasing
    const verbRatio = Math.min((actionVerbsCount / totalBullets) * 50, 50);
    const metricRatio = Math.min((metricsCount / totalBullets) * 40, 40);
    const weakPenalty = Math.min((weakBullets / totalBullets) * 20, 20);

    const score = Math.min(Math.max(Math.round(verbRatio + metricRatio - weakPenalty + 20), 25), 98);

    const recommendation =
      score >= 80
        ? 'Excellent bullet structure utilizing power verbs and measurable quantitative results.'
        : score >= 60
        ? 'Good baseline. Enhance by starting every bullet with an action verb and quantifying impact with metrics (e.g. % improvement, latency reduction, user count).'
        : 'Reformat bullets using the XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".';

    return {
      totalBullets,
      strongBullets,
      weakBullets,
      actionVerbsCount,
      metricsCount,
      score,
      sampleStrengths,
      sampleWeaknesses,
      recommendation
    };
  }

  private static analyzeRepetition(text: string): {
    overusedWords: Array<{ word: string; count: number }>;
    fillerPhrasesFound: string[];
    repetitionScore: number;
  } {
    const textLower = text.toLowerCase();
    const fillerPhrasesFound: string[] = [];

    BUZZWORDS.forEach(bw => {
      const regex = new RegExp(`\\b${escapeRegExp(bw)}\\b`, 'i');
      if (regex.test(textLower)) {
        fillerPhrasesFound.push(bw);
      }
    });

    // Word frequency analysis (filtering short words and stop words)
    const words = textLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !['about', 'after', 'their', 'which', 'there', 'where', 'these', 'would', 'could', 'using'].includes(w));

    const freqMap: Record<string, number> = {};
    words.forEach(w => {
      freqMap[w] = (freqMap[w] || 0) + 1;
    });

    const overusedWords = Object.entries(freqMap)
      .filter(([_, count]) => count >= 5)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, count]) => ({ word, count }));

    const penalty = overusedWords.length * 4 + fillerPhrasesFound.length * 8;
    const repetitionScore = Math.max(100 - penalty, 40);

    return {
      overusedWords,
      fillerPhrasesFound,
      repetitionScore
    };
  }

  private static generateImprovementSuggestions(
    targetRole: string,
    missingKeywords: Array<{ keyword: string; priority: 'high' | 'medium' | 'low' }>,
    sections: IAtsSectionAnalysis[],
    risks: IAtsFormattingRisk[],
    bullets: IBulletPointAnalysis,
    repetition: { fillerPhrasesFound: string[] }
  ): IAtsAnalysisResult['improvementSuggestions'] {
    const suggestions: IAtsAnalysisResult['improvementSuggestions'] = [];

    // 1. Missing High Priority Keywords
    const highMissing = missingKeywords.filter(k => k.priority === 'high');
    if (highMissing.length > 0) {
      const top3 = highMissing.slice(0, 3).map(k => k.keyword).join(', ');
      suggestions.push({
        category: 'Keywords',
        priority: 'high',
        title: `Integrate Core ${targetRole} Missing Keywords`,
        description: `Your resume is missing high-demand target keywords: ${top3}. Without these, automated filters will rank your profile lower.`,
        actionableFix: `Embed ${top3} naturally within your Work Experience bullets or a designated Skills category where you have practical familiarity.`
      });
    }

    // 2. Formatting / Missing Sections
    const missingSections = sections.filter(s => s.status === 'missing' || s.status === 'warning');
    if (missingSections.length > 0) {
      const secNames = missingSections.map(s => s.name).join(', ');
      suggestions.push({
        category: 'Sections',
        priority: missingSections.some(s => s.name === 'Work Experience') ? 'high' : 'medium',
        title: 'Optimize Standard Resume Structure Headings',
        description: `Sections requiring clearer formatting or presence: ${secNames}.`,
        actionableFix: 'Use exact standard headings ("Work Experience", "Education", "Skills", "Projects") to ensure flawless multi-system ATS parsing.'
      });
    }

    // 3. Bullet Point Action Verbs and Metrics
    if (bullets.metricsCount < 3) {
      suggestions.push({
        category: 'Impact',
        priority: 'high',
        title: 'Quantify Work Experience Outcomes with Metrics',
        description: `Only ${bullets.metricsCount} quantitative metrics (%, $, scale, numbers) were detected across your bullet points.`,
        actionableFix: 'Revise bullets using the Google XYZ formula: "Improved API response latency by 35% across 12 microservices by integrating Redis caching."'
      });
    }

    if (bullets.actionVerbsCount < bullets.totalBullets * 0.6) {
      suggestions.push({
        category: 'Content',
        priority: 'medium',
        title: 'Strengthen Leading Action Verbs',
        description: 'Several bullet points begin with passive phrasing or weak verbs rather than decisive engineering accomplishments.',
        actionableFix: 'Replace phrases like "Responsible for" or "Helped build" with commanding power verbs: "Architected", "Engineered", "Optimized", "Spearheaded".'
      });
    }

    // 4. Buzzwords / Clichés
    if (repetition.fillerPhrasesFound.length > 0) {
      suggestions.push({
        category: 'Content',
        priority: 'low',
        title: 'Remove Subjective Buzzwords & Clichés',
        description: `Found empty phrases: ${repetition.fillerPhrasesFound.join(', ')}. Hiring managers look for verifiable technical proof over self-descriptions.`,
        actionableFix: 'Delete subjective claims ("hardworking", "team player") and replace them with factual technical achievements.'
      });
    }

    // 5. Formatting Risks
    risks.forEach(r => {
      suggestions.push({
        category: 'Formatting',
        priority: r.severity,
        title: r.title,
        description: r.description,
        actionableFix: r.recommendation
      });
    });

    return suggestions;
  }
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
