export type Certification = {
  id: string;
  title: string;
  issuer: string;
  year?: string;
  status: 'taken' | 'in-progress' | 'todo';
  description: string;
  link?: string;
};

const certifications: Certification[] = [
  {
    id: 'ccna-suite',
    title: 'CCNA (ITN / SRWE / ENSA)',
    issuer: 'Cisco',
    year: '2025',
    status: 'taken',
    description: 'Course completion. Cisco networking certifications covering routing, switching, security and network fundamentals.',
  },
  {
    id: 'aws-academy',
    title: 'AWS Certified Cloud Practitioner',
    issuer: 'Amazon Web Services',
    year: '2025',
    status: 'taken',
    description: 'Course completion. Cloud foundations and practical AWS skills from the AWS Academy program.',
  },
  {
    id: 'cpts',
    title: 'Certified Penetration Tester Specialist (CPTS)',
    issuer: 'Hack The Box',
    status: 'in-progress',
    description: 'Hands-on intermediate penetration testing certification focused on identifying, chaining, exploiting vulnerabilities, and delivering professional remediation reports.',
    link: 'https://academy.hackthebox.com/exams/3/',
  },
  {
    id: 'oscp',
    title: 'Offensive Security Certified Professional (OSCP)',
    issuer: 'Offensive Security',
    status: 'todo',
    description: 'Plan to prepare for OSCP to deepen hands-on offensive skills and exploit development.',
  },
];

export default certifications;
