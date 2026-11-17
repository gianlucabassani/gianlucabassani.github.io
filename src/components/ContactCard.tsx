import { ArrowUpRight, Github, Gitlab, Linkedin, Mail } from 'lucide-react';
import { contactLinks } from '@/data/profile';

const icons = { email: Mail, linkedin: Linkedin, github: Github, gitlab: Gitlab };

export default function ContactCard() {
  return <div className="contact-card">
    <svg className="contact-card-frame" viewBox="0 0 1200 360" preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="contact-surface" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="hsl(270 29% 13% / 0.98)" /><stop offset="0.6" stopColor="hsl(268 29% 8% / 0.98)" /><stop offset="1" stopColor="hsl(246 31% 12% / 0.98)" />
      </linearGradient></defs>
      <path fill="url(#contact-surface)" d="M25 1H1199V335L1175 359H1V25Z" />
      <path className="contact-card-edge" d="M1 72V25L25 1H310M890 1H1199V130M1199 280V335L1175 359H930M310 359H1V250" />
    </svg>
    <div className="contact-card-copy">
      <p className="contact-card-signal"><span aria-hidden="true" />Open to collaboration</p>
      <h3>Want to work on something together?</h3>
      <p>Research, tooling, CTFs or a project that could use another pair of hands. I'm open to collaborations of any size.</p>
    </div>
    <ul className="contact-card-links">
      {contactLinks.map(link => {
        const Icon = icons[link.id];
        return <li key={link.id}><a href={link.href} target={link.id === 'email' ? undefined : '_blank'} rel="noopener noreferrer me">
          <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
          <span><strong>{link.label}</strong><small>{link.value}</small></span>
          <ArrowUpRight className="contact-card-arrow" size={17} aria-hidden="true" />
          {link.id !== 'email' && <span className="sr-only"> (opens in a new tab)</span>}
        </a></li>;
      })}
    </ul>
  </div>;
}
