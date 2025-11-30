import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextFile = event.target.files?.[0] ?? null;
      if (nextFile) {
        setFile(nextFile);
      }
    },
    []
  );

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.target === event.currentTarget) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
    setIsDragging(false);
  }, []);

  const triggerFilePicker = () => {
    inputRef.current?.click();
  };

  const reset = () => {
    setFile(null);
    setIsDragging(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return {
    file,
    isDragging,
    inputRef,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFilePicker,
    reset,
  };
};

export type UseFileUploadReturn = ReturnType<typeof useFileUpload>;
