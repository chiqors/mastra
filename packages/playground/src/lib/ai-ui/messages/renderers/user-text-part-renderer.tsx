import type { TextPart } from '@mastra/react';

import type { MessageMetadata } from '../message-metadata';
import { SystemReminderBadge } from '../system-reminder-badge';
import { MessageText } from './message-text';

export interface UserTextPartRendererProps {
  part: TextPart;
  metadata?: MessageMetadata;
}

/**
 * Renders a user `MessageFactory` `Text` slot. System-reminder text gets a
 * dedicated badge; everything else renders as markdown.
 */
export const UserTextPartRenderer = ({ part, metadata }: UserTextPartRendererProps) => {
  const text = part.text ?? '';

  if (text.trimStart().startsWith('<system-reminder')) {
    return <SystemReminderBadge text={text} />;
  }

  return <MessageText text={text} metadata={metadata} />;
};
