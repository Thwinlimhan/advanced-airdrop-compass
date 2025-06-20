import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Plugin
} from 'chart.js';
import { useTheme, getThemeColors } from './enhanced_ThemeContext';
import { BarChart3, TrendingUp, TrendingDown, Award } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EnhancedBarChartProps {
  data: ChartData<'bar'>;
  options?: Partial<ChartOptions<'bar'>>;
  title?: string;
  height?: number;
  orientation?: 'vertical' | 'horizontal';
  showGrid?: boolean;
  showStats?: boolean;
  animated?: boolean;
  interactive?: boolean;
  variant?: 'default' | 'gradient' | 'rounded';
  className?: string;
}

// Custom plugin for gradient backgrounds
const gradientPlugin: Plugin<'bar'> = {
  id: 'gradientBars',
  beforeDatasetsDraw: (chart, args, options: any) => {
    if (!options.enabled) return;

    const { ctx, chartArea, data } = chart;
    const datasets = data.datasets;

    datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.hidden) {
        meta.data.forEach((bar, index) => {
          if (dataset.backgroundColor && Array.isArray(dataset.backgroundColor)) {
            const color = dataset.backgroundColor[index] as string;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, color + '60');
            
            // Apply gradient to the bar
            ctx.save();
            ctx.fillStyle = gradient;
            const barArea = bar.getProps(['x', 'y', 'base', 'width', 'height'], true);
            ctx.fillRect(barArea.x - barArea.width / 2, barArea.y, barArea.width, barArea.base - barArea.y);
            ctx.restore();
          }
        });
      }
    });
  }
};

// Custom plugin for rounded bars
const roundedBarsPlugin: Plugin<'bar'> = {
  id: 'roundedBars',
  afterDatasetsDraw: (chart, args, options: any) => {
    if (!options.enabled) return;

    const { ctx } = chart;
    const radius = options.radius || 8;

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chart.getDatasetMeta(datasetIndex);
      if (!meta.hidden) {
        meta.data.forEach((bar, index) => {
          const { x, y, base, width } = bar.getProps(['x', 'y', 'base', 'width'], true);
          const barHeight = Math.abs(base - y);
          const barWidth = width;
          
          if (barHeight > 0) {
            ctx.save();
            ctx.fillStyle = (dataset.backgroundColor as string[])?.[index] || dataset.backgroundColor as string || '#8b5cf6';
            
            // Draw rounded rectangle
            const left = x - barWidth / 2;
            const top = Math.min(y, base);
            const actualRadius = Math.min(radius, barWidth / 2, barHeight / 2);
            
            ctx.beginPath();
            ctx.moveTo(left + actualRadius, top);
            ctx.lineTo(left + barWidth - actualRadius, top);
            ctx.quadraticCurveTo(left + barWidth, top, left + barWidth, top + actualRadius);
            ctx.lineTo(left + barWidth, top + barHeight - actualRadius);
            ctx.quadraticCurveTo(left + barWidth, top + barHeight, left + barWidth - actualRadius, top + barHeight);
            ctx.lineTo(left + actualRadius, top + barHeight);
            ctx.quadraticCurveTo(left, top + barHeight, left, top + barHeight - actualRadius);
            ctx.lineTo(left, top + actualRadius);
            ctx.quadraticCurveTo(left, top, left + actualRadius, top);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });
      }
    });
  }
};

