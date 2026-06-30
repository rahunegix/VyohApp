"use client";

import { useEffect, useState } from "react";
import { useEditProfile } from "@/hooks/use-edit-profile";
import { getMyProfileAnswers } from "@/services/actions";

export function useProfileAiData() {
  const { profile, loading: profileLoading } = useEditProfile();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answersLoading, setAnswersLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMyProfileAnswers().then((data) => {
      if (cancelled) return;
      setAnswers(data);
      setAnswersLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    profile,
    answers,
    loading: profileLoading || answersLoading,
  };
}
