import React, { useState, useCallback, useEffect } from 'react';
import { Chat } from '@google/genai';
import { Metric, AnalysisResult, ChatMessage } from './types';
import { Header } from './components/Header';
import { MetricInput } from './components/MetricInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Icon } from './components/Icon';
import { createAnalysisChat, performAnalysis } from './services/geminiService';
import { ChatInterface } from './components/ChatInterface';

const App: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: Date.now(), name: '', description: '' },
  ]);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [hasAnalyzedOnce, setHasAnalyzedOnce] = useState<boolean>(false);


  const handleMetricChange = useCallback((id: number, field: 'name' | 'description', value: string) => {
    setMetrics((prevMetrics) =>
      prevMetrics.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  }, []);

  const addMetric = useCallback(() => {
    setMetrics((prevMetrics) => [
      ...prevMetrics,
      { id: Date.now(), name: '', description: '' },
    ]);
  }, []);

  const removeMetric = useCallback((id: number) => {
    setMetrics((prevMetrics) => prevMetrics.filter((m) => m.id !== id));
  }, []);
  
  const handleAddMessage = useCallback((sender: 'user' | 'agent', text: string, speaker: string, startTime: string, endTime: string) => {
    if (!text.trim()) return;
    const newMessage: ChatMessage = {
      id: Date.now(),
      sender,
      text,
      speaker,
      startTime,
      endTime
    };
    setChatMessages(prev => [...prev, newMessage]);
  }, []);


  const isAnalyzeDisabled = isLoading || chatMessages.length === 0 || metrics.some(m => !m.name.trim() || !m.description.trim());
  
  const runAnalysis = useCallback(async () => {
    if (chatMessages.length === 0 || metrics.some(m => !m.name.trim() || !m.description.trim())) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setProcessingTime(null);
    
    const startTime = performance.now();

    const formattedTranscript = chatMessages
      .map(msg => {
          const time = [msg.startTime, msg.endTime].filter(Boolean).join(' - ');
          const speaker = msg.speaker || (msg.sender === 'user' ? 'User' : 'Agent');
          
          let line = `${speaker}: ${msg.text}`;
          if (time) {
              line = `[${time}] ${line}`;
          }
          return line;
      })
      .join('\n');

    try {
      let currentChat = chat;
      if (!currentChat) {
          currentChat = createAnalysisChat();
          setChat(currentChat);
      }
      
      const validMetrics = metrics.filter(m => m.name.trim() && m.description.trim());
      const analysisResults = await performAnalysis(currentChat, formattedTranscript, validMetrics);
      setResults(analysisResults);
      setError(null);
    } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
        setResults(null);
    } finally {
      const endTime = performance.now();
      setProcessingTime((endTime - startTime) / 1000);
      setIsLoading(false);
    }
  }, [chat, chatMessages, metrics]);

  const handleAnalyze = async () => {
    if (isAnalyzeDisabled) return;
    setHasAnalyzedOnce(true);
    await runAnalysis();
  };

  useEffect(() => {
    if (hasAnalyzedOnce && !isLoading) {
      const debounceTimeout = setTimeout(() => {
        runAnalysis();
      }, 500); // Debounce to prevent rapid-fire API calls

      return () => clearTimeout(debounceTimeout);
    }
  }, [chatMessages, metrics, hasAnalyzedOnce, isLoading, runAnalysis]);


  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 space-y-6">
            <ChatInterface messages={chatMessages} onAddMessage={handleAddMessage} />
            
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">2. Define Metrics</h2>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <MetricInput
                    key={metric.id}
                    metric={metric}
                    onChange={handleMetricChange}
                    onRemove={removeMetric}
                    isOnlyMetric={metrics.length === 1}
                  />
                ))}
              </div>
              <button
                onClick={addMetric}
                className="mt-4 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200 font-medium py-2 px-3 rounded-md hover:bg-indigo-500/10"
              >
                <Icon icon="plus" className="w-5 h-5" />
                Add Another Metric
              </button>
            </div>

            <div className="pt-4 border-t border-slate-700">
                <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzeDisabled}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-md shadow-lg hover:bg-indigo-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                    {isLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Icon icon="sparkles" className="w-6 h-6" />
                            Analyze Transcript
                        </>
                    )}
                </button>
            </div>
          </div>
          
          {/* Right Column: Results */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 min-h-[500px]">
            <ResultsDisplay results={results} isLoading={isLoading} error={error} processingTime={processingTime} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
