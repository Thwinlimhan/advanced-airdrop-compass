import { Airdrop, AirdropTask, Wallet } from '../types';

// Helper to format date for ICS (YYYYMMDD)
const formatDateToICSDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
};

// Helper to format date-time for ICS (YYYYMMDDTHHMMSSZ)
const formatDateTimeToICS = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
};

// Escapes text for ICS content
const escapeICSDescription = (text?: string): string => {
  if (!text) return '';
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
};

const generateVEVENT = (
    task: AirdropTask,
    airdrop: Airdrop,
    wallets: Wallet[],
    isSubTask: boolean = false,
    parentTaskDescription?: string
): string | null => {
  if (!task.dueDate) return null;

  const startDate = new Date(task.dueDate);
  if (isNaN(startDate.getTime())) return null; // Invalid due date

  // For all-day events, DTSTART should be DATE format, not DATE-TIME
  // DTEND should be the day after DTSTART for all-day events.
  const dtstart = formatDateToICSDate(startDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 1); // Event ends on the next day for all-day
  const dtend = formatDateToICSDate(endDate);

  const uid = `airdrop-task-${task.id}@cryptocompass.app`;
  const dtstamp = formatDateTimeToICS(new Date()); // Current timestamp
  
  let summary = escapeICSDescription(task.description);
  if (isSubTask && parentTaskDescription) {
      summary = `${escapeICSDescription(parentTaskDescription)} -> ${summary}`;
  }
  summary = `Airdrop: ${escapeICSDescription(airdrop.projectName)} - ${summary}`;
  
  if (task.completed) {
    summary = `[COMPLETED] ${summary}`;
  }

  let description = `Project: ${escapeICSDescription(airdrop.projectName)}\\n`;
  description += `Task: ${escapeICSDescription(task.description)}\\n`;
  if (task.notes) {
    description += `Notes: ${escapeICSDescription(task.notes)}\\n`;
  }
  if (task.associatedWalletId) {
    const wallet = wallets.find(w => w.id === task.associatedWalletId);
    if (wallet) {
      description += `Associated Wallet: ${escapeICSDescription(wallet.name)} (${escapeICSDescription(wallet.address)})\\n`;
    }
  }
  description += `Status: ${task.completed ? 'Completed' : 'Pending'}`;
  if (task.completed && task.completionDate) {
    description += ` on ${new Date(task.completionDate).toLocaleDateString()}`;
  }
  
  const veventLines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`, // For all-day events, DTEND is the day after DTSTART
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `STATUS:${task.completed ? 'COMPLETED' : 'NEEDS-ACTION'}`,
  ];

  if(task.completed && task.completionDate){
    veventLines.push(`COMPLETED:${formatDateTimeToICS(new Date(task.completionDate))}`);
  }
  
  // Add reminder (e.g., 1 day before at 9 AM UTC of the due date)
  // Due date is start of day, so reminder is 1 day before DTSTART, at 9 AM UTC.
  const reminderDate = new Date(startDate.getTime()); // Clone due date
  reminderDate.setUTCDate(startDate.getUTCDate() -1); // one day before
  reminderDate.setUTCHours(9,0,0,0); // Set to 9 AM UTC

  if(reminderDate.getTime() > Date.now() && !task.completed){ // Only add future reminders for pending tasks
    veventLines.push('BEGIN:VALARM');
    veventLines.push('ACTION:DISPLAY');
    veventLines.push('DESCRIPTION:REMINDER: ' + summary);
    veventLines.push(`TRIGGER;VALUE=DATE-TIME:${formatDateTimeToICS(reminderDate)}`);
    veventLines.push('END:VALARM');
  }

  veventLines.push('END:VEVENT');
  return veventLines.join('\r\n');
};

export const generateAirdropTasksICS = (airdrop: Airdrop, wallets: Wallet[]): string => {
  const icsEvents: string[] = [];

  const processTasksRecursive = (tasks: AirdropTask[], parentTaskDescription?: string) => {
    tasks.forEach(task => {
      const vevent = generateVEVENT(task, airdrop, wallets, !!parentTaskDescription, parentTaskDescription);
      if (vevent) {
        icsEvents.push(vevent);
      }
      if (task.subTasks && task.subTasks.length > 0) {
        processTasksRecursive(task.subTasks, task.description);
      }
    });
  };

  processTasksRecursive(airdrop.tasks);

  if (icsEvents.length === 0) {
    return ''; // No exportable tasks
  }

  const icsHeader = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CryptoAirdropCompass//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:Airdrop Tasks - ${airdrop.projectName}`,
    'X-WR-TIMEZONE:UTC', // Assuming all dates are UTC for simplicity
  ];

  const icsFooter = ['END:VCALENDAR'];

  return [
    ...icsHeader,
    ...icsEvents,
    ...icsFooter,
  ].join('\r\n');
};