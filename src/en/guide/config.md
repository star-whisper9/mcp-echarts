---
title: Configuration
icon: solar:settings-bold-duotone
order: 3
footer: Translated by GPT-4.1
---

# Configuration

You can configure the ECharts service in two ways. Both provide the same functionality, but the key names differ slightly.

- **(Recommended)** [YAML File](#yaml)
- [Command Line Arguments](#command-line-arguments)

## YAML

YAML files provide centralized management and excellent readability for configuration.

You can create a YAML configuration for the service anywhere, then use the `--config-path` command line argument to specify the configuration file path (**required**).

### Example Configuration

A sample YAML configuration is as follows _(you can also find it in the source code as `config.yaml.example`)_:

```yaml
# MCP 服务器块
# MCP server block
server:
  transport: http
  port: 12345
  host: 0.0.0.0
  cors:
    - "*"

# 资源相关块
# Resource-related block
resource:
  resourcePath: /Path/To/ResourceDir
  enabled: true
  port: 11223
  host: 0.0.0.0
  baseUrl: http://localhost:11223
  geoJsonPath: /Path/To/GeoJsonDir
```

### Available Options

- `server` block

| Key         | Description                                                                                                                              | Default     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `transport` | Transport protocol, supports `http` and `stdio` _(or deprecated `sse`)_                                                                  | `stdio`     |
| `port`      | Port number, the port MCP service listens on                                                                                             | `1122`      |
| `host`      | Host address, the host address MCP service listens on                                                                                    | `127.0.0.1` |
| `cors`      | List of allowed CORS origins, supports wildcard `*`. Accepts a list or a string (path to a text file with allowed domains, one per line) | Empty list  |

- `resource` block

| Key            | Description                                                | Default                 |
| -------------- | ---------------------------------------------------------- | ----------------------- |
| `resourcePath` | Absolute path to the directory for generated chart images  | `./static`              |
| `enabled`      | Whether to enable the built-in HTTP static hosting service | `true`                  |
| `port`         | Port number for the built-in HTTP static hosting service   | `1123`                  |
| `host`         | Host address for the built-in HTTP static hosting service  | `127.0.0.1`             |
| `baseUrl`      | Base URL for the built-in HTTP static hosting service      | `http://127.0.0.1:1123` |
| `geoJsonPath`  | Directory path for GeoJSON files                           | `./geojson`             |

## Command Line Arguments

You can also configure the ECharts service via command line arguments. Below is the mapping between arguments and YAML file keys.

| Argument         | YAML Path               |
| ---------------- | ----------------------- |
| `--transport`    | `server.transport`      |
| `--mcp-port`     | `server.port`           |
| `--mcp-host`     | `server.host`           |
| `--cors`         | `server.cors`           |
| `--res-path`     | `resource.resourcePath` |
| `--res-enabled`  | `resource.enabled`      |
| `--res-port`     | `resource.port`         |
| `--res-host`     | `resource.host`         |
| `--res-base-url` | `resource.baseUrl`      |
| `--geojson-path` | `resource.geoJsonPath`  |
