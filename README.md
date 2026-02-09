# Docs MCP Server

A TypeScript-based Model Context Protocol (MCP) server for serving Tambo documentation from https://docs.tambo.co/

<a href="https://glama.ai/mcp/servers/@kylegrahammatzen/tambo-mcp-server">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@kylegrahammatzen/tambo-mcp-server/badge" alt="Tambo Docs Server MCP server" />
</a>

## Features

- **Dynamic Documentation Discovery**: Automatically crawls and discovers all available documentation pages
- **Intelligent Content Parsing**: Extracts clean content from Fumadocs-powered sites
- **Fast Search**: Search across all discovered documentation
- **TypeScript**: Full type safety and modern development experience
- **Caching**: 10-minute cache for improved performance

## Installation

```bash
npm install
```

## Usage

### Development (with hot reload)
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

## Available Tools

- **discover_docs**: Crawl and discover all available documentation paths automatically
- **fetch_docs**: Fetch specific documentation pages by path
- **search_docs**: Search documentation for specific terms across all discovered pages
- **list_sections**: List all discovered documentation sections, grouped by category

## Installation

### In Cursor

Create or update `.cursor/mcp.json` in your project root:

**MacOS/Linux:**
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "node",
      "args": ["D:/oss/docs-mcp-server/dist/index.js"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "cmd",
      "args": ["/c", "node", "D:\\oss\\docs-mcp-server\\dist\\index.js"]
    }
  }
}
```

Note: The MCP server won't be enabled by default. Go to Cursor settings → MCP settings and click "enable" on the Tambo Docs MCP server.

### In Claude Desktop

Update your Claude Desktop configuration:

**MacOS/Linux:** `~/.claude/config.json`
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "node",
      "args": ["D:/oss/docs-mcp-server/dist/index.js"]
    }
  }
}
```

**Windows:** `%APPDATA%\Claude\config.json`
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "node",
      "args": ["D:\\oss\\docs-mcp-server\\dist\\index.js"]
    }
  }
}
```

### In Windsurf

Create or update `~/.codeium/windsurf/mcp_config.json`:

**MacOS/Linux:**
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "node", 
      "args": ["D:/oss/docs-mcp-server/dist/index.js"]
    }
  }
}
```

**Windows:**
```json
{
  "mcpServers": {
    "tambo-docs": {
      "command": "cmd",
      "args": ["/c", "node", "D:\\oss\\docs-mcp-server\\dist\\index.js"]
    }
  }
}
```

### Setup

Before using, build the server:

```bash
npm install
npm run build
```

## Development

The server is built with TypeScript and uses:
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **cheerio**: HTML parsing and content extraction
- **tsx**: Fast TypeScript execution for development