export const EnhancedBarChart: React.FC<EnhancedBarChartProps> = ({
  data,
  options = {},
  title,
  height = 300,
  orientation = 'vertical',
  showGrid = true,
  showStats = true,
  animated = true,
  interactive = true,
  variant = 'default',
  className = ''
}) => {
  const { config, actualTheme } = useTheme();
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const [hoveredBar, setHoveredBar] = useState<{ datasetIndex: number; index: number } | null>(null);
  const [chartStats, setChartStats] = useState<{
    total: number;
    average: number;
    highest: { label: string; value: number; index: number };
    lowest: { label: string; value: number; index: number };
  } | null>(null);

  const colors = getThemeColors(actualTheme, config.colorScheme);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.datasets[0] || !data.labels) return null;

    const values = data.datasets[0].data as number[];
    const labels = data.labels as string[];
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    
    const highest = values.reduce((max, val, idx) => 
      val > max.value ? { label: labels[idx], value: val, index: idx } : max,
      { label: labels[0], value: values[0], index: 0 }
    );
    
    const lowest = values.reduce((min, val, idx) => 
      val < min.value ? { label: labels[idx], value: val, index: idx } : min,
      { label: labels[0], value: values[0], index: 0 }
    );

    return { total, average, highest, lowest };
  }, [data]);

  useEffect(() => {
    setChartStats(stats);
  }, [stats]);

  // Generate color palette
  const generateColors = (count: number) => {
    const baseColors = [
      colors.primary,
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f97316', // orange
      '#6366f1'  // indigo
    ];

    return Array.from({ length: count }, (_, i) => 
      baseColors[i % baseColors.length]
    );
  };

  // Enhanced chart options
  const enhancedOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: orientation === 'horizontal' ? 'y' : 'x',
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: data.datasets.length > 1,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
          color: colors.text.secondary,
          font: {
            family: 'var(--font-family-sans)',
            size: 12,
            weight: '500'
          },
          padding: 20
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
            const value = context.parsed.y || context.parsed.x;
            const label = context.dataset.label || '';
            return `${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`;
          },
          afterBody: (context) => {
            if (context.length > 0 && chartStats) {
              const value = context[0].parsed.y || context[0].parsed.x;
              const percentage = ((value / chartStats.total) * 100).toFixed(1);
              return [`${percentage}% of total`];
            }
            return [];
          }
        },
        animation: {
          duration: animated ? 200 : 0
        }
      },
      gradientBars: {
        enabled: variant === 'gradient'
      },
      roundedBars: {
        enabled: variant === 'rounded',
        radius: 8
      }
    },
    scales: {
      x: {
        grid: {
          display: showGrid,
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
          maxRotation: 45,
          minRotation: 0
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: showGrid,
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
      bar: {
        borderRadius: variant === 'rounded' ? 0 : 4, // Custom plugin handles rounded variant
        borderSkipped: false,
        borderWidth: 0
      }
    },
    animation: animated && !config.reducedMotion ? {
      duration: 1000,
      easing: 'easeOutQuart',
      delay: (context) => {
        return context.type === 'data' && context.mode === 'default'
          ? context.dataIndex * 100
          : 0;
      }
    } : false,
    onHover: interactive ? (event, activeElements) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
      
      if (activeElements.length > 0) {
        setHoveredBar({
          datasetIndex: activeElements[0].datasetIndex,
          index: activeElements[0].index
        });
      } else {
        setHoveredBar(null);
      }
    } : undefined,
    ...options
  };

  // Enhanced data with colors
  const enhancedData: ChartData<'bar'> = {
    ...data,
    datasets: data.datasets.map((dataset, datasetIndex) => {
      const dataCount = (dataset.data as number[]).length;
      const isMultiDataset = data.datasets.length > 1;
      const baseColors = isMultiDataset 
        ? [generateColors(data.datasets.length)[datasetIndex]]
        : generateColors(dataCount);
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || (isMultiDataset ? baseColors[0] : baseColors),
        borderColor: dataset.borderColor || (isMultiDataset ? baseColors[0] : baseColors),
        hoverBackgroundColor: dataset.hoverBackgroundColor || (isMultiDataset 
          ? baseColors[0] + 'cc' 
          : baseColors.map(color => color + 'cc')),
        borderWidth: dataset.borderWidth || 0,
        ...dataset
      };
    })
  };

  return (
    <div className={`chart-container ${className}`}>
      {showStats && chartStats && (
        <div className="mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {chartStats.total.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {chartStats.average.toFixed(1)}
              </div>
              <div className="text-xs text-gray-500">Average</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span className="text-lg font-bold text-green-600">
                  {chartStats.highest.value.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">Highest</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1">
                <TrendingDown className="w-3 h-3 text-red-500" />
                <span className="text-lg font-bold text-red-600">
                  {chartStats.lowest.value.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">Lowest</div>
            </div>
          </div>
          
          {hoveredBar !== null && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {data.labels?.[hoveredBar.index]}
                </span>
                {chartStats.highest.index === hoveredBar.index && (
                  <Award className="w-4 h-4 text-yellow-500" title="Highest value" />
                )}
              </div>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Value: {((data.datasets[hoveredBar.datasetIndex].data as number[])[hoveredBar.index]).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ height: `${height}px` }} className="relative">
        <Bar
          ref={chartRef}
          data={enhancedData}
          options={enhancedOptions}
          plugins={variant !== 'default' ? [
            ...(variant === 'gradient' ? [gradientPlugin] : []),
            ...(variant === 'rounded' ? [roundedBarsPlugin] : [])
          ] : []}
        />
      </div>
    </div>
  );
};

export default EnhancedBarChart;
