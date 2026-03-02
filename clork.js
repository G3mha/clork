#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';

const DATA_DIR = path.join(os.homedir(), '.clork');
const CSV_FILE = path.join(DATA_DIR, 'timesheet.csv');
const CSV_HEADER = 'date,time,action';

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, CSV_HEADER + '\n');
  }
}

function readEntries() {
  ensureDataDir();
  const content = fs.readFileSync(CSV_FILE, 'utf-8');
  const lines = content.trim().split('\n').slice(1); // Skip header
  return lines.filter(line => line.trim()).map(line => {
    const [date, time, action] = line.split(',');
    return { date, time, action };
  });
}

function appendEntry(action) {
  ensureDataDir();
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().split(' ')[0];
  fs.appendFileSync(CSV_FILE, `${date},${time},${action}\n`);
  return { date, time, action };
}

function getLastEntry() {
  const entries = readEntries();
  return entries.length > 0 ? entries[entries.length - 1] : null;
}

function getTodayEntries() {
  const today = new Date().toISOString().split('T')[0];
  return readEntries().filter(e => e.date === today);
}

function parseTime(timeStr) {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
}

function calculateTotalTime(entries) {
  let totalSeconds = 0;
  for (let i = 0; i < entries.length; i += 2) {
    const inEntry = entries[i];
    const outEntry = entries[i + 1];
    if (inEntry && inEntry.action === 'in') {
      const inTime = parseTime(inEntry.time);
      if (outEntry && outEntry.action === 'out') {
        const outTime = parseTime(outEntry.time);
        totalSeconds += outTime - inTime;
      } else {
        // Still clocked in, calculate until now
        const now = new Date();
        const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        totalSeconds += nowSeconds - inTime;
      }
    }
  }
  return totalSeconds;
}

function clockIn() {
  const last = getLastEntry();
  if (last && last.action === 'in') {
    console.log('Already clocked in since ' + last.time + ' on ' + last.date);
    return;
  }
  const entry = appendEntry('in');
  console.log('Clocked in at ' + entry.time);
}

function clockOut() {
  const last = getLastEntry();
  if (!last || last.action === 'out') {
    console.log('Not currently clocked in');
    return;
  }
  const entry = appendEntry('out');
  const inTime = parseTime(last.time);
  const outTime = parseTime(entry.time);
  const duration = outTime - inTime;
  console.log('Clocked out at ' + entry.time);
  console.log('Session duration: ' + formatDuration(duration));
}

function showStatus() {
  const last = getLastEntry();
  if (!last) {
    console.log('No entries yet');
    return;
  }
  if (last.action === 'in') {
    const inTime = parseTime(last.time);
    const now = new Date();
    const nowSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const elapsed = nowSeconds - inTime;
    console.log('Currently clocked in since ' + last.time);
    console.log('Current session: ' + formatDuration(elapsed));
  } else {
    console.log('Currently clocked out (last out: ' + last.time + ' on ' + last.date + ')');
  }
}

function showToday() {
  const entries = getTodayEntries();
  if (entries.length === 0) {
    console.log('No entries for today');
    return;
  }
  const total = calculateTotalTime(entries);
  const last = entries[entries.length - 1];
  console.log('Today\'s total: ' + formatDuration(total));
  console.log('Sessions: ' + Math.ceil(entries.length / 2));
  if (last.action === 'in') {
    console.log('(Currently clocked in)');
  }
}

function showLog() {
  const entries = readEntries();
  if (entries.length === 0) {
    console.log('No entries yet');
    return;
  }
  const recent = entries.slice(-10);
  console.log('Recent entries:');
  console.log('─'.repeat(35));
  recent.forEach(e => {
    const icon = e.action === 'in' ? '→' : '←';
    console.log(`${e.date}  ${e.time}  ${icon} ${e.action}`);
  });
}

function showHelp() {
  console.log(`
Clork - Work time tracking CLI

Usage: clork <command>

Commands:
  in      Clock in (start tracking time)
  out     Clock out (stop tracking time)
  status  Show current status (clocked in/out)
  today   Show today's total work time
  log     Show recent entries
  help    Show this help message

Data stored in: ${CSV_FILE}
`);
}

const command = process.argv[2];

switch (command) {
  case 'in':
    clockIn();
    break;
  case 'out':
    clockOut();
    break;
  case 'status':
    showStatus();
    break;
  case 'today':
    showToday();
    break;
  case 'log':
    showLog();
    break;
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  default:
    if (command) {
      console.log('Unknown command: ' + command);
    }
    showHelp();
}
