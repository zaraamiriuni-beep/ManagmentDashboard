export interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'delayed';
  score: number; // 0 - 100
  startDate: string;
  endDate: string;
  budget: number; // In Tomans/Rials
  progress: number; // 0 - 100
  teamSize: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface ProjectManager {
  id: string;
  name: string;
  avatar: string;
  role: string;
  projects: Project[];
}

export interface Department {
  id: string;
  name: string;
  icon: string;
  managers: ProjectManager[];
}

export interface ActivityLog {
  id: string;
  managerName: string;
  action: string;
  projectTitle: string;
  time: string;
}
