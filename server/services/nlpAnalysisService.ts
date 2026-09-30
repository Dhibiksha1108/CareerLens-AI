import mongoose from 'mongoose';
import { Resume } from '../models/Resume.js';
import { SkillEvidence } from '../models/SkillEvidence.js';
import { User } from '../models/User.js';

export type SkillCategory =
  | 'Programming'
  | 'Database'
  | 'Web'
  | 'Data/ML'
  | 'Cloud/Tools'
  | 'Soft Skills';

export interface ExtractedSkill {
  name: string;
  category: SkillCategory;
  confidence: number; // 0.0 to 1.0
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced';
  evidenceStrength: 'low' | 'medium' | 'high' | 'verified';
  frequency: number;
  snippets: string[];
  tfidfScore: number;
  cosineSimilarity: number;
}

export interface NlpAnalysisResult {
  resumeId: string;
  originalName: string;
  extractedSkills: ExtractedSkill[];
  categories: Record<SkillCategory, ExtractedSkill[]>;
  categoryDistribution: Record<SkillCategory, number>;
  topKeywords: { term: string; score: number }[];
  statistics: {
    totalWords: number;
    uniqueWords: number;
    totalSkillsFound: number;
    technicalSkillsCount: number;
    softSkillsCount: number;
    topCategory: SkillCategory | 'None';
    profileCompletenessScore: number;
  };
  summary: string;
  analyzedAt: string;
}

// Common English Stop-words
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t',
  'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can',
  'cannot', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves',
  'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their',
  'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who',
  'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]);

// Canonical Skill Lexicon and Categorization
export interface SkillDefinition {
  canonicalName: string;
  category: SkillCategory;
  aliases: string[];
  archetypeContext: string[]; // Context keywords for Cosine Similarity evaluation
}

