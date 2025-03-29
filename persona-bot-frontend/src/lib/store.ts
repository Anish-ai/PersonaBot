import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExtractedData {
  [key: string]: string | string[];
}

export interface Analysis {
  mentalHealthProfile?: string;
  keyTraits?: string;
  supportStrategies?: string;
  informationGaps?: string;
  summary?: string;
}

interface SessionStore {
  extractedData: ExtractedData;
  analysis: Analysis | null;
  setExtractedData: (data: ExtractedData) => void;
  updateExtractedData: (data: ExtractedData) => void;
  setAnalysis: (data: Analysis | null) => void;
  updateAnalysis: (data: Analysis) => void;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      extractedData: {},
      analysis: null,
      setExtractedData: (data) => set({ extractedData: data }),
      updateExtractedData: (data) => set((state) => ({ 
        extractedData: { ...state.extractedData, ...data } 
      })),
      setAnalysis: (data) => set({ analysis: data }),
      updateAnalysis: (data) => set((state) => ({ 
        analysis: { ...(state.analysis || {}), ...data } 
      })),
    }),
    {
      name: 'persona-bot-session',
    }
  )
); 