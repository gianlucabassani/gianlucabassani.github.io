import skills from './skills';

/** Shared categories, ordered and weighted by the owner's stated strengths. */
export const skillGroups = [
  { id: 'offensive-security', title: 'Offensive Security', label: ['Offensive', 'Security'], value: 95, ids: ['web', 'network', 'ai-red', 'binary', 'mobile', 'wifi'], description: 'Offensive security is my main field of work. I focus on finding attack paths, chaining weaknesses, and understanding why an exploit works.' },
  { id: 'ai-agents', title: 'AI & Automation', label: ['AI &', 'Automation'], value: 85, ids: ['mcp', 'ai-agents', 'bash'], description: 'I build agents, MCP integrations, and scripts to automate security workflows. The interesting part is connecting them to real tools and environments.' },
  { id: 'operating-systems', title: 'Operating Systems', label: ['Operating', 'Systems'], value: 75, ids: ['linux', 'windows'], description: 'I work with Linux and Windows environments, digging into processes, permissions, and services. Understanding the system makes both troubleshooting and exploitation easier.' },
  { id: 'coding', title: 'Programming', label: ['Programming'], value: 75, ids: ['python', 'ccpp', 'go', 'java', 'js'], description: 'My strength is understanding programming paradigms, design principles, and patterns across languages. I use that foundation to read, reason about, and adapt code in security research and projects.' },
  { id: 'infra-automation', title: 'Infra / Cloud (IaC)', label: ['Infra / Cloud', '(IaC)'], value: 55, ids: ['terraform', 'docker'], description: 'I use Terraform and Docker to set up infrastructure and isolated labs. My focus is making environments reproducible and easier to rebuild while experimenting.' },
].map(group => ({
  ...group,
  skills: group.ids.map(id => skills.find(skill => skill.id === id)!),
}));
