"use client";

import { useCallback, useState } from "react";

export function useReflectionPrompt() {
  const [isOpen, setIsOpen] = useState(false);

  const openReflection = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeReflection = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setReflectionOpen = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return {
    isOpen,
    openReflection,
    closeReflection,
    setReflectionOpen,
  };
}
