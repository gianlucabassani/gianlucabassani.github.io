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
    description: 'Core language for security automation, exploit development, and tooling. Experience with async programming, network socket manipulation, and data analysis.',
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
    description: 'Development of concurrent tools and CLI utilities. Used for high-performance network scanning and blockchain interactions.',
    tags: ['Concurrency', 'CLI Tools', 'Networking', 'Web3']
  },
  { 
    id: 'java', 
    name: 'Java', 
    variant: 'success',
    description: 'Understanding of OOP concepts and enterprise application structures. Necessary for analyzing Android APKs and legacy web apps.',
    tags: ['OOP', 'Spring Boot', 'Android Logic', 'Static Analysis']
  },
  { 
    id: 'js', 
    name: 'Javascript', 
    variant: 'success',
    description: 'Client-side analysis and DOM manipulation. Critical for identifying XSS vectors and understanding modern frontend frameworks.',
    tags: ['DOM', 'XSS', 'Node.js', 'React', 'Fetch API']
  },

  // --- Infrastructure (Accent/Purple) ---
  { 
    id: 'bash', 
    name: 'Bash', 
    variant: 'accent',
    description: 'Advanced system automation and reconnaissance scripting. Proficient with grep, awk, sed, and piping for data extraction.',
    tags: ['Scripting', 'Automation', 'Text Processing', 'Cron']
  },
  { 
    id: 'terraform', 
    name: 'Terraform', 
    variant: 'accent',
    description: 'Infrastructure as Code (IaC) for deploying scalable pentest labs and cloud environments (AWS/OpenStack).',
    tags: ['IaC', 'AWS', 'State Management', 'Modules']
  },
  { 
    id: 'docker', 
    name: 'Docker', 
    variant: 'accent',
    description: 'Containerization for isolated testing environments. creation of vulnerable labs and service orchestration.',
    tags: ['Compose', 'Containerization', 'Networking', 'Images']
  },

  // --- Security (Destructive/Red) ---
  { 
    id: 'web', 
    name: 'Web Security', 
    variant: 'destructive',
    description: 'Comprehensive testing of web applications including Auth bypass, SQLi, XSS, SSRF, IDOR and business logic flaws.',
    tags: ['OWASP Top 10', 'Burp Suite', 'Injection', 'Auth Bypass']
  },
  { 
    id: 'network', 
    name: 'Network Pentesting', 
    variant: 'destructive',
    description: 'Active Directory exploitation, lateral movement, pivoting, Kerberoasting, and infrastructure mapping.',
    tags: ['Active Directory', 'Pivoting', 'Kerberos', 'Nmap', 'Responder']
  },
  { 
    id: 'ai', 
    name: 'AI Red Team', 
    variant: 'destructive',
    description: 'Security testing of LLMs including prompt injection, jailbreaking, model inversion, and training data poisoning.',
    tags: ['Prompt Injection', 'LLM Security', 'Jailbreaking', 'Model Inversion']
  },
  { 
    id: 'binary', 
    name: 'Binary Exploitation', 
    variant: 'destructive',
    description: 'Reverse engineering and vulnerability research. Stack/Heap overflows, ROP chains, and bypassing protections like ASLR/DEP.',
    tags: ['Ghidra', 'GDB', 'ROP', 'Buffer Overflow', 'Reverse Engineering']
  },
  { 
    id: 'mobile', 
    name: 'Mobile Pentesting', 
    variant: 'destructive',
    description: 'Android/iOS security assessment. Static analysis with JADX, dynamic instrumentation with Frida, and API traffic interception.',
    tags: ['JADX', 'Frida', 'APK Analysis', 'SSL Pinning']
  },
  { 
    id: 'wifi', 
    name: 'WiFi Pentesting', 
    variant: 'destructive',
    description: 'Wireless network auditing. WEP/WPA2 cracking, Rogue Access Points, and protocol analysis.',
    tags: ['Aircrack-ng', 'WPA2', 'Handshake Capture', 'Deauth']
  },

  // --- OS (Warning/Yellow) ---
  { 
    id: 'linux', 
    name: 'Linux (Debian/Arch)', 
    variant: 'warning',
    description: 'Deep knowledge of Linux internals, kernel space, permissions, and service management used for servers and CTFs.',
    tags: ['Kernel', 'Permissions', 'Systemd', 'Hardening']
  },
  { 
    id: 'windows', 
    name: 'Windows AD', 
    variant: 'warning',
    description: 'Management and exploitation of Windows environments. Active Directory structures, GPOs, and PowerShell automation.',
    tags: ['Active Directory', 'PowerShell', 'GPO', 'Registry']
  },
];

export default skills;