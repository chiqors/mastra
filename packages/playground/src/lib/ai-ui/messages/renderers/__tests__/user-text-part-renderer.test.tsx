import type { TextPart } from '@mastra/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { UserTextPartRenderer } from '../user-text-part-renderer';

describe('UserTextPartRenderer', () => {
  it('renders a system-reminder badge for system-reminder text', () => {
    const part = {
      type: 'text',
      text: '<system-reminder>path/to/file.ts updated</system-reminder>',
    } as TextPart;

    render(<UserTextPartRenderer part={part} />);

    expect(screen.getAllByText('System reminder').length).toBeGreaterThan(0);
  });

  it('renders attachment marker text as plain markdown content', () => {
    const part = { type: 'text', text: '<attachment name="notes.txt">hello body</attachment>' } as TextPart;

    render(<UserTextPartRenderer part={part} />);

    expect(screen.getByText(/hello body/)).toBeTruthy();
  });

  it('renders plain markdown text otherwise', () => {
    const part = { type: 'text', text: 'just some **markdown**' } as TextPart;

    render(<UserTextPartRenderer part={part} />);

    expect(screen.getByText('markdown')).not.toBeNull();
  });
});
