import { Shield } from 'lucide-react';

const names: Record<string, string> = {hackthebox:'Hack The Box', tryhackme:'TryHackMe', vulnhub:'VulnHub'};

export default function PlatformLogo({platform, large = false, decorative = false}: {platform: string; large?: boolean; decorative?: boolean}) {
  if (!names[platform]) return <Shield size={48} aria-hidden="true" />;
  return <img className={`platform-logo ${large ? 'platform-logo-large' : ''}`} src={`/assets/platforms/${platform}.svg`} alt={decorative ? '' : names[platform]} width={large ? 240 : 180} height={large ? 110 : 80} />;
}
