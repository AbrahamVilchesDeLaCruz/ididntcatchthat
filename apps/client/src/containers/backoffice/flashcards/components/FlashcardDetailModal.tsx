import { type ReactElement, useRef, useState } from 'react';
import type { FlashcardVM } from '../flashcards.types';
import { useI18n } from '@/core/i18n';

interface AudioPlayerButtonProps {
  label: string;
  flag: string;
  url: string;
}

const AudioPlayerButton = ({
  label,
  flag,
  url,
}: AudioPlayerButtonProps): ReactElement => {
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (): void => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    } else {
      void audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <audio
        ref={audioRef}
        src={url}
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        type="button"
        onClick={handlePlay}
        className={`w-14 h-14 rounded-full text-2xl flex items-center justify-center border-2 transition-all ${
          isPlaying
            ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white scale-95'
            : 'border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] hover:bg-[var(--color-bg-card)] hover:border-[var(--color-brand)]'
        }`}
        aria-label={t.backoffice.flashcards.detail.playAccentAriaLabel.replace(
          '{label}',
          label,
        )}
      >
        {isPlaying ? '⏹' : flag}
      </button>
      <span className="text-xs text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
};

interface FlashcardDetailModalProps {
  flashcard: FlashcardVM;
  isRegenerating: boolean;
  onRegenerateAudio: () => void;
  onClose: () => void;
}

export const FlashcardDetailModal = ({
  flashcard,
  isRegenerating,
  onRegenerateAudio,
  onClose,
}: FlashcardDetailModalProps): ReactElement => {
  const { t } = useI18n();
  const hasAudio =
    flashcard.audioStatus === 'ready' && flashcard.audioUrls !== null;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-[var(--color-border)]">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">
              {flashcard.expression}
            </h2>
            {flashcard.ipaNotation && (
              <p className="text-sm text-[var(--color-text-secondary)] mt-1 font-mono">
                {flashcard.ipaNotation}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition text-xl leading-none ml-4 mt-1"
            aria-label={t.backoffice.flashcards.detail.closeAriaLabel}
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Meaning + nativeSpeech */}
          <div className="space-y-1">
            <p className="text-[var(--color-text-primary)] text-base">
              {flashcard.meaning}
            </p>
            {flashcard.nativeSpeech && (
              <p className="text-[var(--color-text-secondary)] text-sm italic">
                &ldquo;{flashcard.nativeSpeech}&rdquo;
              </p>
            )}
          </div>

          {/* Audio section */}
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-3 font-medium">
              {t.backoffice.flashcards.detail.pronunciation}
            </p>

            {flashcard.audioStatus === 'pending' && (
              <p className="text-[var(--color-text-muted)] text-sm">
                {t.backoffice.flashcards.detail.pendingAudio}
              </p>
            )}

            {flashcard.audioStatus === 'generating' && (
              <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin" />
                {t.backoffice.flashcards.detail.generatingAudio}
              </div>
            )}

            {flashcard.audioStatus === 'failed' && (
              <div className="space-y-3">
                <p className="text-[var(--color-accent-red)] text-sm">
                  {t.backoffice.flashcards.detail.failedAudio}
                </p>
                <button
                  type="button"
                  onClick={onRegenerateAudio}
                  disabled={isRegenerating}
                  aria-label={
                    t.backoffice.flashcards.detail.retryAudioAriaLabel
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:border-[var(--color-brand)] disabled:opacity-50"
                >
                  {isRegenerating && (
                    <span className="w-3 h-3 rounded-full border-2 border-[var(--color-border-strong)] border-t-[var(--color-text-secondary)] animate-spin" />
                  )}
                  {t.backoffice.flashcards.detail.retryAudio}
                </button>
              </div>
            )}

            {hasAudio && flashcard.audioUrls && (
              <div className="space-y-4">
                <div className="flex items-center gap-6">
                  <AudioPlayerButton
                    label={t.backoffice.flashcards.detail.american}
                    flag="🇺🇸"
                    url={flashcard.audioUrls.expression.us}
                  />
                  <AudioPlayerButton
                    label={t.backoffice.flashcards.detail.british}
                    flag="🇬🇧"
                    url={flashcard.audioUrls.expression.uk}
                  />
                  <AudioPlayerButton
                    label={t.backoffice.flashcards.detail.australian}
                    flag="🇦🇺"
                    url={flashcard.audioUrls.expression.au}
                  />
                </div>

                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    {t.backoffice.flashcards.detail.examplesAudio}
                  </p>
                  <AudioPlayerButton
                    label={t.backoffice.flashcards.detail.examplesLabel}
                    flag="🎧"
                    url={flashcard.audioUrls.examples.us}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Examples */}
          {flashcard.examples.length > 0 && (
            <div>
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-3 font-medium">
                {t.backoffice.flashcards.detail.examplesLabel}
              </p>
              <ul className="space-y-3">
                {flashcard.examples
                  .slice()
                  .sort((a, b) => a.position - b.position)
                  .map((ex) => (
                    <li
                      key={ex.id}
                      className="bg-[var(--color-bg-elevated)] rounded-lg px-4 py-3 border border-[var(--color-border)]"
                    >
                      <p className="text-[var(--color-text-primary)] text-sm">
                        {ex.textEn}
                      </p>
                      <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                        {ex.textEs}
                      </p>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* Meta chips */}
          <div className="flex gap-2 flex-wrap pt-2 border-t border-[var(--color-border)]">
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {flashcard.category}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {flashcard.subcategory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
