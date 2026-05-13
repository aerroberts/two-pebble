import { IconButton } from '../input/icon-button/icon-button';
import type { SpeakController } from './types';

interface SpeakTextButtonProps {
  text: string;
  controller: SpeakController;
}

export function SpeakTextButton(props: SpeakTextButtonProps) {
  const trimmed = props.text.trim();
  if (trimmed.length === 0) return null;
  const isActive = props.controller.activeText === trimmed;
  const status = isActive ? props.controller.state : 'idle';
  const icon = status === 'loading' ? 'loader-circle' : status === 'playing' ? 'square' : 'volume-2';
  const ariaLabel =
    status === 'loading'
      ? 'Synthesizing speech — click to cancel'
      : status === 'playing'
        ? 'Stop playback'
        : 'Speak this message';
  const className = status === 'loading' ? 'animate-spin' : undefined;
  const onClick = () => {
    if (status === 'idle') props.controller.start(trimmed);
    else props.controller.stop();
  };
  return (
    <IconButton
      aria-label={ariaLabel}
      icon={icon}
      onClick={onClick}
      size="sm"
      title={ariaLabel}
      variant="secondary"
      className={className}
    />
  );
}
