import Image from "next/image";
import type { UseFileUploadReturn } from "@/hooks/use-file-upload";

const getDropZoneClasses = (isActive: boolean) =>
  `mt-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
    isActive ? "border-[#1C6BE8] bg-[#f0f5ff]" : "border-[#d9dff0] bg-[#f9fbff]"
  }`;

const formatFileSize = (size: number) => `${(size / 1024).toFixed(1)} КБ`;

export type FileUploadModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  onClose: () => void;
  upload: UseFileUploadReturn;
  onSubmit: () => void;
  submitLabel: string;
  submittingLabel: string;
  isSubmitting: boolean;
  hideDropzoneOnFile?: boolean;
  children?: React.ReactNode;
};

export function FileUploadModal({
  isOpen,
  title,
  description,
  onClose,
  upload,
  onSubmit,
  submitLabel,
  submittingLabel,
  isSubmitting,
  hideDropzoneOnFile = false,
  children,
}: FileUploadModalProps) {
  if (!isOpen) {
    return null;
  }

  const {
    file,
    isDragging,
    inputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    triggerFilePicker,
    reset,
  } = upload;

  const shouldRenderDropzone = !(hideDropzoneOnFile && file);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(7,10,25,0.55)] px-4 py-8">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#1b1f3b]">{title}</h1>
            <p className="text-sm text-[#7c8494]">{description}</p>
          </div>
          <button
            type="button"
            aria-label="Закрыть"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-full p-2 text-[#9aa3b5] transition hover:bg-[#f2f5fb] hover:text-[#1b1f3b]"
          >
            <Image
              src="/icons/menu_close.svg"
              alt="Закрыть"
              width={24}
              height={24}
            />
          </button>
        </div>

        {shouldRenderDropzone && (
          <div
            className={getDropZoneClasses(isDragging)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <Image
              src="/icons/import_black.svg"
              alt="Импорт"
              width={40}
              height={40}
            />
            <p className="mt-4 text-base font-medium text-[#1b1f3b]">
              Перетащите файл сюда
            </p>
            <p className="text-sm text-[#7c8494]">или</p>
            <button
              type="button"
              onClick={triggerFilePicker}
              className="mt-2 rounded-2xl bg-[#1C6BE8] px-6 py-2.5 font-bold text-white transition hover:bg-[#1557d1]"
            >
              Выбрать файл
            </button>
          </div>
        )}

        {file && (
          <div className="mt-4 rounded-2xl border border-[#e1e5f0] bg-[#f9fbff] px-4 py-3 text-sm text-[#1b1f3b]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-1 flex-col">
                <span className="font-semibold">{file.name}</span>
                <span className="text-xs text-[#7c8494]">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                className="rounded-full p-1 text-[#9aa3b5] transition hover:bg-[#f2f5fb] hover:text-[#1b1f3b]"
                aria-label="Удалить файл"
                onClick={reset}
              >
                <Image
                  src="/icons/menu_close.svg"
                  alt="Удалить"
                  width={20}
                  height={20}
                />
              </button>
            </div>
          </div>
        )}

        {children}

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="rounded-2xl border border-[#d9dff0] px-6 py-2.5 font-semibold text-[#1b1f3b] transition hover:border-[#1C6BE8]"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!file || isSubmitting}
            className="rounded-2xl bg-[#1C6BE8] px-6 py-2.5 font-semibold text-white transition hover:bg-[#1557d1] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
