// Utility function to parse monetary values from strings
export const parseMonetaryValue = (valueString: string | number | undefined): number => {
    if (valueString === undefined || valueString === null) return 0;
    if (typeof valueString === 'number') return valueString;
    
    const cleanedString = valueString.toString()
                                .replace(/[^\d.,-]/g, '') 
                                .replace(/,(?=\d{3})/g, ''); 
                                
    
    const numericPartMatch = cleanedString.match(/^-?[0-9]*\.?[0-9]+/); 
    
    if (numericPartMatch) {
        return parseFloat(numericPartMatch[0]);
    }
    return 0;
};

// Utility function to format numbers as currency (USD for now)
export const formatCurrency = (value: number, currency: string = 'USD', locale: string = 'en-US'): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (error) {
    console.warn("Currency formatting error:", error);
    return `$${value.toFixed(2)}`;
  }
};

// Utility function to format total minutes into "X hours Y minutes"
export const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "N/A";
    if (totalMinutes === 0) return "0 minutes";
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    let result = '';
    if (hours > 0) {
        result += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
        if (hours > 0) result += ' ';
        result += `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    return result || "0 minutes"; 
};

// Utility function to escape cell content for CSV
export const escapeCsvCell = (cellData: string | number | undefined | null): string => {
    if (cellData === undefined || cellData === null) {
        return '';
    }
    const stringData = String(cellData);
    if (stringData.includes(',') || stringData.includes('\n') || stringData.includes('"')) {
        return `"${stringData.replace(/"/g, '""')}"`;
    }
    return stringData;
};

// Utility function for relative date formatting
export const formatRelativeDate = (dateString?: string): string => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates only

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Due Today';
  } else if (diffDays === 1) {
    return 'Due Tomorrow';
  } else if (diffDays > 1) {
    return `Due in ${diffDays} days (${targetDate.toLocaleDateString()})`;
  } else if (diffDays === -1) {
    return `Overdue by 1 day (${targetDate.toLocaleDateString()})`;
  } else {
    return `Overdue by ${Math.abs(diffDays)} days (${targetDate.toLocaleDateString()})`;
  }
};

// Utility function to format dates
export const formatDate = (dateString?: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return date.toLocaleDateString('en-US', defaultOptions);
};
