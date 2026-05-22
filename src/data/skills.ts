export type Skill = {
  id: string;
  name: string;
  level: number; // 0 - 100
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success' | 'destructive';
};

const skills: Skill[] = [
  // Programming Languages
  { id: 'python', name: 'Python', level: 95, variant: 'success' },
  { id: 'ccpp', name: 'C/C++', level: 55, variant: 'success' },
  { id: 'go', name: 'GO', level: 60, variant: 'success' },
  { id: 'java', name: 'Java', level: 30, variant: 'success' },
  { id: 'js', name: 'Javascript', level: 75, variant: 'success' },

  // Security & Hacking
  { id: 'web', name: 'Web Security', level: 85, variant: 'destructive' },
  { id: 'network', name: 'Network Pentesting', level: 75, variant: 'destructive' },
  { id: 'ai-red', name: 'AI Red Teaming', level: 80, variant: 'destructive' },
  { id: 'binary', name: 'Binary Exploitation', level: 65, variant: 'destructive' },
  { id: 'mobile', name: 'Mobile Pentesting', level: 40, variant: 'destructive' },
  { id: 'wifi', name: 'WiFi Pentesting', level: 30, variant: 'destructive' },

  // AI Automation & Agentic Dev
  { id: 'mcp', name: 'Model Context Protocol (MCP)', level: 90, variant: 'accent' },
  { id: 'ai-agents', name: 'AI Agents & Automation', level: 85, variant: 'accent' },

  // Operating Systems
  { id: 'linux', name: 'Linux (Debian/Arch)', level: 90, variant: 'warning' },
  { id: 'windows', name: 'Windows Active Directory', level: 70, variant: 'warning' },

  // Infra & Automation
  { id: 'bash', name: 'Bash', level: 80, variant: 'secondary' },
  { id: 'terraform', name: 'Terraform', level: 70, variant: 'secondary' },
  { id: 'docker', name: 'Docker', level: 75, variant: 'secondary' },
];

export default skills;
