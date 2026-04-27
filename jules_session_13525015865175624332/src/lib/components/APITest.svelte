<script>
  import { onMount } from 'svelte';
  import { getElementExternalData, getCacheStats } from '$lib/api';
  import { getElementById } from '$lib/data/dataProcessor';

  let testResults = [];
  let cacheStats = null;
  let isLoading = false;

  async function runAPITest() {
    isLoading = true;
    testResults = [];

    try {
      // Test with hydrogen
      const hydrogen = getElementById(1);
      if (!hydrogen) {
        throw new Error('Could not find hydrogen element');
      }

      console.log('Testing external data fetch for Hydrogen...');
      const result = await getElementExternalData(hydrogen, {
        includeWikipedia: true,
        includePTable: true,
        timeout: 5000
      });

      testResults = [
        ...testResults,
        {
          test: 'Hydrogen External Data',
          success: result.success,
          details: {
            sources: result.sources,
            cached: result.cached,
            fetchTime: result.fetchTime,
            hasWikipedia: !!result.data?.wikipedia,
            hasPTable: !!result.data?.ptable,
            errors: result.errors
          }
        }
      ];

      if (result.data?.wikipedia) {
        testResults = [
          ...testResults,
          {
            test: 'Wikipedia Data',
            success: true,
            details: {
              title: result.data.wikipedia.title,
              extractLength: result.data.wikipedia.extract?.length || 0,
              hasImages: result.data.wikipedia.images?.length || 0
            }
          }
        ];
      }

      if (result.data?.ptable) {
        testResults = [
          ...testResults,
          {
            test: 'PTable Data',
            success: true,
            details: {
              isotopes: result.data.ptable.isotope_data?.length || 0,
              compounds: result.data.ptable.compound_data?.length || 0,
              additionalProps: Object.keys(result.data.ptable.additional_properties || {}).length
            }
          }
        ];
      }

      // Test cache functionality
      const cachedResult = await getElementExternalData(hydrogen);
      testResults = [
        ...testResults,
        {
          test: 'Cache Functionality',
          success: cachedResult.cached,
          details: {
            cached: cachedResult.cached,
            fetchTime: cachedResult.fetchTime
          }
        }
      ];

      // Get cache stats
      cacheStats = getCacheStats();

    } catch (error) {
      testResults = [
        ...testResults,
        {
          test: 'API Integration',
          success: false,
          details: {
            error: error.message
          }
        }
      ];
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    // Auto-run test after a short delay
    setTimeout(runAPITest, 1000);
  });
</script>

<div class="api-test-container">
  <div class="test-header">
    <h3>API Integration Test</h3>
    <button on:click={runAPITest} disabled={isLoading} class="test-button">
      {isLoading ? 'Testing...' : 'Run Test'}
    </button>
  </div>

  {#if isLoading}
    <div class="loading">
      <div class="spinner"></div>
      <span>Testing API integration...</span>
    </div>
  {/if}

  {#if testResults.length > 0}
    <div class="test-results">
      <h4>Test Results</h4>
      {#each testResults as result}
        <div class="test-result" class:success={result.success} class:failure={!result.success}>
          <div class="result-header">
            <span class="test-name">{result.test}</span>
            <span class="test-status">{result.success ? '✅' : '❌'}</span>
          </div>
          <div class="result-details">
            <pre>{JSON.stringify(result.details, null, 2)}</pre>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  {#if cacheStats}
    <div class="cache-stats">
      <h4>Cache Statistics</h4>
      <pre>{JSON.stringify(cacheStats, null, 2)}</pre>
    </div>
  {/if}
</div>

<style>
  .api-test-container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    font-family: 'Inter', sans-serif;
  }

  .test-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .test-header h3 {
    margin: 0;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .test-button {
    padding: 0.5rem 1rem;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .test-button:hover:not(:disabled) {
    background: #2563eb;
  }

  .test-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .loading {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    justify-content: center;
    color: #94a3b8;
  }

  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid #374151;
    border-top: 2px solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .test-results, .cache-stats {
    margin-top: 1.5rem;
  }

  .test-results h4, .cache-stats h4 {
    margin: 0 0 1rem 0;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .test-result {
    margin-bottom: 1rem;
    padding: 1rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .test-result.success {
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
  }

  .test-result.failure {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.3);
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .test-name {
    font-weight: 600;
    color: white;
  }

  .test-status {
    font-size: 1.2rem;
  }

  .result-details pre, .cache-stats pre {
    background: rgba(0, 0, 0, 0.3);
    padding: 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    color: #e2e8f0;
    overflow-x: auto;
    margin: 0;
    white-space: pre-wrap;
  }
</style>