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
import { useTheme, getThemeColors } from '../../contexts/ThemeContext';
import { PieChart, TrendingUp, Info } from 'lucide-react';
import { ColorScheme } from '../../contexts/ThemeContext';

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
  // Use theme context with fallback to prevent errors when used outside ThemeProvider
  let themeConfig, actualTheme: 'light' | 'dark';
  try {
    const theme = useTheme();
    themeConfig = theme.config;
    actualTheme = theme.actualTheme;
  } catch (error) {
    // Fallback when theme context is not available
    themeConfig = { colorScheme: ColorScheme.PURPLE, reducedMotion: false };
    actualTheme = 'light';
  }
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [chartStats, setChartStats] = useState<{
    total: number;
    largest: { label: string; value: number; percentage: number };
    segments: { label: string; value: number; percentage: number }[];
  } | null>(null);

  const colors = getThemeColors(actualTheme, themeConfig.colorScheme);

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
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 0, // Remove borders from arcs for a cleaner look
      }
    }
  };

  return <Doughnut options={enhancedOptions} data={data} />;
};