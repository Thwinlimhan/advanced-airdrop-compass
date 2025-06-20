import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartOptions,
  ChartData,
  Plugin
} from 'chart.js';
import { useTheme, getThemeColors } from './enhanced_ThemeContext';
import { PieChart, TrendingUp, Info } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface EnhancedDoughnutChartProps {
  data: ChartData<'doughnut'>;
  options?: Partial<ChartOptions<'doughnut'>>;
  title?: string;
  size?: number;
  showLegend?: boolean;
  showCenter?: boolean;
  centerText?: string;
  centerSubtext?: string;
  interactive?: boolean;
  animated?: boolean;
  showStats?: boolean;
  className?: string;
}

// Custom plugin for center text
const centerTextPlugin: Plugin<'doughnut'> = {
  id: 'centerText',
  beforeDraw: (chart, args, options: any) => {
    if (!options.display) return;

    const { ctx, chartArea } = chart;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main text
    if (options.text) {
      ctx.font = `600 ${options.fontSize || 24}px var(--font-family-sans)`;
      ctx.fillStyle = options.color || '#374151';
      ctx.fillText(options.text, centerX, centerY - 10);
    }

    // Subtext
    if (options.subtext) {
      ctx.font = `400 ${options.subtextSize || 14}px var(--font-family-sans)`;
      ctx.fillStyle = options.subtextColor || '#6b7280';
      ctx.fillText(options.subtext, centerX, centerY + 15);
    }

    ctx.restore();
  }
};

// Custom plugin for enhanced hover effects
const hoverEffectPlugin: Plugin<'doughnut'> = {
  id: 'hoverEffect',
  afterDatasetsDraw: (chart) => {
    const ctx = chart.ctx;
    const meta = chart.getDatasetMeta(0);
    
    meta.data.forEach((arc, index) => {
      if (arc.active) {
        ctx.save();
        ctx.shadowColor = chart.data.backgroundColor?.[index] as string || '#8b5cf6';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        const startAngle = arc.startAngle;
        const endAngle = arc.endAngle;
        const innerRadius = arc.innerRadius;
        const outerRadius = arc.outerRadius + 5; // Expand on hover
        
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, outerRadius, startAngle, endAngle);
        ctx.arc(arc.x, arc.y, innerRadius, endAngle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = chart.data.backgroundColor?.[index] as string || '#8b5cf6';
        ctx.fill();
        ctx.restore();
      }
    });
  }
};

export const EnhancedDoughnutChart: React.FC<EnhancedDoughnutChartProps> = ({
  data,
  options = {},
  title,
  size = 300,
  showLegend = true,
  showCenter = true,
  centerText,
  centerSubtext,
  interactive = true,
  animated = true,
  showStats = true,
  className = ''
}) => {
  const { config, actualTheme } = useTheme();
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [chartStats, setChartStats] = useState<{
    total: number;
    largest: { label: string; value: number; percentage: number };
    segments: { label: string; value: number; percentage: number }[];
  } | null>(null);

  const colors = getThemeColors(actualTheme, config.colorScheme);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!data.datasets[0] || !data.labels) return null;

    const values = data.datasets[0].data as number[];
    const labels = data.labels as string[];
    const total = values.reduce((sum, val) => sum + val, 0);
    
    const segments = values.map((value, index) => ({
      label: labels[index] || `Segment ${index + 1}`,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0
    }));

    const largest = segments.reduce((max, segment) => 
      segment.value > max.value ? segment : max, 
      segments[0]
    );

    return { total, largest, segments };
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
  const enhancedOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
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
            
            labels.forEach((label, index) => {
              label.pointStyle = 'circle';
              label.usePointStyle = true;
              
              // Add percentage to label
              if (chartStats && chartStats.segments[index]) {
                const percentage = chartStats.segments[index].percentage.toFixed(1);
                label.text = `${label.text} (${percentage}%)`;
              }
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
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return [
              `Value: ${value.toLocaleString()}`,
              `Percentage: ${percentage}%`
            ];
          }
        },
        animation: {
          duration: animated ? 200 : 0
        }
      },
      centerText: showCenter ? {
        display: true,
        text: centerText || (chartStats ? chartStats.total.toLocaleString() : ''),
        subtext: centerSubtext || 'Total',
        color: colors.text.primary,
        subtextColor: colors.text.tertiary,
        fontSize: 24,
        subtextSize: 14
      } : { display: false }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: colors.surface,
        hoverBorderWidth: 3,
        hoverBorderColor: colors.surface
      }
    },
    animation: animated && !config.reducedMotion ? {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeOutQuart'
    } : false,
    onHover: interactive ? (event, activeElements) => {
      if (chartRef.current) {
        chartRef.current.canvas.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
      }
      setHoveredSegment(activeElements.length > 0 ? activeElements[0].index : null);
    } : undefined,
    ...options
  };

  // Enhanced data with colors
  const enhancedData: ChartData<'doughnut'> = {
    ...data,
    datasets: data.datasets.map(dataset => {
      const dataCount = (dataset.data as number[]).length;
      const colors = generateColors(dataCount);
      
      return {
        ...dataset,
        backgroundColor: dataset.backgroundColor || colors,
        borderColor: dataset.borderColor || Array(dataCount).fill(colors[0]),
        hoverBackgroundColor: dataset.hoverBackgroundColor || colors.map(color => color + 'cc'),
        hoverBorderColor: dataset.hoverBorderColor || Array(dataCount).fill('#ffffff')
      };
    })
  };

  return (
    <div className={`chart-container ${className}`}>
      {showStats && chartStats && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {chartStats.total.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {chartStats.largest.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">Largest</div>
            </div>
          </div>
          
          {hoveredSegment !== null && chartStats.segments[hoveredSegment] && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {chartStats.segments[hoveredSegment].label}
                </span>
              </div>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                {chartStats.segments[hoveredSegment].value.toLocaleString()} 
                ({chartStats.segments[hoveredSegment].percentage.toFixed(1)}%)
              </div>
            </div>
          )}
        </div>
      )}
      
      <div style={{ height: `${size}px` }} className="relative">
        <Doughnut
          ref={chartRef}
          data={enhancedData}
          options={enhancedOptions}
          plugins={[centerTextPlugin, ...(animated && !config.reducedMotion ? [hoverEffectPlugin] : [])]}
        />
      </div>
    </div>
  );
};

export default EnhancedDoughnutChart;
