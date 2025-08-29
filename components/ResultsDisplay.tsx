import React from 'react';
import { AnalysisResult } from '../types';
import { Icon } from './Icon';
import { Loader } from './Loader';

interface ResultsDisplayProps {
  results: AnalysisResult[] | null;
  isLoading: boolean;
  error: string | null;
  processingTime: number | null;
}

const ResultCard: React.FC<{ result: AnalysisResult }> = ({ result }) => {
    const { metricName, detected, justification, quote, value } = result;
    const badgeClass = detected
      ? 'bg-green-500/10 text-green-400 ring-green-500/20'
      : 'bg-red-500/10 text-red-400 ring-red-500/20';
    const icon = detected ? 'check' : 'x';
    const iconClass = detected ? 'text-green-400' : 'text-red-400';

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 transition-all duration-300 hover:border-indigo-500/50 hover:bg-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{metricName}</h3>
                <span className={`inline-flex items-center gap-x-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${badgeClass}`}>
                    <Icon icon={icon} className={`w-4 h-4 ${iconClass}`} />
                    {detected ? 'Detected' : 'Not Detected'}
                </span>
            </div>
            
            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-1">Justification</h4>
                    <p className="text-slate-300">{justification}</p>
                </div>
                {value && (
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Value</h4>
                        <p className="text-slate-300">{value}</p>
                    </div>
                )}

                {quote && (
                    <div>
                        <h4 className="text-sm font-medium text-slate-400 mb-1">Relevant Quote</h4>
                        <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-400">
                            "{quote}"
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, isLoading, error, processingTime }) => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Loader />
                <p className="mt-4 text-lg font-medium text-slate-300">Analyzing transcript...</p>
                <p className="text-slate-400">The AI is hard at work. This might take a moment.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
                <Icon icon="x" className="w-12 h-12 text-red-400 mb-4" />
                <h3 className="text-xl font-semibold text-red-400">An Error Occurred</h3>
                <p className="mt-2 text-slate-300 max-w-md">{error}</p>
            </div>
        );
    }
    
    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
                <Icon icon="clipboard" className="w-16 h-16 mb-4"/>
                <h3 className="text-2xl font-semibold">Results will appear here</h3>
                <p className="mt-2 max-w-sm">Build the transcript using the chat input, define your metrics, then click "Analyze" to see the magic happen.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-white">Analysis Results</h2>
                 {processingTime && (
                    <p className="text-sm text-slate-400" aria-live="polite">
                        Completed in {processingTime.toFixed(2)}s
                    </p>
                )}
            </div>
            {results.map((result, index) => (
                <ResultCard key={index} result={result} />
            ))}
        </div>
    );
};
