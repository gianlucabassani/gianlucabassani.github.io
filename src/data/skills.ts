export type Skill = {
  id: string;
  name: string;
  level: number; // 0 - 100
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success' | 'destructive';
};

const skills: Skill[] = [
  // Programming Languages
  { id: 'python', name: 'Python', level: 90, variant: 'success' },
  { id: 'ccpp', name: 'C/C++', level: 50, variant: 'success' },
  { id: 'go', name: 'GO', level: 45, variant: 'success' },
  { id: 'java', name: 'Java', level: 20, variant: 'success' },
  { id: 'js', name: 'Javascript', level: 75, variant: 'success' },
  

  // Security Fields
  { id: 'web', name: 'Web Security', level: 80, variant: 'destructive' },
  { id: 'network', name: 'Network Pentesting', level: 70, variant: 'destructive' },
  { id: 'ai', name: 'AI Red Team', level: 60, variant: 'destructive' },
  { id: 'binary', name: 'Binary Exploitation', level: 40, variant: 'destructive' },

  // Operating Systems
  { id: 'linux', name: 'Linux (Debian/Arch)', level: 90, variant: 'warning' },
  { id: 'windows', name: 'Windows Active Directory', level: 65, variant: 'warning' },

  // General development
  { id: 'bash', name: 'Bash', level: 85, variant: 'accent' },
  { id: 'terraform', name: 'Terraform', level: 70, variant: 'accent' },
  { id: 'docker', name: 'Docker', level: 80, variant: 'accent' },
];

export default skills;
