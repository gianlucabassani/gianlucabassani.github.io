interface ArticleSummaryProps {
  summary: string;
  tags: string[];
}

export default function ArticleSummary({summary, tags}: ArticleSummaryProps) {
  return <section className="reader-summary" aria-label="Article introduction">
    <p className="reader-summary-text">{summary}</p>
    {tags.length > 0 && <ul className="reader-summary-topics" aria-label="Topics">
      {tags.map(tag => <li key={tag}>{tag}</li>)}
    </ul>}
  </section>;
}
