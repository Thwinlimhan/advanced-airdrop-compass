import React, { useRef, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData,
  InteractionItem,
  Plugin
} from 'chart.js';
import { useTheme, getThemeColors } from './enhanced_ThemeContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnhancedLineChartProps {
  data: ChartData<'line'>;
  options?: Partial<ChartOptions<'line'>>;
  title?: string;
  height?: number;
  showStats?: boolean;
  interactive?: boolean;
  animated?: boolean;
  showTrendline?: boolean;
  className?: string;
}

// Custom plugin for enhanced animations
const enhancedAnimationPlugin: Plugin<'line'> = {
  id: 'enhancedAnimation',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const datasets = chart.data.datasets;
    
    datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.hidden && dataset.data.length > 0) {
        // Add glow effect to active points
        meta.data.forEach((point, index) => {
          if (point.active) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.shadowColor = dataset.borderColor as string || '#8b5cf6';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(point.x, point.y, 8, 0, 2 * Math.PI);
            ctx.fillStyle = dataset.borderColor as string || '#8b5cf6';
            ctx.fill();
            ctx.restore();
          }
        });
      }
    });
  }
};

export const EnhancedLineChart: React.FC<EnhancedLineChartProps> = ({
  data,
  options = {},
  title,
  height = 300,
  showStats = true,
  interactive = true,
  animated = true,
  showTrendline = false,
  className = ''
}) => {
  const { config, actualTheme } = useTheme();
  const chartRef = useRef<ChartJS<'line'>>(null);
  const [activePoint, setActivePoint] = useState<InteractionItem[]>([]);
  const [chartStats, setChartStats] = useState<{
    trend: 'up' | 'down' | 'neutral';
    change: number;
    changePercent: number;
  } | null>(null);

  const colors = getThemeColors(actualTheme, config.colorScheme);

  // Calculate stats from data
  useEffect(() => {
    if (data.datasets.length > 0 && data.datasets[0].data.length > 1) {
      const values = data.datasets[0].data as number[];
      const first = values[0];
      const last = values[values.length - 1];
      const change = last - first;
      const changePercent = first !== 0 ? (change / first) * 100 : 0;
      
      setChartStats({
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
        change,
        changePercent
      });
    }
  }, [data]);

  // Enhanced chart options
  const enhancedOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          color: colors.text.secondary,
          font: {
            family: 'var(--font-family-sans)',
            size: 12,
            weight: '500'
          },
          padding: 20,
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            labels.forEach(label => {
              label.pointStyle = 'circle';
              label.usePointStyle = true;
            });
            
            return labels;
          }
        }
      },
      title: {
        display: !!title,
        text: title,
        color: colors.text.primary,
        font: {
          family: 'var(--font-family-sans)',
          size: 18,
          weight: '600'
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        enabled: interactive,
        backgroundColor: colors.surface + 'f0',
        titleColor: colors.text.primary,
        bodyColor: colors.text.secondary,
        borderColor: colors.border,
        borderWidth: 1,
        cornerRadius: 12,
        titleFont: {
          family: 'var(--font-family-sans)',
          size: 14,
          weight: '600'
        },
        bodyFont: {
          family: 'var(--font-family-sans)',
          size: 13
        },
        padding: 16,
        displayColors: true,
        usePointStyle: true,
        callbacks: {
          title: (context) => {
            return context[0].label || '';
          },
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`;
          },
          afterBody: (context) => {
            if (context.length > 0 && chartStats) {
              const index = context[0].dataIndex;
              const total = (data.datasets[0].data as number[]).length;
              const progress = ((index + 1) / total * 100).toFixed(1);
              return [`Progress: ${progress}%`];
            }
            return [];
          }
        },
        animation: {
          duration: animated ? 200 : 0
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: colors.border + '40',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: colors.text.tertiary,
          font: {
            family: 'var(--font-family-sans)',
            size: 11
          },
          maxTicksLimit: 8,
          autoSkip: true
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: colors.border + '40',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: colors.text.tertiary,
          font: {
            family: 'var(--font-family-sans)',
            size: 11
          },
          maxTicksLimit: 6,
          callback: function(value) {
            return typeof value === 'number' ? value.toLocaleString() : value;
          }
        },
        border: {
          display: false
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      },
      point: {
        radius: interactive ? 4 : 3,
        hoverRadius: interactive ? 8 : 6,
        borderWidth: 2,
        hoverBorderWidth: 3,
        pointStyle: 'circle'
      }
    },
    animation: animated ? {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default' 
          ? context.dataIndex * 50 
          : 0;
      }
    } : false,
    onHover: interactive ? (event, activeElements) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
      setActivePoint(activeElements);
    } : undefined,
    ...options
  };

  // Enhanced data with theming
  const enhancedData: ChartData<'line'> = {
    ...data,
    datasets: data.datasets.map((dataset, index) => {
      const isMultiDataset = data.datasets.length > 1;
      const baseColor = isMultiDataset 
        ? ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'][index % 5]
        : colors.primary;
      
      return {
        ...dataset,
        borderColor: dataset.borderColor || baseColor,
        backgroundColor: dataset.backgroundColor || ((context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          
          if (!chartArea) return baseColor + '20';
          
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, baseColor + '40');
          gradient.addColorStop(0.5, baseColor + '20');
          gradient.addColorStop(1, baseColor + '00');
          return gradient;
        }),
        pointBackgroundColor: baseColor,
        pointBorderColor: colors.surface,
        pointHoverBackgroundColor: baseColor,
        pointHoverBorderColor: colors.surface,
        fill: true,
        ...dataset
      };
    })
  };

  const getTrendIcon = () => {
    if (!chartStats) return <Minus className="w-4 h-4" />;
    
    switch (chartStats.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!chartStats) return 'text-gray-500';
    
    switch (chartStats.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`chart-container ${className}`}>
      {showStats && chartStats && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {chartStats.changePercent > 0 ? '+' : ''}{chartStats.changePercent.toFixed(2)}%
            </span>
            <span className="text-xs text-gray-500">
              ({chartStats.change > 0 ? '+' : ''}{chartStats.change.toFixed(2)})
            </span>
          </div>
          
          {activePoint.length > 0 && (
            <div className="text-xs text-gray-500">
              Point {activePoint[0].index + 1} of {data.datasets[0].data.length}
            </div>
          )}
        </div>
      )}
      
      <div style={{ height: `${height}px` }} className="relative">
        <Line
          ref={chartRef}
          data={enhancedData}
          options={enhancedOptions}
          plugins={animated && !config.reducedMotion ? [enhancedAnimationPlugin] : []}
        />
      </div>
    </div>
  );
};

export default EnhancedLineChart;
