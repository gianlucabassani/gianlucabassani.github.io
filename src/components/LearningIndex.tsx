import { ArrowUpRight } from 'lucide-react';
import { learningResources } from '@/data/learningResources';

export default function LearningIndex() {
  return <aside className="learning-index" aria-labelledby="learning-index-title">
    <div className="learning-index-intro"><h3 id="learning-index-title">Where I learn</h3><p>A few places I come back to.</p></div>
    <ul>{learningResources.map(resource => <li key={resource.href}><a href={resource.href} target="_blank" rel="noopener noreferrer"><span className="learning-index-topic">{resource.topic}</span><span className="learning-index-resource"><strong>{resource.name}</strong><span>{resource.note}</span></span><ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only">Opens in a new tab</span></a></li>)}</ul>
  </aside>;
}
