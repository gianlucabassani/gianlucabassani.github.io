import React from 'react';
import { Badge } from '@/components/ui/badge';

export type Skill = {
  id: string;
  name: string;
  level: number;
  variant?: 'primary' | 'secondary' | 'accent' | 'warning' | 'success';
};

const variantClass: Record<NonNullable<Skill['variant']>, string> = {
  primary: 'bg-gradient-to-r from-primary to-primary/70',
  secondary: 'bg-gradient-to-r from-secondary to-secondary/70',
  accent: 'bg-gradient-to-r from-accent to-accent/70',
  warning: 'bg-gradient-to-r from-warning to-warning/70',
  success: 'bg-gradient-to-r from-success to-success/70',
};

export default function SkillProgress({ skills }: { skills: Skill[] }) {
  return (
    <div className="space-y-4">
      {skills.map((skill) => (
        <div key={skill.id} className="">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="font-medium text-sm">{skill.name}</div>
              <Badge variant="secondary" className="text-xs">{skill.level}%</Badge>
            </div>
            <div className="text-xs text-muted-foreground">Proficiency</div>
          </div>

          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className={`${variantClass[skill.variant || 'primary']} h-full rounded-full transition-all duration-700 ease-in-out`}
              style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}
              aria-valuenow={skill.level}
              aria-valuemin={0}
              aria-valuemax={100}
              role="progressbar"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
