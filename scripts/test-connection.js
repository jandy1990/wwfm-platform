// scripts/test-connection.js
const { chromium } = require('@playwright/test');
const dotenv = require('dotenv');
const path = require('path');
const net = require('net');

// Load test environment
dotenv.config({ path: path.resolve(__dirname, '../.env.test.local') });

// Helper to check if a port is in use
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', () => {
      resolve(true); // Port is in use
    });
    
    server.once('listening', () => {
      server.close();
      resolve(false); // Port is free
    });
    
    server.listen(port, '127.0.0.1');
  });
}

// Helper to check if Next.js is running on a port
async function isNextAppRunning(port) {
  try {
    const response = await fetch(`http://localhost:${port}`);
    const text = await response.text();
    return text.includes('__next') || text.includes('_next') || text.includes('WWFM');
  } catch (error) {
    return false;
  }
}

// Auto-detect which port the dev server is running on
async function detectDevServerPort() {
  const commonPorts = [3000, 3001, 3002, 3003, 8080];
  
  console.log('🔍 Checking for running Next.js dev server...');
  
  for (const port of commonPorts) {
    if (await isPortInUse(port)) {
      console.log(`   Port ${port} is in use, checking if it's Next.js...`);
      if (await isNextAppRunning(port)) {
        console.log(`   ✅ Found Next.js dev server on port ${port}`);
        return port;
      }
    }
  }
  
  console.log('   ❌ No Next.js dev server found');
  return null;
}

async function testConnection() {
  console.log('WWFM Test Connection Checker');
  console.log('============================\n');
  
  // 1. Check environment variables
  console.log('1. Environment Variables:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
  console.log('   TEST_GOAL_ID:', process.env.TEST_GOAL_ID ? `✅ ${process.env.TEST_GOAL_ID}` : '❌ Missing');
  console.log('');
  
  // 2. Check for dev server
  console.log('2. Dev Server Detection:');
  const port = await detectDevServerPort();
  const baseURL = port ? `http://localhost:${port}` : null;
  console.log('');
  
  if (!baseURL) {
    console.log('⚠️  Please start the dev server with: npm run dev');
    console.log('   Then run this script again.');
    return;
  }
  
  // 3. Test page access
  console.log('3. Testing Page Access:');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test home page
    console.log(`   Testing ${baseURL}...`);
    await page.goto(baseURL);
    console.log('   ✅ Home page accessible');
    
    // Test add solution page
    const addSolutionURL = `${baseURL}/goal/${process.env.TEST_GOAL_ID}/add-solution`;
    console.log(`   Testing ${addSolutionURL}...`);
    await page.goto(addSolutionURL);
    
    // Check if redirected to login
    const currentURL = page.url();
    if (currentURL.includes('/auth/signin')) {
      console.log('   ✅ Add solution page redirects to login (expected)');
    } else {
      console.log('   ✅ Add solution page accessible');
    }
    
  } catch (error) {
    console.log('   ❌ Error accessing pages:', error.message);
  }
  
  await browser.close();
  console.log('');
  
  // 4. Summary
  console.log('4. Summary:');
  if (port) {
    console.log(`   ✅ Dev server running on port ${port}`);
    console.log(`   📝 Tests will use: ${baseURL}`);
    console.log('   🚀 Ready to run tests with: npm run test:forms');
  } else {
    console.log('   ❌ Dev server not running');
    console.log('   📝 Start it with: npm run dev');
  }
}

testConnection().catch(console.error);
