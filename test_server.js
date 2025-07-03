#!/usr/bin/env node

/**
 * Comprehensive test suite for Gemini Imagen MCP Server
 * Tests MCP protocol compliance, API integration, and error handling
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Test configuration
const TEST_CONFIG = {
  serverPath: './build/index.js',
  timeout: 30000,
  testApiKey: process.env.GEMINI_API_KEY || 'test_api_key'
};

// Test utilities
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async runTest(test) {
    console.log(`\n🧪 Running: ${test.name}`);
    try {
      await test.testFn();
      console.log(`✅ PASS: ${test.name}`);
      this.passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${test.name}`);
      console.log(`   Error: ${error.message}`);
      this.failed++;
    }
  }

  async runAll() {
    console.log(`\n🚀 Starting test suite with ${this.tests.length} tests\n`);
    
    for (const test of this.tests) {
      await this.runTest(test);
    }

    console.log(`\n📊 Test Results:`);
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total: ${this.tests.length}`);
    
    if (this.failed > 0) {
      console.log(`\n❌ Some tests failed!`);
      process.exit(1);
    } else {
      console.log(`\n✅ All tests passed!`);
    }
  }
}

// MCP Client for testing
class MCPTestClient {
  constructor() {
    this.serverProcess = null;
    this.messageId = 1;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', [TEST_CONFIG.serverPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, GEMINI_API_KEY: TEST_CONFIG.testApiKey }
      });

      this.serverProcess.stderr.on('data', (data) => {
        if (data.toString().includes('running')) {
          resolve();
        }
      });

      this.serverProcess.on('error', reject);
      
      setTimeout(() => reject(new Error('Server startup timeout')), 5000);
    });
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      const messageStr = JSON.stringify(message) + '\n';
      
      let responseData = '';
      const onData = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData.trim());
          this.serverProcess.stdout.removeListener('data', onData);
          resolve(response);
        } catch (e) {
          // Continue accumulating data
        }
      };

      this.serverProcess.stdout.on('data', onData);
      this.serverProcess.stdin.write(messageStr);
      
      setTimeout(() => {
        this.serverProcess.stdout.removeListener('data', onData);
        reject(new Error('Message timeout'));
      }, TEST_CONFIG.timeout);
    });
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  getNextId() {
    return this.messageId++;
  }
}

// Test suite setup
const testRunner = new TestRunner();
const mcpClient = new MCPTestClient();

// Test 1: MCP Protocol - Initialize
testRunner.addTest('MCP Protocol - Initialize', async () => {
  await mcpClient.startServer();
  
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    },
    id: mcpClient.getNextId()
  });

  if (!response.result) {
    throw new Error('Initialize failed - no result');
  }
  
  if (!response.result.capabilities) {
    throw new Error('Initialize failed - no capabilities');
  }
});

// Test 2: MCP Protocol - List Tools
testRunner.addTest('MCP Protocol - List Tools', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/list',
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.tools) {
    throw new Error('tools/list failed');
  }

  const tools = response.result.tools;
  const expectedTools = ['generate_image', 'batch_generate', 'list_models', 'health_check'];
  
  for (const expectedTool of expectedTools) {
    if (!tools.find(tool => tool.name === expectedTool)) {
      throw new Error(`Missing expected tool: ${expectedTool}`);
    }
  }
});

// Test 3: MCP Protocol - List Resources
testRunner.addTest('MCP Protocol - List Resources', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'resources/list',
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.resources) {
    throw new Error('resources/list failed');
  }

  const resources = response.result.resources;
  const expectedResources = ['generation_history', 'api_documentation'];
  
  for (const expectedResource of expectedResources) {
    if (!resources.find(resource => resource.name.includes(expectedResource))) {
      throw new Error(`Missing expected resource: ${expectedResource}`);
    }
  }
});

// Test 4: Tool Execution - Health Check
testRunner.addTest('Tool Execution - Health Check', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'health_check',
      arguments: {}
    },
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.content) {
    throw new Error('health_check failed');
  }

  const content = response.result.content[0];
  if (!content.text.includes('Server healthy')) {
    throw new Error('health_check returned unexpected content');
  }
});

// Test 5: Tool Execution - List Models
testRunner.addTest('Tool Execution - List Models', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'list_models',
      arguments: {}
    },
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.content) {
    throw new Error('list_models failed');
  }

  const content = response.result.content[0];
  if (!content.text.includes('imagen-3') || !content.text.includes('imagen-4')) {
    throw new Error('list_models returned unexpected content');
  }
});

// Test 6: Tool Execution - Generate Image (Mock)
testRunner.addTest('Tool Execution - Generate Image (Mock)', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'generate_image',
      arguments: {
        prompt: 'test image',
        model: 'imagen-3',
        number_of_images: 1,
        aspect_ratio: '1:1'
      }
    },
    id: mcpClient.getNextId()
  });

  // Note: This will likely fail with API error due to test key
  // but we're testing the tool structure and parameter validation
  if (!response.result && !response.error) {
    throw new Error('generate_image returned no result or error');
  }
  
  // If it's an error, it should be a proper error response
  if (response.result && response.result.isError) {
    // This is expected with test API key
    console.log('   Expected API error with test key');
  }
});

// Test 7: Parameter Validation - Invalid Model
testRunner.addTest('Parameter Validation - Invalid Model', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'generate_image',
      arguments: {
        prompt: 'test image',
        model: 'invalid-model',
        number_of_images: 1
      }
    },
    id: mcpClient.getNextId()
  });

  if (!response.error) {
    throw new Error('Should have returned validation error for invalid model');
  }
});

// Test 8: Parameter Validation - Invalid Aspect Ratio
testRunner.addTest('Parameter Validation - Invalid Aspect Ratio', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'generate_image',
      arguments: {
        prompt: 'test image',
        aspect_ratio: 'invalid-ratio'
      }
    },
    id: mcpClient.getNextId()
  });

  if (!response.error) {
    throw new Error('Should have returned validation error for invalid aspect ratio');
  }
});

// Test 9: Batch Generation - Empty Prompts
testRunner.addTest('Batch Generation - Empty Prompts', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: {
      name: 'batch_generate',
      arguments: {
        prompts: []
      }
    },
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.content) {
    throw new Error('batch_generate should handle empty prompts gracefully');
  }
  
  const content = response.result.content[0];
  if (!content.text.includes('No prompts provided') && !content.text.includes('Batch processing is disabled')) {
    console.log('Actual response:', JSON.stringify(response.result, null, 2));
    throw new Error('batch_generate should return appropriate error message');
  }
});

// Test 10: Resource Access - API Documentation
testRunner.addTest('Resource Access - API Documentation', async () => {
  const response = await mcpClient.sendMessage({
    jsonrpc: '2.0',
    method: 'resources/read',
    params: {
      uri: 'docs://api'
    },
    id: mcpClient.getNextId()
  });

  if (!response.result || !response.result.contents) {
    throw new Error('API documentation resource failed');
  }

  const content = response.result.contents[0];
  if (!content.text.includes('Imagen') || !content.text.includes('generate_image')) {
    throw new Error('API documentation content is invalid');
  }
});

// Test cleanup
async function cleanup() {
  await mcpClient.stopServer();
}

// Run all tests
async function main() {
  try {
    await testRunner.runAll();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

// Run the tests
main().catch(console.error);