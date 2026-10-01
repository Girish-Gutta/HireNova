'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { logProctoringEvent } from '@/lib/api';

export interface ProctoringViolation {
  id: string;
  type: 'tab_switch' | 'copy_paste' | 'webcam_lost' | 'face_absent' | 'multiple_faces' | 'browser_blur';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
}

export function useProctoring(sessionId: string | null) {
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [violations, setViolations] = useState<ProctoringViolation[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const recordViolation = useCallback(
    async (
      type: ProctoringViolation['type'],
      severity: ProctoringViolation['severity'],
      message: string
    ) => {
      const violation: ProctoringViolation = {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        severity,
        message,
        timestamp: new Date().toISOString(),
      };

      setViolations((prev) => [violation, ...prev]);

      if (sessionId) {
        logProctoringEvent({
          sessionId,
          type,
          severity,
          metadata: { message, url: window.location.pathname },
        }).catch(() => {});
      }
    },
    [sessionId]
  );

  // Initialize webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsWebcamActive(true);
    } catch (err: any) {
      console.warn('[Proctoring] Webcam access failed or denied:', err.message);
      setIsWebcamActive(false);
      recordViolation('webcam_lost', 'high', 'Webcam video stream could not be accessed.');
    }
  }, [recordViolation]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsWebcamActive(false);
  }, []);

  useEffect(() => {
    startWebcam();

    // 1. Tab Switch / Page Visibility Listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('tab_switch', 'high', 'Tab switched or browser minimized during interview.');
      }
    };

    // 2. Window Blur (user clicked outside window)
    const handleWindowBlur = () => {
      recordViolation('browser_blur', 'medium', 'Browser window lost active focus.');
    };

    // 3. Paste Event Listener (detect copy-pasting code or text)
    const handlePaste = (e: ClipboardEvent) => {
      const pastedLength = e.clipboardData?.getData('text')?.length || 0;
      if (pastedLength > 15) {
        recordViolation(
          'copy_paste',
          'medium',
          `External text paste detected (${pastedLength} characters).`
        );
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('paste', handlePaste);
      stopWebcam();
    };
  }, [recordViolation, startWebcam, stopWebcam]);

  return {
    isWebcamActive,
    videoRef,
    violations,
    violationCount: violations.length,
    recordViolation,
  };
}
