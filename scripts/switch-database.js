#!/usr/bin/env node

/**
 * Database Switching Utility for POS Mobile App
 * Switches between local and remote Supabase databases
 *
 * Usage:
 *   node scripts/switch-database.js local
 *   node scripts/switch-database.js remote
 *   node scripts/switch-database.js status
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCAL_CONFIG = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54331',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
};

const REMOTE_CONFIG = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://cfsabfpjnigdcqwrqfxr.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmc2FiZnBqbmlnZGNxd3JxZnhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMjM5MTQsImV4cCI6MjA3MTU5OTkxNH0.TuSyFIyJ_HbSvEE0j6mY6z2Vl75ckzJp50czQ0WVu8Y'
};

const ENV_FILE = '.env.local';

function createEnvContent(config, mode) {
  const timestamp = new Date().toISOString();
  return `# POS Mobile App Environment Configuration
# Generated: ${timestamp}
# Database Mode: ${mode.toUpperCase()}
#
# 🔄 Switch modes using: node scripts/switch-database.js [local|remote]

NEXT_PUBLIC_SUPABASE_URL=${config.NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.NEXT_PUBLIC_SUPABASE_ANON_KEY}

# Database mode identifier
DATABASE_MODE=${mode}
`;
}

function getCurrentMode() {
  if (!fs.existsSync(ENV_FILE)) {
    return 'none';
  }

  const content = fs.readFileSync(ENV_FILE, 'utf8');

  if (content.includes('127.0.0.1:54331')) {
    return 'local';
  } else if (content.includes('cfsabfpjnigdcqwrqfxr.supabase.co')) {
    return 'remote';
  }

  return 'unknown';
}

function switchToLocal() {
  console.log('🔄 Switching to LOCAL Supabase database...');
  console.log('📍 URL: http://127.0.0.1:54331');

  const content = createEnvContent(LOCAL_CONFIG, 'local');
  fs.writeFileSync(ENV_FILE, content);

  console.log('✅ Switched to LOCAL database');
  console.log('💡 Make sure Supabase is running: supabase start');
  console.log('🚀 Start your app: npm run dev');
}

function switchToRemote() {
  console.log('🔄 Switching to REMOTE Supabase database...');
  console.log('📍 URL: https://cfsabfpjnigdcqwrqfxr.supabase.co');
  console.log('🏷️  Project: TinderaWarp');

  const content = createEnvContent(REMOTE_CONFIG, 'remote');
  fs.writeFileSync(ENV_FILE, content);

  console.log('✅ Switched to REMOTE database');
  console.log('🌐 Connected to production database');
  console.log('🚀 Start your app: npm run dev');
}

function showStatus() {
  const currentMode = getCurrentMode();

  console.log('📊 Database Configuration Status');
  console.log('================================');

  if (currentMode === 'none') {
    console.log('❌ No environment configuration found');
    console.log('💡 Run: node scripts/switch-database.js [local|remote]');
    return;
  }

  console.log(`📍 Current Mode: ${currentMode.toUpperCase()}`);

  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf8');
    const urlMatch = content.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const modeMatch = content.match(/DATABASE_MODE=(.+)/);

    if (urlMatch) {
      console.log(`🔗 Database URL: ${urlMatch[1]}`);
    }

    if (modeMatch) {
      console.log(`⚙️  Mode Setting: ${modeMatch[1]}`);
    }
  }

  console.log('');
  console.log('Available Commands:');
  console.log('  node scripts/switch-database.js local   - Switch to local database');
  console.log('  node scripts/switch-database.js remote  - Switch to remote database');
  console.log('  node scripts/switch-database.js status  - Show current status');
}

function showHelp() {
  console.log('🔄 POS Mobile App - Database Switcher');
  console.log('====================================');
  console.log('');
  console.log('Switches between local and remote Supabase databases');
  console.log('');
  console.log('Usage:');
  console.log('  node scripts/switch-database.js <command>');
  console.log('');
  console.log('Commands:');
  console.log('  local    Switch to local Supabase database (development)');
  console.log('  remote   Switch to remote Supabase database (production)');
  console.log('  status   Show current database configuration');
  console.log('  help     Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/switch-database.js local');
  console.log('  node scripts/switch-database.js remote');
  console.log('  node scripts/switch-database.js status');
}

// Main execution
const command = process.argv[2];

if (!command) {
  showHelp();
  process.exit(0);
}

switch (command.toLowerCase()) {
  case 'local':
    switchToLocal();
    break;

  case 'remote':
    switchToRemote();
    break;

  case 'status':
    showStatus();
    break;

  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;

  default:
    console.error(`❌ Unknown command: ${command}`);
    console.log('💡 Run: node scripts/switch-database.js help');
    process.exit(1);
}
