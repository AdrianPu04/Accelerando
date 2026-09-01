"use client";

import { useCallback, useEffect, useState } from "react";

const LISTENING_COMPLETE_THRESHOLD = 0.9;

export function useReflectionPrompt(currentTime: number, duration: number) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen || duration <= 0) {
      return;
    }

    if (currentTime / duration >= LISTENING_COMPLETE_THRESHOLD) {
      setIsOpen(true);
    }
  }, [currentTime, duration, isOpen]);

  const openReflection = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    openReflection,
  };
}
