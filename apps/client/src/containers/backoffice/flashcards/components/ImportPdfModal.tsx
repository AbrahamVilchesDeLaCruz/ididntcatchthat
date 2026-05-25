import { useRef, useState, type ReactElement } from 'react';
import type { FlashcardDraftApiModel } from '../api/flashcards.api-model';

type Step = 'upload' | 'preview';

interface ImportPdfModalProps {
  isUploading: boolean;
  isImporting: boolean;
  onUpload: (file: File) => void;
  drafts: FlashcardDraftApiModel[] | null;
  onConfirm: (drafts: FlashcardDraftApiModel[]) => void;
  onClose: () => void;
}

export const ImportPdfModal = ({
  isUploading,
  isImporting,
  onUpload,
  drafts,
  onConfirm,
  onClose,
}: ImportPdfModalProps): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const step: Step = drafts !== null ? 'preview' : 'upload';

  const handleFileSelect = (file: File): void => {
    if (file.type !== 'application/pdf') return;
    onUpload(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    setDragOver(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-[var(--color-bg-surface,#1a1a2e)] rounded-xl w-full max-w-2xl border border-white/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-white font-semibold text-lg">
              Importar desde PDF
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {step === 'upload'
                ? 'Subí un PDF y la IA extraerá flashcards automáticamente'
                : `${String(drafts?.length ?? 0)} flashcards extraídas — revisá y confirmá`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading || isImporting}
            className="text-gray-400 hover:text-white transition text-xl leading-none disabled:opacity-40"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 'upload' ? (
            <div
              className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed py-16 transition cursor-pointer ${
                dragOver
                  ? 'border-white/40 bg-white/5'
                  : 'border-white/10 hover:border-white/20'
              } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <p className="text-gray-400 text-sm">Procesando PDF…</p>
                </>
              ) : (
                <>
                  <div className="text-4xl">📄</div>
                  <div className="text-center">
                    <p className="text-white font-medium">
                      Arrastrá un PDF o hacé clic para seleccionar
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Máximo 10 MB · solo archivos PDF
                    </p>
                  </div>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {drafts?.map((draft, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-white font-medium text-sm">
                      {draft.expression}
                    </p>
                    <span className="text-xs text-gray-500 shrink-0">
                      {draft.category} / {draft.subcategory}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{draft.meaning}</p>
                  {draft.ipaNotation && (
                    <p className="text-gray-500 text-xs font-mono">
                      /{draft.ipaNotation}/
                    </p>
                  )}
                  {draft.examples.length > 0 && (
                    <p className="text-gray-600 text-xs pt-1">
                      {String(draft.examples.length)} ejemplo
                      {draft.examples.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex justify-end gap-3 p-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => drafts && onConfirm(drafts)}
              disabled={isImporting || !drafts?.length}
              className="px-5 py-2 text-sm bg-white text-black font-semibold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isImporting
                ? 'Importando…'
                : `Importar ${String(drafts?.length ?? 0)} flashcards`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
