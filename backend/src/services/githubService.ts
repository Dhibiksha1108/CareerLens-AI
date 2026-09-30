import { GitHubProfile } from '../models/GitHubProfile.js';

export class GitHubService {
  static async syncGitHubProfile(userId: string, username: string) {
    let profile = await GitHubProfile.findOne({ userId, username });

    if (!profile) {
      profile = await GitHubProfile.create({
        userId,
        username,
        repositories: [],
        languages: {},
        analyzedSkills: []
      });
    }

    return profile;
  }

  static async getUserGitHubProfile(userId: string) {
    return await GitHubProfile.findOne({ userId });
  }
}
