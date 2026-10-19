import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, CircleDot, Layers } from 'lucide-react';

interface FilterOption {value: string; label: string; count?: number}

export default function ProjectFilter({label, value, options, onChange, kind}: {
  label: string; value: string; options: FilterOption[]; onChange: (value: string) => void; kind: 'category' | 'status';
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const choices = useRef<(HTMLButtonElement | null)[]>([]);
  const search = useRef({text:'', time:0});
  const selected = options.find(option => option.value === value) || options[0];
  const Icon = kind === 'category' ? Layers : CircleDot;
  useEffect(() => {
    if (!open) return;
    choices.current[Math.max(0, options.findIndex(option => option.value === value))]?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const focusOutside = (event: FocusEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focusOutside);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('focusin', focusOutside); };
  }, [open, options, value]);
  const choose = (next: string) => { onChange(next); setOpen(false); trigger.current?.focus(); };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    const index = choices.current.findIndex(option => option === document.activeElement);
    let next = index;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false); trigger.current?.focus(); return; }
    if (event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    else if (event.key.length === 1 && event.key !== ' ' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = performance.now();
      search.current = {text:(now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase(), time:now};
      const match = options.findIndex(option => option.label.toLowerCase().startsWith(search.current.text));
      if (match >= 0) next = match;
    } else return;
    event.preventDefault();
    choices.current[next]?.focus();
  };
  return <div className={`project-filter project-filter-${kind}`} ref={root} onKeyDown={keyboard}>
    <span className="project-filter-label" id={`${id}-label`}>{label}</span>
    <button type="button" className="project-filter-trigger" ref={trigger} aria-labelledby={`${id}-label ${id}-value`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? `${id}-options` : undefined} data-filtered={value !== 'all'}
      onClick={() => setOpen(!open)} onKeyDown={event => { if (!open && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); setOpen(true); } }}>
      <Icon size={16} aria-hidden="true" /><span id={`${id}-value`}>{selected.label}</span><ChevronDown size={15} aria-hidden="true" />
    </button>
    {open && <div className="project-filter-options" id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`}>
      {options.map((option, index) => <button key={option.value} ref={element => {choices.current[index] = element;}} type="button" role="option" aria-selected={option.value === value} tabIndex={-1} onClick={() => choose(option.value)}>
        <span className="project-filter-check">{option.value === value && <Check size={14} aria-hidden="true" />}</span><span>{option.label}</span>
        {option.count !== undefined && <span className="project-filter-option-count">{option.count}</span>}
      </button>)}
    </div>}
  </div>;
}
