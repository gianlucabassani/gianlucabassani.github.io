export type Certification = {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  status: 'taken' | 'in-progress' | 'todo';
  description: string;
  link?: string;
  progress?: number; // Progress percentage for in-progress certifications
};

const certifications: Certification[] = [
  {
    id: 'cwes',
    title: 'Web Exploitation Specialist Course (CWES)',
    issuer: 'Hack The Box',
    year: '2025',
    status: 'taken',
    description: 'Course Completition. Technical competency in the WAPT and bug bounty hunting domains at an intermediate level. Ability to assess the risk at which a web application, service, or API is exposed ',
    link: 'https://academy.hackthebox.com/achievement/553946/path/17',
  },
  {
    id: 'ai-red-teamer',
    title: 'AI Red Teamer Course',
    issuer: 'Hack The Box',
    year: '2025',
    status: 'taken',
    description: 'Course completion. Training program developed with Google, covering prompt injection, model exploitation, and SAIF-aligned defense strategies.',
    link: 'https://academy.hackthebox.com/achievement/553946/path/418',
  },
  {
    id: 'ccna-suite',
    title: 'CCNA Course: ITN / SRWE / ENSA',
    issuer: 'Cisco',
    year: '2025',
    status: 'taken',
    description: 'Course completion. Cisco networking certifications covering routing, switching, security and network fundamentals.',
    link: 'https://www.credly.com/badges/802580c6-98a5-4941-a7cb-3f897c845009/linked_in_profile',
  },
  {
    id: 'aws-academy',
    title: 'AWS Academy Graduate - Cloud Foundations',
    issuer: 'Amazon Web Services',
    year: '2025',
    status: 'taken',
    description: 'Course completion. Cloud foundations and practical AWS skills from the AWS Academy program.',
    link:'https://www.credly.com/badges/2e482f0a-37bb-40f3-a965-f9dd00ccb10f/linked_in_profile'
  },
  {
    id: 'cpts',
    title: 'Certified Penetration Tester Specialist (CPTS)',
    issuer: 'Hack The Box',
    status: 'in-progress',
    description: 'INCOMING EXAM: Intermediate penetration testing certification focused on identifying, chaining, exploiting vulnerabilities, and delivering professional remediation reports.',
    link: 'https://academy.hackthebox.com/exams/3/',
    progress: 100,
  },
  {
    id: 'burp-suite',
    title: 'Burp Suite Certified Practitioner (BSCP)',
    issuer: 'PortSwigger',
    status: 'in-progress',
    description: 'Demonstrates a deep knowledge of web security vulnerabilities, the correct mindset to exploit them, and of course, the Burp Suite skills needed to carry this out',
    link: 'https://portswigger.net/web-security/certification',
    progress: 70,
  },
  {
    id: 'oscp',
    title: 'Offensive Security Certified Professional (OSCP)',
    issuer: 'Offensive Security',
    status: 'todo',
    description: 'Core pentesting skills including enumeration, exploitation, and evidence gathering for proof of work.',
    link: 'https://www.offsec.com/courses/pen-200/',
  },
];

export default certifications;
