export interface ChatMessage {
  id: number;
  sender: 'user' | 'agent';
  text: string;
  speaker: string;
  startTime: string;
  endTime: string;
}

export interface Metric {
  id: number;
  name: string;
  description: string;
}

export interface AnalysisResult {
  metricName: string;
  detected: boolean;
  justification: string;
  quote: string;
  value: string;
}