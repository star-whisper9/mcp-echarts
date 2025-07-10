---
title: 快速开始
icon: solar:play-bold-duotone
order: 1
---

# 快速开始

## 在本地使用

你可以直接在本地为**单用户**使用 ECharts 服务，推荐的部署方式是通过 `npx`，运行于 `stdio` 传输模式。

### 准备

你需要：

- [ ] 支持 Stdio MCP 服务的 LLM 客户端
- [ ] 安装了 `npx` 的 Node.js 环境
- [ ] _互联网连接_

### 启动

在你熟悉的客户端中，新建一个 `stdio` 传输的 MCP 服务器，其启动指令为 `npx -y @starwhisper9/mcp-echarts`。

接着，你需要选择一种方式进行必要的配置：

::: tabs

@tab 使用命令行参数

通过命令行参数配置时，你需要配置：

- `--res-path`: 指向可写目录的绝对路径，用于存储生成的图表图片
- `--geojson-path`: 指向可读目录的绝对路径，存储了你需要加载的 GeoJSON

> 你可以参考 [配置](./config#命令行参数) 添加额外的可选配置。

@tab 使用 YAML 文件

通过 YAML 文件能够更集中的管理配置，你需要创建一个 YAML 文件，至少包含：

```yaml
resource:
  geoJsonPath: /指向你的 GeoJSON 文件存储位置的绝对路径
  resourcePath: /指向生成文件存储位置的绝对路径
```

接着在启动指令中使用 `--config-path` 参数指定该 YAML 文件的路径。

> 你可以参考 [配置](./config#yaml) 添加额外的可选配置。

:::

### 示例 Claude Desktop 配置块

::: tabs

@tab 使用命令行参数

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

@tab 使用 YAML 文件

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
