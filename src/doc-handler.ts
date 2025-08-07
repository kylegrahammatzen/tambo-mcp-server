import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as cheerio from 'cheerio';
import { DocSection, CacheEntry, SearchResult } from './types.js';

export class DocHandler {
  private cache: Map<string, CacheEntry> = new Map();
  private sections: DocSection[] = [];
  private sectionsLoaded = false;

  async discoverDocs(): Promise<CallToolResult> {
    try {
      const response = await fetch('https://docs.tambo.co/');
      if (!response.ok) {
        throw new Error(`Failed to fetch main docs page: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      const discoveredSections: DocSection[] = [];
      
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (href && href.startsWith('/') && !href.startsWith('//') && text) {
          if (href.includes('/docs/') || 
              href.match(/^\/(concepts?|api|cli|examples?|getting-started|guides?)/)) {
            const category = this.extractCategory(href);
            discoveredSections.push({
              path: href,
              title: text,
              category
            });
          }
        }
      });

      const uniqueSections = discoveredSections
        .filter((section, index, self) => 
          index === self.findIndex(s => s.path === section.path)
        )
        .sort((a, b) => a.path.localeCompare(b.path));

      this.sections = uniqueSections;
      this.sectionsLoaded = true;

      return {
        content: [
          {
            type: 'text',
            text: `Discovered ${uniqueSections.length} documentation sections:\n\n${
              uniqueSections.map(s => 
                `• **${s.title}** - ${s.path}${s.category ? ` (${s.category})` : ''}`
              ).join('\n')
            }`,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to discover documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private extractCategory(path: string): string | undefined {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0] : undefined;
  }

  async ensureSectionsLoaded(): Promise<void> {
    if (!this.sectionsLoaded) {
      await this.discoverDocs();
    }
  }

  async fetchDocs(path: string): Promise<CallToolResult> {
    if (!path) {
      throw new Error('Path is required');
    }

    const url = `https://docs.tambo.co${path}`;
    const cacheKey = `docs:${path}`;
    
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.content;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      const title = $('h1').first().text().trim() || 
                   $('[data-title]').first().text().trim() ||
                   $('title').text().trim();
      
      let contentElement = $('main').first();
      if (contentElement.length === 0) {
        contentElement = $('article').first();
      }
      if (contentElement.length === 0) {
        contentElement = $('.content, [data-content], .markdown-body').first();
      }
      
      const content = contentElement.length > 0 ? contentElement.html() : '';
      const cleanContent = content ? 
        cheerio.load(content).text().replace(/\s+/g, ' ').trim() : 
        'No content found';

      const result: CallToolResult = {
        content: [
          {
            type: 'text',
            text: `# ${title}\n\nPath: ${path}\nURL: ${url}\n\n${cleanContent}`,
          },
        ],
      };

      this.cache.set(cacheKey, {
        content: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to fetch documentation: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async searchDocs(query: string): Promise<CallToolResult> {
    if (!query) {
      throw new Error('Search query is required');
    }

    await this.ensureSectionsLoaded();
    
    const results: SearchResult[] = [];
    
    const sectionsToSearch = this.sections.length > 0 ? this.sections : [
      { path: '/getting-started/quickstart', title: 'Quickstart' },
      { path: '/concepts/components', title: 'Components' },
      { path: '/api-reference/react-hooks', title: 'React Hooks' },
    ];
    
    for (const section of sectionsToSearch) {
      try {
        const response = await this.fetchDocs(section.path);
        const textContent = response.content[0] && 'text' in response.content[0] ? response.content[0].text : '';
        const content = String(textContent || '').toLowerCase();
        
        if (content.includes(query.toLowerCase())) {
          results.push({
            path: section.path,
            title: section.title,
            category: section.category,
            snippet: this.extractSnippet(content, query)
          });
        }
      } catch (error) {
        console.error(`Error searching ${section.path}:`, error instanceof Error ? error.message : String(error));
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: results.length > 0 
            ? `Found ${results.length} results for "${query}":\n\n${results.map(r => 
                `**${r.title}** (${r.path})${r.category ? ` [${r.category}]` : ''}\n${r.snippet}\n`
              ).join('\n')}`
            : `No results found for "${query}"`,
        },
      ],
    };
  }

  async listSections(): Promise<CallToolResult> {
    await this.ensureSectionsLoaded();
    
    if (this.sections.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: 'No documentation sections discovered. Try running discover_docs first.',
          },
        ],
      };
    }

    const grouped = this.sections.reduce((acc, section) => {
      const category = section.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(section);
      return acc;
    }, {} as Record<string, DocSection[]>);

    const output = Object.entries(grouped)
      .map(([category, sections]) => 
        `## ${category}\n${sections.map(s => `• **${s.title}** - ${s.path}`).join('\n')}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Available documentation sections (${this.sections.length} total):\n\n${output}`,
        },
      ],
    };
  }

  private extractSnippet(text: string, query: string, length = 150): string {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);
    
    if (index === -1) return text.substring(0, length) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(text.length, index + query.length + 100);
    
    return '...' + text.substring(start, end) + '...';
  }
}