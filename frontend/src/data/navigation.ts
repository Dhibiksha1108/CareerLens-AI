import {
  Home,
  User,
  FileText,
  Target,
  Award,
  FolderGit2,
  Lightbulb,
  Map,
  BarChart3,
  Sliders
} from 'lucide-react';

export const navItems = [
  { name: 'Home', path: '/dashboard', icon: Home },
  { name: 'My Profile', path: '/profile', icon: User },
  { name: 'Resume Analysis', path: '/resume', icon: FileText },
  { name: 'Job Match', path: '/jobs', icon: Target },
  { name: 'Skills & Evidence', path: '/skills', icon: Award },
  { name: 'Projects', path: '/projects', icon: FolderGit2 },
  { name: 'Recommendations', path: '/recommendations', icon: Lightbulb },
  { name: 'Career Roadmap', path: '/roadmap', icon: Map },
  { name: 'Benchmarking', path: '/benchmarking', icon: BarChart3 },
  { name: 'Improvement Simulator', path: '/simulator', icon: Sliders }
];
