import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolRequest,
} from '@modelcontextprotocol/sdk/types.js';
import { DocHandler } from './doc-handler.js';

export class DocsServer {
  private server: Server;
  private docHandler: DocHandler;

  constructor() {
    this.server = new Server(
      {
        name: 'docs-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );
    
    this.docHandler = new DocHandler();
    this.setupToolHandlers();
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'fetch_docs',
            description: 'Fetch documentation content from docs.tambo.co',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: 'The documentation path to fetch (e.g., /concepts/components)',
                },
              },
              required: ['path'],
            },
          },
          {
            name: 'search_docs',
            description: 'Search for documentation pages containing specific terms',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query to find relevant documentation',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'list_sections',
            description: 'Dynamically discover and list all available documentation sections',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'discover_docs',
            description: 'Crawl the main docs page to discover all available documentation paths',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'fetch_docs':
            return await this.docHandler.fetchDocs(args?.path as string);
          case 'search_docs':
            return await this.docHandler.searchDocs(args?.query as string);
          case 'list_sections':
            return await this.docHandler.listSections();
          case 'discover_docs':
            return await this.docHandler.discoverDocs();
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Docs MCP server running on stdio');
  }
}