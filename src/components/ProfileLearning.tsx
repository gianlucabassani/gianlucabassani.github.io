import { Button } from '@/components/ui/button';
import { useId, type CSSProperties } from 'react';
import { ArrowUpRight, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import certifications from '@/data/certifications';

export default function ProfileLearning() {
  const headingId = useId();
  const completed = certifications.filter(cert => cert.status === 'taken');
  const studying = certifications.filter(cert => cert.status === 'in-progress');

  return <section className="profile-learning" aria-labelledby={headingId}>
    <div className="profile-skills-heading">
      <h3 id={headingId}>Courses & certifications</h3>
      <Button asChild variant="outline"><Link to="/certifications">Full roadmap <ArrowUpRight className="action-arrow" size={19} aria-hidden="true" /></Link></Button>
    </div>
    <h4 className="profile-learning-label">In progress</h4>
    <ul className="profile-studies">
      {studying.map(cert => {
        const progress = cert.progress === undefined ? undefined : Math.min(100, Math.max(0, cert.progress));
        return <li className="profile-study" key={cert.id} data-ready={progress === 100}>
          <div className="profile-study-meta"><span>{cert.issuer}</span><span className="profile-study-milestone">{cert.milestone ?? 'In progress'}</span></div>
          <h5>{cert.link ? <a href={cert.link} target="_blank" rel="noopener noreferrer">{cert.title}<ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a> : cert.title}</h5>
          {progress !== undefined && <div className="profile-study-progress">
            <div className="profile-progress-caption"><span>{cert.progressLabel ?? 'Preparation progress'}</span><span>{progress}%</span></div>
            <div className="profile-progress-track" role="progressbar" aria-label={`${cert.title}: ${cert.progressLabel ?? 'Preparation progress'}`} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} style={{ '--course-progress': `${progress}%` } as CSSProperties}><span /></div>
          </div>}
        </li>;
      })}
    </ul>
    <h4 className="profile-learning-label profile-learning-completed"><Check size={13} aria-hidden="true" />Completed courses</h4>
    <ul className="profile-courses">
      {completed.map(cert => <li key={cert.id}>
        {cert.link ? <a className="profile-course" href={cert.link} target="_blank" rel="noopener noreferrer">
          <span className="profile-course-meta"><span>{cert.issuer}</span><span>{cert.year}</span></span>
          <h5>{cert.title}</h5>
          <span className="profile-course-verify">View credential <ExternalLink size={12} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></span>
        </a> : <div className="profile-course"><span className="profile-course-meta"><span>{cert.issuer}</span><span>{cert.year}</span></span><h5>{cert.title}</h5></div>}
      </li>)}
    </ul>
  </section>;
}
