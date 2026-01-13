export type Skill = {
  id: string;
  name: string;
  level: number; // 0 - 100
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success';
};

const skills: Skill[] = [
  // Programming Languages
  { id: 'python', name: 'Python', level: 90, variant: 'primary' },
  { id: 'ccpp', name: 'C/C++', level: 70, variant: 'primary' },
  { id: 'go', name: 'GO', level: 35, variant: 'warning' },
  { id: 'java', name: 'Java', level: 20, variant: 'warning' },
  { id: 'js', name: 'Javascript', level: 75, variant: 'primary' },
  

  // Security Fields
  { id: 'web', name: 'Web Security', level: 90, variant: 'secondary' },
  { id: 'network', name: 'Network Pentesting', level: 70, variant: 'accent' },
  { id: 'ai', name: 'AI Red Team', level: 60, variant: 'warning' },
  { id: 'binary', name: 'Binary Exploitation', level: 40, variant: 'warning' },

  // Operating Systems
  { id: 'linux', name: 'Linux (Debian/Arch)', level: 90, variant: 'primary' },
  { id: 'windows', name: 'Windows Active Directory', level: 50, variant: 'secondary' },

  // General development
  { id: 'bash', name: 'Bash', level: 85, variant: 'primary' },
  { id: 'terraform', name: 'Terraform', level: 70, variant: 'primary' },
  { id: 'docker', name: 'Docker', level: 80, variant: 'primary' },
];

export default skills;
