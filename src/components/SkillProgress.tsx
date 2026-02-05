export interface Skill {
  id: string;
  name: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success' | 'destructive';
  description: string;
  tags: string[];
}

const skills: Skill[] = [
  // --- Programming Languages (Success/Green) ---
  { 
    id: 'python', 
    name: 'Python', 
    variant: 'success',
    description: 'Core language for security automation, script development, and tooling. Experience with db management, network socket manipulation, and data analysis.',
    tags: ['Requests', 'Scapy', 'Pandas', 'FastAPI', 'Automation']
  },
  { 
    id: 'ccpp', 
    name: 'C/C++', 
    variant: 'success',
    description: 'Low-level programming and memory management. Understanding of pointers, buffer handling, and system calls essential for binary analysis.',
    tags: ['Pointers', 'Memory Management', 'System Calls', 'Buffer Overflow']
  },
  { 
    id: 'go', 
    name: 'GO', 
    variant: 'success',
    description: 'Learning through development of optimized tools and CLI utilities.',
    tags: ['Concurrency', 'CLI Tools', 'Networking', 'Web3']
  },
  { 
    id: 'java', 
    name: 'Java', 
    variant: 'success',
    description: 'Understanding of OOP concepts. Necessary for analyzing Android APKs and legacy web apps.',
    tags: ['OOP', 'Android Logic', 'Static Analysis']
  },
  { 
    id: 'js', 
    name: 'Javascript', 
    variant: 'success',
    description: 'Client-side analysis and DOM manipulation. Critical for identifying XSS vectors and understanding modern frontend frameworks.',
    tags: ['DOM', 'XSS', 'React']
  },

  // --- Infrastructure (Accent/Purple) ---
  { 
    id: 'bash', 
    name: 'Bash', 
    variant: 'accent',
    description: 'System automation and reconnaissance scripting. Everyday usage for data visualization and computer management',
    tags: ['Scripting', 'Automation']
  },
  { 
    id: 'terraform', 
    name: 'Terraform', 
    variant: 'accent',
    description: 'Infrastructure as Code (IaC) for deploying scalable pentest labs and cloud environments (AWS/OpenStack).',
    tags: ['IaC', 'AWS','Cloud']
  },
  { 
    id: 'docker', 
    name: 'Docker', 
    variant: 'accent',
    description: 'Containerization for isolated testing environments. creation of vulnerable labs and general service orchestration.',
    tags: ['Container', 'Kubernetes', 'Networking']
  },

  // --- Security (Destructive/Red) ---
  { 
    id: 'web', 
    name: 'Web Security', 
    variant: 'destructive',
    description: 'Comprehensive testing of web applications including Auth bypass, SQLi, XSS, SSRF, logic flaws and more..',
    tags: ['Burp Suite', 'server/client-side vuln', 'Auth Bypass']
  },
  { 
    id: 'network', 
    name: 'Network Pentesting', 
    variant: 'destructive',
    description: 'Active Directory enumeration/exploitation, lateral movement, pivoting, and persistence',
    tags: ['Active Directory', 'Kerberos', 'netexec', 'Responder']
  },
  { 
    id: 'ai', 
    name: 'AI Red Team', 
    variant: 'destructive',
    description: 'Security testing of LLMs including prompt injection, jailbreaking and some model inversion, training data poisoning.',
    tags: ['Prompt Injection', 'Jailbreaking', 'Model Inversion']
  },
  { 
    id: 'binary', 
    name: 'Binary Exploitation', 
    variant: 'destructive',
    description: 'Experience with reverse engineering and pwn challenges. Stack/Heap overflows, ROP chains, and bypassing protections like ASLR/DEP.',
    tags: ['IDA', 'Binja', 'GDB', 'ROP', 'BoF']
  },
  { 
    id: 'mobile', 
    name: 'Mobile Pentesting', 
    variant: 'destructive',
    description: 'Android/iOS security assessment. Static analysis with JADX, dynamic instrumentation with Frida, and API traffic interception with Burp.',
    tags: ['JADX', 'Frida', 'APK Analysis', 'SSL Pinning']
  },
  { 
    id: 'wifi', 
    name: 'WiFi Pentesting', 
    variant: 'destructive',
    description: 'Wireless network auditing. WEP/WPS/WPA2 cracking, Rogue Access Points, and protocol analysis.',
    tags: ['Aircrack-ng', 'WPA2', 'Evil Twin']
  },

  // --- OS (Warning/Yellow) ---
  { 
    id: 'linux', 
    name: 'Linux (Debian/Arch)', 
    variant: 'warning',
    description: 'Knowledge of Linux internals, kernel space, permissions, and service management used for servers and CTFs.',
    tags: ['Kernel', 'Systemd', 'Hardening']
  },
  { 
    id: 'windows', 
    name: 'Windows AD', 
    variant: 'warning',
    description: 'Management and exploitation of Windows environments. Active Directory structures, GPOs.',
    tags: ['Active Directory', 'GPO', 'Registry Analysis']
  },
];

export default skills;