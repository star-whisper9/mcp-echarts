---
title: Quick Start
icon: solar:play-bold-duotone
footer: Translated by GPT-4.1
order: 1
---

# Quick Start

## Local Usage

You can use the ECharts service locally for **single-user** scenarios. The recommended deployment method is via `npx`, running in `stdio` transport mode.

### Preparation

You need:

- [ ] An LLM client that supports Stdio MCP service
- [ ] A Node.js environment with `npx` installed
- [ ] _Internet connection_

### Startup

In your preferred client, create a new MCP server with `stdio` transport. The startup command is `npx -y @starwhisper9/mcp-echarts`.

Next, you need to choose one of the following methods for necessary configuration:

::: tabs

@tab Using Command Line Arguments

When configuring via command line arguments, you need to set:

- `--res-path`: The absolute path to a writable directory for storing generated chart images
- `--geojson-path`: The absolute path to a readable directory containing the GeoJSON files you need to load

> You can refer to [Configuration](./config#command-line-arguments) to add additional optional settings.

@tab Using YAML File

Using a YAML file allows you to manage configurations more centrally. You need to create a YAML file that contains at least:

```yaml
resource:
  geoJsonPath: /absolute/path/to/your/GeoJSON/files
  resourcePath: /absolute/path/to/generated/files
```

Then, use the `--config-path` parameter in the startup command to specify the path to this YAML file.

> You can refer to [Configuration](./config#yaml) to add additional optional settings.

:::

### Example Claude Desktop Configuration Block

::: tabs

@tab Using Command Line Arguments

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@starwhisper9/mcp-echarts",
        "--res-path",
        "/path/to/write/allowed/dir",
        "--geojson-path",
        "/path/to/geojson/dir"
      ]
    }
  }
}
```

@tab Using YAML File

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@starwhisper9/mcp-echarts",
        "--config-path",
        "/path/to/your/config.yaml"
      ]
    }
  }
}
```

:::
