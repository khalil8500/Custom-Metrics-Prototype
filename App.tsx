import React, { useState, useCallback } from 'react';
import { Metric, AnalysisResult } from './types';
import { Header } from './components/Header';
import { MetricInput } from './components/MetricInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Icon } from './components/Icon';
import { analyzeTranscript } from './services/geminiService';

const App: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [metrics, setMetrics] = useState<Metric[]>([
    { id: Date.now(), name: '', description: '' },
  ]);
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

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

  const isAnalyzeDisabled = isLoading || !transcript.trim() || metrics.some(m => !m.name.trim() || !m.description.trim());

  const handleAnalyze = async () => {
    if (isAnalyzeDisabled) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setProcessingTime(null);
    
    const startTime = performance.now();

    try {
      const validMetrics = metrics.filter(m => m.name.trim() && m.description.trim());
      const analysisResults = await analyzeTranscript(transcript, validMetrics);
      setResults(analysisResults);
    } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
    } finally {
      const endTime = performance.now();
      setProcessingTime((endTime - startTime) / 1000);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50 space-y-6">
            <div>
              <label htmlFor="transcript" className="block text-lg font-semibold text-white mb-2">
                1. Paste Transcript
              </label>
              <textarea
                id="transcript"
                rows={10}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your call transcript, meeting notes, or any text here..."
                className="w-full bg-slate-900 border border-slate-600 rounded-md shadow-sm p-3 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>
            
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