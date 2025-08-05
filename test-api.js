// Simple test script to verify API integration
import { testAPIIntegration } from './src/lib/api/test.ts';

async function runTest() {
  try {
    console.log('Starting API integration test...');
    await testAPIIntegration();
    console.log('✅ API integration test passed!');
  } catch (error) {
    console.error('❌ API integration test failed:', error);
    process.exit(1);
  }
}

runTest();