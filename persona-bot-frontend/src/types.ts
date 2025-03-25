export interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }
  
  export type ExtractedData = {
    [key: string]: string | string[];
  };
  
  export interface Analysis {
    mentalHealthProfile: string;
    keyTraits: string;
    supportStrategies: string;
    informationGaps: string;
    summary: string;
  }