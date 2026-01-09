/**
 * EnhancedDashboard Component
 * Dashboard page wrapper with Trust & Transparency metrics
 */

import { TrustMetricsDashboard } from './TrustMetricsDashboard';

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

export function EnhancedDashboard() {
  const handleExport = async (format: 'csv' | 'json') => {
    console.log(`Exporting metrics as ${format}`);
    
    try {
      // Fetch real data from the API
      const response = await fetch(`${API_BASE_URL}/metrics/summary`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      
      if (format === 'json') {
        // Export as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptlens-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // Export as CSV
        const metrics = data.metrics || {};
        const csvHeaders = 'metric,value';
        const csvRows = [
          csvHeaders,
          `total_sessions,${metrics.total_sessions || 0}`,
          `average_trust_score,${metrics.average_trust_score?.toFixed(2) || 'N/A'}`,
          `average_transparency_score,${metrics.average_transparency_score?.toFixed(2) || 'N/A'}`,
          `average_understanding_score,${metrics.average_understanding_score?.toFixed(2) || 'N/A'}`,
          `average_usefulness_score,${metrics.average_usefulness_score?.toFixed(2) || 'N/A'}`,
          `total_interactions,${metrics.total_interactions || 0}`,
          `average_time_spent_seconds,${metrics.average_time_spent_seconds?.toFixed(0) || 'N/A'}`,
          `export_date,${new Date().toISOString()}`,
        ].join('\n');
        
        const blob = new Blob([csvRows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `promptlens-metrics-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export metrics. Please ensure the backend is running.');
    }
  };

  const handleRefresh = () => {
    // In production, this would refetch metrics from the API
    console.log('Refreshing metrics...');
    window.location.reload();
  };

  return (
    <div 
      className="flex-1 px-8 py-32 overflow-y-auto" 
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto">
        <TrustMetricsDashboard
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
}
