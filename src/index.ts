interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * MDN Search MCP
 *
 * Auth: none.
 * Docs: there's no formal public API contract, but the developer.mozilla.org
 *       frontend uses these stable JSON endpoints to power its own search.
 */


const BASE = 'https://developer.mozilla.org';

const tools: McpToolExport['tools'] = [
  {
    name: 'search',
    description: 'Full-text search across MDN content.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        locale: { type: 'string', description: 'en-US (default) | fr | es | ja | zh-CN | …' },
        size: { type: 'number', description: '1-100 (default 10)' },
        page: { type: 'number', description: '1-based page' },
      },
      required: ['query'],
    },
  },
  {
    name: 'summary',
    description: 'Page summary by slug (e.g. "Web/API/fetch" or "Web/CSS/grid").',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        locale: { type: 'string' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'bcd',
    description: 'Browser Compatibility Data block for a feature page.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string' },
        locale: { type: 'string' },
      },
      required: ['slug'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search': {
      const params = new URLSearchParams({
        q: reqStr(args, 'query', '"async iterator"'),
        locale: String(args.locale ?? 'en-US'),
        size: String(Math.min(100, Math.max(1, (args.size as number) ?? 10))),
        page: String(Math.max(1, (args.page as number) ?? 1)),
      });
      return mdnGet(`/api/v1/search?${params}`);
    }
    case 'summary':
      return mdnGet(`/${String(args.locale ?? 'en-US')}/docs/${stripWebPrefix(reqStr(args, 'slug', '"Web/API/fetch"'))}/index.json`);
    case 'bcd': {
      const slug = stripWebPrefix(reqStr(args, 'slug', '"Web/API/fetch"'));
      const data = (await mdnGet(`/${String(args.locale ?? 'en-US')}/docs/${slug}/index.json`)) as {
        doc?: {
          body?: { type?: string; value?: { data?: unknown; query?: string; dataURL?: string } }[];
        };
      };
      const bcdBlock = data.doc?.body?.find((b) => b.type === 'browser_compatibility');
      return { slug, bcd: bcdBlock?.value ?? null };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function stripWebPrefix(slug: string): string {
  // Accept both "Web/API/fetch" and "/en-US/docs/Web/API/fetch" — normalize to slug-only.
  return slug.replace(/^\/?(?:[a-z]{2}-[A-Z]{2}\/docs\/)?/, '');
}

async function mdnGet(path: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'pipeworx-mcp-mdn-search/1.0 (+https://pipeworx.io)',
    },
  });
  if (res.status === 404) throw new Error('MDN: not found');
  if (res.status === 429) throw new Error('MDN: rate-limit (HTTP 429)');
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`MDN error: ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
