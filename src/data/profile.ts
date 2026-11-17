/**
 * Contact links used by the contact card and the global search.
 * Leave a link empty to hide it everywhere.
 */
const links = {
  github: 'https://github.com/gianlucabassani',
  gitlab: 'https://gitlab.com/gianlucabassani',
  linkedin: '',
  email: '',
};

export type ContactLink = { id: 'email' | 'linkedin' | 'github' | 'gitlab'; label: string; value: string; href: string };

export const contactLinks: ContactLink[] = ([
  { id: 'email', label: 'Email', value: links.email, href: `mailto:${links.email}` },
  { id: 'linkedin', label: 'LinkedIn', value: links.linkedin.replace(/^https?:\/\/(www\.)?/, ''), href: links.linkedin },
  { id: 'github', label: 'GitHub', value: links.github.replace(/^https?:\/\//, ''), href: links.github },
  { id: 'gitlab', label: 'GitLab', value: links.gitlab.replace(/^https?:\/\//, ''), href: links.gitlab },
] satisfies ContactLink[]).filter(link => link.value);
