---
title: 配置
icon: solar:settings-bold-duotone
order: 3
---

# 配置

你可以通过两种方式配置 ECharts 服务，二者的功能相同但键名略有不同。

- **(推荐)** [YAML 文件](#yaml)
- [命令行参数](#命令行参数)

## YAML

YAML 文件对配置的管理更集中，可读性优良。

你可以在任意位置创建服务的 YAML 配置，随后使用 `--config-path` 命令行参数传入配置文件路径（**必要**）。

### 示例配置

示例的 YAML 配置如下 _(你也可以在源码的 `config.yaml.example` 获得)_：

```yaml
# MCP 服务器块
server:
  transport: http
  port: 12345
  host: 0.0.0.0
  cors:
    - "*"

# 资源相关块
resource:
  resourcePath: /Path/To/ResourceDir
  enabled: true
  port: 11223
  host: 0.0.0.0
  baseUrl: http://localhost:11223
  geoJsonPath: /Path/To/GeoJsonDir
```

### 可用项

- `server` 块

| 键          | 描述                                                                                                     | 默认值      |
| ----------- | -------------------------------------------------------------------------------------------------------- | ----------- |
| `transport` | 传输协议，支持 `http` 和 `stdio`_(或已弃用的 `sse`)_                                                     | `stdio`     |
| `port`      | 端口号，MCP 服务监听的端口                                                                               | `1122`      |
| `host`      | 主机地址，MCP 服务监听的主机地址                                                                         | `127.0.0.1` |
| `cors`      | CORS 允许的来源列表，支持通配符 `*`。允许传入列表 / 字符串（指向一个按行分隔的，存储允许的域的文本文件） | 空列表      |

- `resource` 块

| 键             | 描述                             | 默认值                  |
| -------------- | -------------------------------- | ----------------------- |
| `resourcePath` | 生成的图表图片存储目录的绝对路径 | `./static`              |
| `enabled`      | 是否启用内置 HTTP 静态托管服务   | `true`                  |
| `port`         | 内置 HTTP 静态托管服务的端口号   | `1123`                  |
| `host`         | 内置 HTTP 静态托管服务的主机地址 | `127.0.0.1`             |
| `baseUrl`      | 内置 HTTP 静态托管服务的基础 URL | `http://127.0.0.1:1123` |
| `geoJsonPath`  | GeoJSON 文件的目录路径           | `./geojson`             |

## 命令行参数

你也可以通过命令行参数来配置 ECharts 服务，此处仅给出参数与 YAML 文件键的对应关系。

| 参数             | YAML 路径               |
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
