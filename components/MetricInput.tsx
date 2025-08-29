import React from 'react';
import { Metric } from '../types';
import { Icon } from './Icon';

interface MetricInputProps {
  metric: Metric;
  onChange: (id: number, field: 'name' | 'description', value: string) => void;
  onRemove: (id: number) => void;
  isOnlyMetric: boolean;
}

export const MetricInput: React.FC<MetricInputProps> = ({ metric, onChange, onRemove, isOnlyMetric }) => {
  return (
    <div className="p-4 bg-slate-800/50 rounded-lg space-y-3 relative group transition-all duration-300 hover:bg-slate-800">
       <button
        onClick={() => onRemove(metric.id)}
        disabled={isOnlyMetric}
        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 disabled:opacity-0 disabled:cursor-not-allowed hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500"
      >
        <Icon icon="trash" className="w-4 h-4" />
      </button>
      <div>
        <label htmlFor={`metric-name-${metric.id}`} className="block text-sm font-medium text-slate-300 mb-1">
          Metric Name
        </label>
        <input
          type="text"
          id={`metric-name-${metric.id}`}
          value={metric.name}
          onChange={(e) => onChange(metric.id, 'name', e.target.value)}
          placeholder="e.g., Customer Empathy"
          className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>
      <div>
        <label htmlFor={`metric-desc-${metric.id}`} className="block text-sm font-medium text-slate-300 mb-1">
          Description
        </label>
        <textarea
          id={`metric-desc-${metric.id}`}
          rows={2}
          value={metric.description}
          onChange={(e) => onChange(metric.id, 'description', e.target.value)}
          placeholder="e.g., Agent shows understanding and acknowledges customer's feelings."
          className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
        />
      </div>
    </div>
  );
};
