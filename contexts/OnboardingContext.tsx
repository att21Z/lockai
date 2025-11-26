import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingData {
  firstName: string;
  entrepreneurialStatus: string | string[];
  lifeDomains: string[];
  mainGoal: string | string[];
  currentSituation: string | string[];
  mainMotivation: string | string[];
  mainObstacle: string | string[];
  lastProudMoment: string;
  goalTrackingMethod: string;
  commitmentLevel: string;
  coachName: string;
  potentialScores: {
    confidence: number;
    discipline: number;
    productivity: number;
    clarity: number;
    energy: number;
    focus: number;
  };
  targetDate: string;
}

interface OnboardingContextType {
  data: OnboardingData;
  updateData: (newData: Partial<OnboardingData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetOnboarding: () => void;
}

const initialData: OnboardingData = {
  firstName: '',
  entrepreneurialStatus: [],
  lifeDomains: [],
  mainGoal: [],
  currentSituation: [],
  mainMotivation: [],
  mainObstacle: [],
  lastProudMoment: '',
  goalTrackingMethod: '',
  commitmentLevel: '',
  coachName: '',
  potentialScores: {
    confidence: 96,
    discipline: 94,
    productivity: 91,
    clarity: 93,
    energy: 89,
    focus: 95,
  },
  targetDate: '',
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }));
  };

  const resetOnboarding = () => {
    setData(initialData);
    setCurrentStep(0);
  };

  return (
    <OnboardingContext.Provider
      value={{ data, updateData, currentStep, setCurrentStep, resetOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
