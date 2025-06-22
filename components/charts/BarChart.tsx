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
import { useTheme, getThemeColors, ColorScheme } from '../../contexts/ThemeContext';
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
  
  const chartRef = useRef<ChartJS<'bar'>>(null);
  const [hoveredBar, setHoveredBar] = useState<{ datasetIndex: number; index: number } | null>(null);
  const [chartStats, setChartStats] = useState<{
    total: number;
    average: number;
    highest: { label: string; value: number; index: number };
    lowest: { label: string; value: number; index: number };
  } | null>(null);

  const colors = getThemeColors(actualTheme, themeConfig.colorScheme);

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
            const { dataset, index } = context;
            const label = dataset.data[index] as string;
            return label;
          },
          label: (context) => {
            const { dataset, index } = context;
            const value = dataset.data[index] as number;
            return `Value: ${value}`;
          }
        }
      },
      gradientBars: {
        enabled: variant === 'gradient',
        options: {
          enabled: variant === 'gradient',
        }
      },
      roundedBars: {
        enabled: variant === 'rounded',
        options: {
          enabled: variant === 'rounded',
          radius: 8
        }
      }
    },
    scales: {
      x: {
        grid: { display: showGrid },
        ticks: { color: colors.text.secondary }
      },
      y: {
        grid: { display: showGrid },
        ticks: { color: colors.text.secondary }
      }
    },
    elements: {
        bar: {
            // backgroundColor is usually set per dataset in the data prop
            borderColor: colors.border,
            borderWidth: 1,
        }
    }
  };

  const themedData = {
    ...data,
    datasets: data.datasets.map((dataset, index) => ({
      ...dataset,
      // If backgroundColor is not an array (meaning it's a single color for all bars in dataset), use accent.
      // If it IS an array, it means colors are provided per bar, so use those.
      backgroundColor: Array.isArray(dataset.backgroundColor) 
        ? dataset.backgroundColor 
        : (dataset.backgroundColor || `${colors.primary}${index > 0 ? (10 - index*2).toString(16) : 'B3'}`), // Default to accent with varying alpha for multiple datasets
      borderColor: dataset.borderColor || colors.border,
      hoverBackgroundColor: dataset.hoverBackgroundColor || colors.primary,
    })),
  };

  return <Bar options={enhancedOptions} data={themedData} />;
};