export const SKILL_TAXONOMY: SkillDefinition[] = [
  // --- Programming Languages ---
  { canonicalName: 'Python', category: 'Programming', aliases: ['python', 'python3', 'py'], archetypeContext: ['scripting', 'algorithms', 'backend', 'data', 'django', 'pandas'] },
  { canonicalName: 'JavaScript', category: 'Programming', aliases: ['javascript', 'js', 'es6', 'es2020'], archetypeContext: ['frontend', 'web', 'dom', 'client', 'browser', 'events'] },
  { canonicalName: 'TypeScript', category: 'Programming', aliases: ['typescript', 'ts'], archetypeContext: ['types', 'interfaces', 'frontend', 'strict', 'scalable', 'react'] },
  { canonicalName: 'Java', category: 'Programming', aliases: ['java', 'jdk', 'jvm'], archetypeContext: ['oop', 'enterprise', 'spring', 'backend', 'multithreading', 'design patterns'] },
  { canonicalName: 'C++', category: 'Programming', aliases: ['c++', 'cpp'], archetypeContext: ['pointers', 'memory', 'performance', 'data structures', 'systems'] },
  { canonicalName: 'C#', category: 'Programming', aliases: ['c#', 'csharp', '.net'], archetypeContext: ['dotnet', 'microsoft', 'backend', 'enterprise', 'unity'] },
  { canonicalName: 'Go', category: 'Programming', aliases: ['golang', 'go lang', 'go'], archetypeContext: ['concurrency', 'goroutines', 'microservices', 'high performance'] },
  { canonicalName: 'Rust', category: 'Programming', aliases: ['rust', 'rustlang'], archetypeContext: ['memory safety', 'borrow checker', 'systems', 'concurrency'] },
  { canonicalName: 'PHP', category: 'Programming', aliases: ['php'], archetypeContext: ['laravel', 'server', 'web', 'backend', 'cms'] },
  { canonicalName: 'Ruby', category: 'Programming', aliases: ['ruby', 'ruby on rails'], archetypeContext: ['rails', 'backend', 'mvc', 'agile'] },
  { canonicalName: 'Swift', category: 'Programming', aliases: ['swift'], archetypeContext: ['ios', 'apple', 'mobile', 'uikit', 'swiftui'] },
  { canonicalName: 'Kotlin', category: 'Programming', aliases: ['kotlin'], archetypeContext: ['android', 'mobile', 'jvm', 'coroutines'] },
  { canonicalName: 'Dart', category: 'Programming', aliases: ['dart', 'flutter'], archetypeContext: ['flutter', 'mobile', 'cross platform', 'widgets'] },
  { canonicalName: 'R', category: 'Programming', aliases: ['r language', 'r programming'], archetypeContext: ['statistics', 'data analysis', 'bioinformatics', 'modeling'] },
  { canonicalName: 'Bash', category: 'Programming', aliases: ['bash', 'shell script', 'shell scripting', 'sh'], archetypeContext: ['linux', 'scripting', 'automation', 'cli'] },
  { canonicalName: 'SQL', category: 'Programming', aliases: ['sql'], archetypeContext: ['queries', 'relational', 'database', 'joins', 'schema'] },

  // --- Databases ---
  { canonicalName: 'PostgreSQL', category: 'Database', aliases: ['postgresql', 'postgres', 'psql'], archetypeContext: ['relational', 'acid', 'indexes', 'jsonb', 'sql queries'] },
  { canonicalName: 'MySQL', category: 'Database', aliases: ['mysql'], archetypeContext: ['relational', 'innodb', 'tables', 'queries', 'schema'] },
  { canonicalName: 'MongoDB', category: 'Database', aliases: ['mongodb', 'mongo', 'nosql', 'mongoose'], archetypeContext: ['document', 'collections', 'aggregation', 'schema-less', 'nosql'] },
  { canonicalName: 'Redis', category: 'Database', aliases: ['redis'], archetypeContext: ['cache', 'in-memory', 'key-value', 'pubsub', 'latency'] },
  { canonicalName: 'SQLite', category: 'Database', aliases: ['sqlite'], archetypeContext: ['embedded', 'mobile', 'lightweight', 'local storage'] },
  { canonicalName: 'Elasticsearch', category: 'Database', aliases: ['elasticsearch', 'elk'], archetypeContext: ['full text search', 'indexing', 'analytics', 'logstash'] },
  { canonicalName: 'DynamoDB', category: 'Database', aliases: ['dynamodb'], archetypeContext: ['aws', 'nosql', 'serverless', 'partition key'] },
  { canonicalName: 'Firebase', category: 'Database', aliases: ['firebase', 'firestore'], archetypeContext: ['realtime', 'auth', 'cloud functions', 'google'] },
  { canonicalName: 'Oracle', category: 'Database', aliases: ['oracle db', 'pl/sql'], archetypeContext: ['enterprise', 'relational', 'plsql', 'stored procedures'] },

  // --- Web Technologies ---
  { canonicalName: 'React', category: 'Web', aliases: ['react', 'react.js', 'reactjs'], archetypeContext: ['components', 'hooks', 'jsx', 'frontend', 'state management', 'vdom'] },
  { canonicalName: 'Next.js', category: 'Web', aliases: ['next.js', 'nextjs'], archetypeContext: ['ssr', 'ssg', 'server components', 'routing', 'full stack'] },
  { canonicalName: 'Node.js', category: 'Web', aliases: ['node.js', 'nodejs', 'node'], archetypeContext: ['backend', 'express', 'event loop', 'async', 'npm', 'apis'] },
  { canonicalName: 'Express', category: 'Web', aliases: ['express', 'express.js', 'expressjs'], archetypeContext: ['middleware', 'rest', 'routing', 'http', 'endpoints'] },
  { canonicalName: 'Angular', category: 'Web', aliases: ['angular', 'angularjs'], archetypeContext: ['components', 'typescript', 'dependency injection', 'rxjs'] },
  { canonicalName: 'Vue.js', category: 'Web', aliases: ['vue', 'vue.js', 'vuejs'], archetypeContext: ['templates', 'reactivity', 'vuex', 'pinia', 'composition api'] },
  { canonicalName: 'HTML5', category: 'Web', aliases: ['html', 'html5'], archetypeContext: ['markup', 'semantic', 'dom', 'accessibility'] },
  { canonicalName: 'CSS3', category: 'Web', aliases: ['css', 'css3', 'styles'], archetypeContext: ['flexbox', 'grid', 'responsive', 'animations', 'selectors'] },
  { canonicalName: 'Tailwind CSS', category: 'Web', aliases: ['tailwind', 'tailwind css', 'tailwindcss'], archetypeContext: ['utility-first', 'responsive', 'ui styling', 'css'] },
  { canonicalName: 'Redux', category: 'Web', aliases: ['redux', 'redux toolkit'], archetypeContext: ['state', 'actions', 'reducers', 'global state', 'store'] },
  { canonicalName: 'GraphQL', category: 'Web', aliases: ['graphql', 'apollo'], archetypeContext: ['schema', 'queries', 'mutations', 'resolvers', 'api'] },
  { canonicalName: 'REST API', category: 'Web', aliases: ['rest api', 'restful', 'restful apis', 'rest apis'], archetypeContext: ['endpoints', 'http methods', 'json', 'crud', 'crud operations'] },
  { canonicalName: 'FastAPI', category: 'Web', aliases: ['fastapi'], archetypeContext: ['async', 'pydantic', 'python api', 'openapi', 'swagger'] },
  { canonicalName: 'Django', category: 'Web', aliases: ['django', 'django rest framework'], archetypeContext: ['orm', 'python', 'admin', 'auth', 'models'] },
  { canonicalName: 'Spring Boot', category: 'Web', aliases: ['spring boot', 'spring framework'], archetypeContext: ['java', 'microservices', 'beans', 'rest', 'enterprise'] },

  // --- Data & Machine Learning ---
  { canonicalName: 'Machine Learning', category: 'Data/ML', aliases: ['machine learning', 'ml'], archetypeContext: ['models', 'training', 'supervised', 'unsupervised', 'prediction', 'evaluation'] },
  { canonicalName: 'Deep Learning', category: 'Data/ML', aliases: ['deep learning', 'neural networks'], archetypeContext: ['cnn', 'rnn', 'transformers', 'layers', 'backpropagation'] },
  { canonicalName: 'Natural Language Processing', category: 'Data/ML', aliases: ['nlp', 'natural language processing'], archetypeContext: ['text processing', 'tokenization', 'sentiment', 'embeddings', 'spacy', 'bert'] },
  { canonicalName: 'Computer Vision', category: 'Data/ML', aliases: ['computer vision', 'opencv'], archetypeContext: ['image processing', 'object detection', 'segmentation', 'cnn'] },
  { canonicalName: 'TensorFlow', category: 'Data/ML', aliases: ['tensorflow', 'tf', 'keras'], archetypeContext: ['neural networks', 'deep learning', 'tensors', 'gpu'] },
  { canonicalName: 'PyTorch', category: 'Data/ML', aliases: ['pytorch', 'torch'], archetypeContext: ['dynamic graphs', 'deep learning', 'research', 'autograd'] },
  { canonicalName: 'Scikit-Learn', category: 'Data/ML', aliases: ['scikit-learn', 'sklearn'], archetypeContext: ['classification', 'regression', 'clustering', 'random forest', 'pca'] },
  { canonicalName: 'Pandas', category: 'Data/ML', aliases: ['pandas'], archetypeContext: ['dataframe', 'data manipulation', 'data cleaning', 'series', 'csv'] },
  { canonicalName: 'NumPy', category: 'Data/ML', aliases: ['numpy'], archetypeContext: ['arrays', 'matrices', 'linear algebra', 'numerical computing'] },
  { canonicalName: 'Data Analysis', category: 'Data/ML', aliases: ['data analysis', 'data analytics'], archetypeContext: ['insights', 'metrics', 'trends', 'eda', 'reporting'] },
  { canonicalName: 'Data Visualization', category: 'Data/ML', aliases: ['data visualization', 'matplotlib', 'seaborn'], archetypeContext: ['charts', 'plots', 'dashboards', 'graphs', 'visuals'] },
  { canonicalName: 'Apache Spark', category: 'Data/ML', aliases: ['spark', 'apache spark', 'pyspark'], archetypeContext: ['big data', 'distributed', 'rdd', 'dataframes', 'etl'] },
  { canonicalName: 'Tableau', category: 'Data/ML', aliases: ['tableau', 'power bi'], archetypeContext: ['business intelligence', 'dashboards', 'reports', 'visualizations'] },

  // --- Cloud & DevOps Tools ---
  { canonicalName: 'AWS', category: 'Cloud/Tools', aliases: ['aws', 'amazon web services', 'ec2', 's3', 'lambda'], archetypeContext: ['cloud', 'infrastructure', 'serverless', 'hosting', 'scalability'] },
  { canonicalName: 'Docker', category: 'Cloud/Tools', aliases: ['docker', 'containerization', 'containers'], archetypeContext: ['dockerfile', 'compose', 'images', 'isolation', 'deployments'] },
  { canonicalName: 'Kubernetes', category: 'Cloud/Tools', aliases: ['kubernetes', 'k8s'], archetypeContext: ['orchestration', 'clusters', 'pods', 'scaling', 'deployments'] },
  { canonicalName: 'Git', category: 'Cloud/Tools', aliases: ['git', 'version control'], archetypeContext: ['commits', 'branches', 'merging', 'pull requests', 'repositories'] },
  { canonicalName: 'GitHub', category: 'Cloud/Tools', aliases: ['github', 'gitlab'], archetypeContext: ['repos', 'ci/cd', 'collaborative', 'actions'] },
  { canonicalName: 'CI/CD', category: 'Cloud/Tools', aliases: ['ci/cd', 'continuous integration', 'continuous delivery', 'github actions', 'jenkins'], archetypeContext: ['pipelines', 'automated testing', 'deployment', 'workflows'] },
  { canonicalName: 'Linux', category: 'Cloud/Tools', aliases: ['linux', 'ubuntu', 'unix'], archetypeContext: ['operating system', 'cli', 'permissions', 'servers', 'sysadmin'] },
  { canonicalName: 'Microservices', category: 'Cloud/Tools', aliases: ['microservices', 'system design', 'distributed systems'], archetypeContext: ['architecture', 'services', 'scalability', 'api gateway', 'decoupled'] },
  { canonicalName: 'Agile', category: 'Cloud/Tools', aliases: ['agile', 'scrum', 'kanban'], archetypeContext: ['sprints', 'standups', 'jira', 'iterative', 'user stories'] },

  // --- Soft Skills ---
  { canonicalName: 'Communication', category: 'Soft Skills', aliases: ['communication', 'written communication', 'verbal communication'], archetypeContext: ['stakeholders', 'presentations', 'cross-functional', 'clarity', 'collaborating'] },
  { canonicalName: 'Leadership', category: 'Soft Skills', aliases: ['leadership', 'team lead', 'mentoring', 'mentorship'], archetypeContext: ['guidance', 'team vision', 'initiative', 'decision making', 'coaching'] },
  { canonicalName: 'Problem Solving', category: 'Soft Skills', aliases: ['problem solving', 'analytical skills', 'troubleshooting'], archetypeContext: ['debugging', 'solutions', 'critical thinking', 'root cause', 'optimization'] },
  { canonicalName: 'Teamwork', category: 'Soft Skills', aliases: ['teamwork', 'collaboration', 'cross-functional collaboration'], archetypeContext: ['teammates', 'peers', 'team environment', 'cooperation', 'partnership'] },
  { canonicalName: 'Time Management', category: 'Soft Skills', aliases: ['time management', 'prioritization', 'multitasking'], archetypeContext: ['deadlines', 'scheduling', 'productivity', 'deliverables', 'efficiency'] },
  { canonicalName: 'Adaptability', category: 'Soft Skills', aliases: ['adaptability', 'fast learner', 'flexibility'], archetypeContext: ['new technologies', 'fast paced', 'pivoting', 'learning curve'] },
  { canonicalName: 'Critical Thinking', category: 'Soft Skills', aliases: ['critical thinking', 'strategic thinking'], archetypeContext: ['analysis', 'evaluating options', 'sound judgement', 'decision process'] }
];

