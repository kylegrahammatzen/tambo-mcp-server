import { exec } from 'child_process';
import { promisify } from 'util';

interface TestCall {
  name: string;
  args?: Record<string, any>;
  description: string;
}

console.log('Testing Docs MCP Server...\n');

const testCalls: TestCall[] = [
  {
    name: 'discover_docs',
    description: 'Testing automatic documentation discovery',
  },
  {
    name: 'list_sections',
    description: 'Testing section listing',
  },
  {
    name: 'fetch_docs',
    args: { path: '/concepts/components' },
    description: 'Testing docs fetching',
  },
  {
    name: 'search_docs',
    args: { query: 'components' },
    description: 'Testing search functionality',
  }
];

async function testServer(): Promise<void> {
  console.log('MCP Server TypeScript setup complete!');
  console.log('\nAvailable test scenarios:');

  testCalls.forEach((test, index) => {
    console.log(`${index + 1}. ${test.description}`);
    console.log(`   Tool: ${test.name}${test.args ? ` with args: ${JSON.stringify(test.args)}` : ''}`);
  });

  console.log('\nTo run the server:');
  console.log('npm run dev    # Development mode with watch');
  console.log('npm start      # Build and start');
}

testServer().catch(console.error);