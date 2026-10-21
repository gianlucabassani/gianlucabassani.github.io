import type { FC } from 'react';
import type { Writeup } from '@/data/writeups';
import WriteupArchiveView from './WriteupArchiveView';

interface PlatformViewProps {
  platform: string;
  onBack: () => void;
  onWriteupSelect: (writeup: Writeup) => void;
}

const PlatformView: FC<PlatformViewProps> = () => <WriteupArchiveView kind="boxes" />;
export default PlatformView;
