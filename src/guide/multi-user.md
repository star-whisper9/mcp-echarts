---
title: 多用户
icon: flowbite:users-outline
order: 2
---

# 多用户

除了通过 `stdio` 传输为本地单用户提供服务，你还可以将其部署为支持多用户的 HTTP 服务。目前支持 `Streamable HTTP` 和 _`SSE`(已弃用)_ 两种传输。

## Streamable HTTP

Streamable HTTP 是目前 MCP 协议所推荐的 HTTP 传输方式，用于取代此前的 SSE(Server-Sent Events) 传输方式。你同样可以使用 `npx` 将此包部署为 HTTP 传输，只需要配置以下内容：

```yaml
# 演示以 yaml 作为示例
server:
  transport: http
  port: 12345
  host: 127.0.0.1

resource:
  resourcePath: /Path/To/ResourceDir
  geoJsonPath: /Path/To/GeoJsonDir
```

其中的重要配置是 `transport`。其余配置参见[配置](./config)。

## SSE

为了兼容旧客户端，我们保留了一个基础的 SSE 服务端实现。**在客户端支持的情况下，你应优先选用 Streamable HTTP 传输**。

```yaml
server:
  transport: sse
  port: 12345
  host: 127.0.0.1

resource:
  resourcePath: /Path/To/ResourceDir
  geoJsonPath: /Path/To/GeoJsonDir
```

## 安全建议

- 避免监听 `0.0.0.0`
- 在生产环境中，建议使用 HTTPS 传输
- 合理配置 CORS 规则，避免不必要的跨域请求
- _对于公网服务，自行实现身份验证，避免未授权访问_

## 使用

在对应客户端中，新建服务部署的传输方式的 MCP 服务，URL 设置为服务暴露的 URL。
