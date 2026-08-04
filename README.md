# @pipeworx/mdn-search

Mozilla Developer Network (MDN) search MCP — search MDN docs for HTML/CSS/JS/Web APIs and fetch page summaries. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

- `search(query, locale?, size?, page?)` — full-text MDN search
- `summary(slug, locale?)` — page summary (title, sections, first paragraph)
- `bcd(slug, locale?)` — Browser Compatibility Data block for a feature page

## Locales

Common: `en-US` (default), `fr`, `es`, `ja`, `zh-CN`, `pt-BR`, `de`, `ru`, `ko`.

## Data source

- Search: `https://developer.mozilla.org/api/v1/search`
- Page: `https://developer.mozilla.org/api/v1/<locale>/page?slug=…`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "mdn-search": {
      "url": "https://gateway.pipeworx.io/mdn-search/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Mdn Search data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
