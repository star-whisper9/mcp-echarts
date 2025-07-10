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

**When you pass in both a valid YAML file and command line parameters, all command line configuration will be ignored.**

## YAML

YAML files offer more centralized configuration management and better readability.

You can create a YAML configuration for the service anywhere, then use the `--config-path` command line argument to specify the configuration file path (**required**).

### Example Configuration

An example YAML configuration is as follows _(you can also find it in the source code as `config.yaml.example`)_:

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

logging:
  consoleLevel: info
  fileLevel: warn
```

### Available Options

- `server` block

| Key         | Description                                                                                                                             | Default     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `transport` | Transport protocol, supports `http` and `stdio` _(or the deprecated `sse`)_                                                             | `stdio`     |
| `port`      | Port number, the port MCP service listens on                                                                                            | `1122`      |
| `host`      | Host address, the host address MCP service listens on                                                                                   | `127.0.0.1` |
| `cors`      | List of allowed CORS origins, supports wildcard `*`. Accepts a list or a string (path to a line-separated text file of allowed domains) | Empty list  |

- `resource` block

| Key            | Description                                                | Default                 |
| -------------- | ---------------------------------------------------------- | ----------------------- |
| `resourcePath` | Absolute path to the directory for generated chart images  | `./static`              |
| `enabled`      | Whether to enable the built-in HTTP static hosting service | `true`                  |
| `port`         | Port number for the built-in HTTP static hosting service   | `1123`                  |
| `host`         | Host address for the built-in HTTP static hosting service  | `127.0.0.1`             |
| `baseUrl`      | Base URL for the built-in HTTP static hosting service      | `http://127.0.0.1:1123` |
| `geoJsonPath`  | Directory path for GeoJSON files                           | `./geojson`             |

- `logging` block

| Key            | Description                                                           | Default |
| -------------- | --------------------------------------------------------------------- | ------- |
| `consoleLevel` | Console log level, supports `trace`, `debug`, `info`, `warn`, `error` | `info`  |
| `fileLevel`    | File log level, supports `trace`, `debug`, `info`, `warn`, `error`    | `warn`  |

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
| `--log-console`  | `logging.consoleLevel`  |
| `--log-file`     | `logging.fileLevel`     |

## (Deprecated) Environment Variables

For compatibility reasons, we have retained the original environment variable configuration method of the application, but no longer add new environment variables. **Environment variable configuration will be removed in the future**.

| Env               | YAML Path               |
| ----------------- | ----------------------- |
| `MCP_TRANSPORT`   | `server.transport`      |
| `MCP_PORT`        | `server.port`           |
| `MCP_HOST`        | `server.host`           |
| `MCP_CORS`        | `server.cors`           |
| `RES_PATH`        | `resource.resourcePath` |
| `RES_ENABLED`     | `resource.enabled`      |
| `RES_PORT`        | `resource.port`         |
| `RES_HOST`        | `resource.host`         |
| `RES_BASE_URL`    | `resource.baseUrl`      |
| `GEOJSON_PATH`    | `resource.geoJsonPath`  |
| **Not Supported** | `logging.consoleLevel`  |
| **Not Supported** | `logging.fileLevel`     |