/**
 * 1. Text Preprocessor - Cleaning, Normalization, Tokenization, N-Gram creation
 */
export class TextPreprocessor {
  /**
   * Normalizes raw resume text by cleaning whitespace, lowercasing, and removing artifacts
   */
  static clean(text: string): string {
    if (!text) return '';
    return text
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[•●▪■◆★\u2022\u2023\u25E6\u2043\u2219]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits text into coherent sentences for context extraction
   */
  static splitSentences(text: string): string[] {
    if (!text) return [];
    return text
      .split(/(?<=[.?!;])\s+(?=[A-Z0-9])|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  /**
   * Extracts clean alphabetic/technical tokens, filtering stop-words
   */
  static tokenize(text: string): string[] {
    const cleaned = text.toLowerCase();
    // Match technical words including dots and pluses (e.g. c++, node.js, c#)
    const matches = cleaned.match(/[a-z0-9#+.]+/g) || [];
    return matches
      .map(token => token.replace(/^\.+|\.+$/g, ''))
      .filter(token => token.length > 1 && !STOP_WORDS.has(token));
  }

  /**
   * Generates n-grams (unigrams, bigrams, trigrams) from token stream
   */
  static generateNgrams(tokens: string[], maxN: number = 3): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i < tokens.length; i++) {
      for (let n = 1; n <= maxN && i + n <= tokens.length; n++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
      }
    }
    return ngrams;
  }
}

/**
 * 2. TF-IDF Representation & Vector Space Model
 */
export class TfidfModel {
  /**
   * Computes Term Frequency (TF) for tokens in a document
   * Normalized by total term count
   */
  static computeTF(tokens: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    if (tokens.length === 0) return tf;

    for (const token of tokens) {
      tf.set(token, (tf.get(token) || 0) + 1);
    }

    // Term frequency normalized: count / totalTokens
    for (const [token, count] of tf.entries()) {
      tf.set(token, count / tokens.length);
    }
    return tf;
  }

  /**
   * Computes Inverse Document Frequency (IDF) over sentence/section corpus
   * smooth IDF formula: ln((N + 1) / (df + 1)) + 1
   */
  static computeIDF(sentences: string[][]): Map<string, number> {
    const idf = new Map<string, number>();
    const N = sentences.length || 1;

    // Document frequency (how many sentences contain the term)
    const df = new Map<string, number>();
    for (const sentenceTokens of sentences) {
      const uniqueInDoc = new Set(sentenceTokens);
      for (const token of uniqueInDoc) {
        df.set(token, (df.get(token) || 0) + 1);
      }
    }

    for (const [token, docFreq] of df.entries()) {
      idf.set(token, Math.log((N + 1) / (docFreq + 1)) + 1);
    }

    return idf;
  }

  /**
   * Computes full TF-IDF vector map for a document
   */
  static computeTfidf(tokens: string[], idfMap: Map<string, number>): Map<string, number> {
    const tfMap = this.computeTF(tokens);
    const tfidf = new Map<string, number>();

    for (const [term, tf] of tfMap.entries()) {
      const idf = idfMap.get(term) || Math.log(2) + 1; // Default fallback IDF
      tfidf.set(term, tf * idf);
    }
    return tfidf;
  }
}

/**
 * 3. Similarity Engine - Cosine Similarity & Vector Operations
 */
export class SimilarityEngine {
  /**
   * Calculates Cosine Similarity between two term-weight vector maps:
   * cos(u, v) = (u . v) / (||u|| * ||v||)
   */
  static cosineSimilarity(vecA: Map<string, number>, vecB: Map<string, number>): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [term, weightA] of vecA.entries()) {
      normA += weightA * weightA;
      const weightB = vecB.get(term);
      if (weightB !== undefined) {
        dotProduct += weightA * weightB;
      }
    }

    for (const [, weightB] of vecB.entries()) {
      normB += weightB * weightB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

/**
 * 4. Main NLP Skill Extraction & Profiling Service
 */
export class NlpAnalysisService {
  /**
   * Analyzes extracted resume text, extracts skills using TF-IDF & Cosine Similarity,
   * categorizes them, and persists into MongoDB Resume and SkillEvidence records.
   */
  static async analyzeResumeText(userId: string, resumeId: string): Promise<NlpAnalysisResult> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    const rawText = resume.extractedText || '';
    const cleanText = TextPreprocessor.clean(rawText);
    const sentences = TextPreprocessor.splitSentences(rawText);
    const tokens = TextPreprocessor.tokenize(cleanText);

    // If document is empty or has virtually no text, handle gracefully
    if (tokens.length < 5) {
      const emptyResult: NlpAnalysisResult = {
        resumeId: resume._id.toString(),
        originalName: resume.fileInfo.originalName,
        extractedSkills: [],
        categories: {
          Programming: [],
          Database: [],
          Web: [],
          'Data/ML': [],
          'Cloud/Tools': [],
          'Soft Skills': []
        },
        categoryDistribution: {
          Programming: 0,
          Database: 0,
          Web: 0,
          'Data/ML': 0,
          'Cloud/Tools': 0,
          'Soft Skills': 0
        },
        topKeywords: [],
        statistics: {
          totalWords: tokens.length,
          uniqueWords: new Set(tokens).size,
          totalSkillsFound: 0,
          technicalSkillsCount: 0,
          softSkillsCount: 0,
          topCategory: 'None',
          profileCompletenessScore: 10
        },
        summary: 'Minimal or unreadable text extracted from the document. Please ensure the resume file contains selectable plain text.',
        analyzedAt: new Date().toISOString()
      };

      resume.analysisStatus = 'completed';
      resume.analysisResult = emptyResult;
      resume.skills = [];
      await resume.save();

      return emptyResult;
    }

    // Build sentence token vectors for IDF calculations
    const sentenceTokenList = sentences.map(s => TextPreprocessor.tokenize(s));
    const idfMap = TfidfModel.computeIDF(sentenceTokenList);
    const documentTfidf = TfidfModel.computeTfidf(tokens, idfMap);

    // Extract Top Keywords by TF-IDF score
    const topKeywords = Array.from(documentTfidf.entries())
      .filter(([term]) => term.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([term, score]) => ({
        term,
        score: Math.round(score * 1000) / 1000
      }));

    // Identify Skills using Taxonomy + TF-IDF Context + Cosine Similarity
    const extractedSkillsMap = new Map<string, ExtractedSkill>();
    const lowerCleanText = ' ' + cleanText.toLowerCase() + ' ';

    for (const skillDef of SKILL_TAXONOMY) {
      let matched = false;
      let matchCount = 0;
      const matchedSnippets: string[] = [];

      for (const alias of skillDef.aliases) {
        // Safe regex word boundary match
        const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`(?<=[^a-z0-9#+]|^)${escaped}(?=[^a-z0-9#+]|$)`, 'gi');
        const matches = lowerCleanText.match(pattern);

        if (matches && matches.length > 0) {
          matched = true;
          matchCount += matches.length;

          // Find context sentence snippets
          for (const sentence of sentences) {
            if (new RegExp(escaped, 'i').test(sentence) && !matchedSnippets.includes(sentence)) {
              matchedSnippets.push(sentence);
              if (matchedSnippets.length >= 3) break;
            }
          }
        }
      }

      if (matched) {
        // Vector space representation of skill context
        const archetypeVector = new Map<string, number>();
        for (const word of skillDef.archetypeContext) {
          archetypeVector.set(word, 1.0);
        }

        // Vector space representation of candidate snippets around the skill
        const snippetText = matchedSnippets.join(' ');
        const snippetTokens = TextPreprocessor.tokenize(snippetText);
        const snippetTfidf = TfidfModel.computeTfidf(snippetTokens, idfMap);

        // Calculate Cosine Similarity with skill archetype
        const similarity = SimilarityEngine.cosineSimilarity(snippetTfidf, archetypeVector);

        // Normalize TF-IDF score for this skill
        const aliasTokens = TextPreprocessor.tokenize(skillDef.canonicalName);
        let tfidfScore = 0;
        for (const t of aliasTokens) {
          tfidfScore = Math.max(tfidfScore, documentTfidf.get(t) || 0);
        }

        // Confidence calculation: bounded between 0.65 and 0.98 based on frequency & similarity
        const baseConfidence = Math.min(0.65 + matchCount * 0.05 + similarity * 0.25, 0.98);
        const confidence = Math.round(baseConfidence * 100) / 100;

        // Proficiency level and evidence strength
        let proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' = 'intermediate';
        let evidenceStrength: 'low' | 'medium' | 'high' | 'verified' = 'medium';

        if (matchCount >= 4 || confidence >= 0.88) {
          proficiencyLevel = 'advanced';
          evidenceStrength = 'high';
        } else if (matchCount === 1 && confidence < 0.72) {
          proficiencyLevel = 'beginner';
          evidenceStrength = 'low';
        }

        extractedSkillsMap.set(skillDef.canonicalName, {
          name: skillDef.canonicalName,
          category: skillDef.category,
          confidence,
          proficiencyLevel,
          evidenceStrength,
          frequency: matchCount,
          snippets: matchedSnippets.slice(0, 2),
          tfidfScore: Math.round(tfidfScore * 1000) / 1000,
          cosineSimilarity: Math.round(similarity * 100) / 100
        });
      }
    }

    const extractedSkills = Array.from(extractedSkillsMap.values()).sort(
      (a, b) => b.confidence - a.confidence || b.frequency - a.frequency
    );

    // Group by category
    const categories: Record<SkillCategory, ExtractedSkill[]> = {
      Programming: [],
      Database: [],
      Web: [],
      'Data/ML': [],
      'Cloud/Tools': [],
      'Soft Skills': []
    };

    for (const skill of extractedSkills) {
      categories[skill.category].push(skill);
    }

    const categoryDistribution: Record<SkillCategory, number> = {
      Programming: categories.Programming.length,
      Database: categories.Database.length,
      Web: categories.Web.length,
      'Data/ML': categories['Data/ML'].length,
      'Cloud/Tools': categories['Cloud/Tools'].length,
      'Soft Skills': categories['Soft Skills'].length
    };

    // Find top dominant category
    let topCategory: SkillCategory | 'None' = 'None';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryDistribution) as [SkillCategory, number][]) {
      if (count > maxCount) {
        maxCount = count;
        topCategory = cat;
      }
    }

    const technicalCount =
      categoryDistribution.Programming +
      categoryDistribution.Database +
      categoryDistribution.Web +
      categoryDistribution['Data/ML'] +
      categoryDistribution['Cloud/Tools'];
    const softCount = categoryDistribution['Soft Skills'];

    // Profile completeness score (0-100)
    const completenessScore = Math.min(
      Math.round(
        (Math.min(technicalCount, 10) / 10) * 50 +
        (Math.min(softCount, 4) / 4) * 20 +
        (topKeywords.length > 5 ? 15 : 5) +
        (tokens.length > 150 ? 15 : 5)
      ),
      100
    );

    // Automated NLP candidate profile summary
    const topSkillsList = extractedSkills.slice(0, 5).map(s => s.name).join(', ');
    const summary = extractedSkills.length > 0
      ? `Identified ${extractedSkills.length} verified skills across ${Object.values(categoryDistribution).filter(c => c > 0).length} technical domains with primary concentration in ${topCategory}. Prominent competencies include: ${topSkillsList}. Text feature extraction demonstrates high vector relevance for ${topKeywords.slice(0, 3).map(k => k.term).join(', ')}.`
      : 'No standard technical or soft skills detected in the parsed text. The document may require clearer section headers or formatting for automated NLP extraction.';

    const analysisResult: NlpAnalysisResult = {
      resumeId: resume._id.toString(),
      originalName: resume.fileInfo.originalName,
      extractedSkills,
      categories,
      categoryDistribution,
      topKeywords,
      statistics: {
        totalWords: tokens.length,
        uniqueWords: new Set(tokens).size,
        totalSkillsFound: extractedSkills.length,
        technicalSkillsCount: technicalCount,
        softSkillsCount: softCount,
        topCategory,
        profileCompletenessScore: completenessScore
      },
      summary,
      analyzedAt: new Date().toISOString()
    };

    // 1. Update Resume Document
    resume.analysisStatus = 'completed';
    resume.analysisResult = analysisResult;
    resume.skills = extractedSkills.map(s => s.name);
    await resume.save();

    // 2. Persist Evidence to MongoDB SkillEvidence Collection
    const userIdObj = new mongoose.Types.ObjectId(userId);
    for (const skill of extractedSkills) {
      await SkillEvidence.findOneAndUpdate(
        { userId: userIdObj, skill: skill.name },
        {
          $set: {
            category: skill.category,
            confidence: skill.confidence,
            proficiencyLevel: skill.proficiencyLevel,
            evidenceStrength: skill.evidenceStrength
          },
          $addToSet: {
            resumeEvidence: {
              $each: skill.snippets.map(snippet => ({
                textSnippet: snippet,
                sourceSection: 'Resume Analysis'
              }))
            }
          }
        },
        { upsert: true, new: true }
      );
    }

    // 3. Keep User.skills synced with verified skills
    const user = await User.findById(userId);
    if (user) {
      const existingUserSkillNames = new Set(user.skills.map(s => s.name.toLowerCase()));
      let updated = false;

      for (const skill of extractedSkills) {
        if (!existingUserSkillNames.has(skill.name.toLowerCase())) {
          user.skills.push({
            name: skill.name,
            category: skill.category,
            proficiencyLevel: skill.proficiencyLevel
          });
          existingUserSkillNames.add(skill.name.toLowerCase());
          updated = true;
        }
      }

      if (updated) {
        await user.save();
      }
    }

    return analysisResult;
  }

  /**
   * Retrieves the current NLP analysis result for a given resume
   */
  static async getAnalysisResult(userId: string, resumeId: string): Promise<NlpAnalysisResult | null> {
    const resume = await Resume.findOne({ _id: resumeId, userId });
    if (!resume) {
      throw new Error('Resume not found or unauthorized');
    }

    if (resume.analysisResult) {
      return resume.analysisResult as NlpAnalysisResult;
    }

    // If text exists but analysis hasn't been executed yet, run analysis
    if (resume.extractedText && resume.extractedText.trim().length > 0) {
      return await this.analyzeResumeText(userId, resumeId);
    }

    return null;
  }
}
