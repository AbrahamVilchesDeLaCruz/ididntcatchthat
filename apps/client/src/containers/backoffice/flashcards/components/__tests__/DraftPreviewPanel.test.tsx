import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DraftPreviewPanel } from '../DraftPreviewPanel';
import type { FlashcardDraftApiModel } from '../../api/flashcards.api-model';

const draft: FlashcardDraftApiModel = {
  expression: 'gonna',
  meaning: 'Forma corta de going to',
  category: 'connected_speech',
  subcategory: 'informal_going_to',
  ipaNotation: 'ˈɡɒnə',
  nativeSpeech: 'gonna',
  examples: [
    {
      textEn: "I'm gonna be late.",
      textEs: 'Voy a llegar tarde.',
    },
  ],
};

describe('DraftPreviewPanel', () => {
  it('muestra el texto de los ejemplos generados', () => {
    render(<DraftPreviewPanel drafts={[draft]} />);

    expect(screen.getByText("I'm gonna be late.")).toBeInTheDocument();
    expect(screen.getByText('Voy a llegar tarde.')).toBeInTheDocument();
  });

  it('indica cuando no hay ejemplos', () => {
    render(<DraftPreviewPanel drafts={[{ ...draft, examples: [] }]} />);

    expect(
      screen.getByText(/No generated examples\.|Sin ejemplos generados\./),
    ).toBeInTheDocument();
  });
});
