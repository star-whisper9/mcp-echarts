---
title: Multi-User
icon: flowbite:users-outline
order: 2
footer: Translated by GPT-4.1
---

# Multi-User

In addition to providing local single-user service via `stdio` transport, you can also deploy it as an HTTP service supporting multiple users. Currently, two transports are supported: `Streamable HTTP` and _`SSE` (deprecated)_.

## Streamable HTTP

Streamable HTTP is the recommended HTTP transport for the MCP protocol, replacing the previous SSE (Server-Sent Events) transport. You can also use `npx` to deploy this package as an HTTP transport, just configure the following:

```yaml
# 示例以 yaml 作为示例
# Example using yaml as a sample
server:
  transport: http
  port: 12345
  host: 127.0.0.1

resource:
  resourcePath: /Path/To/ResourceDir
  geoJsonPath: /Path/To/GeoJsonDir
```

The key configuration here is `transport`. For other configurations, see [Configuration](./config).

## SSE

To maintain compatibility with legacy clients, a basic SSE server implementation is retained. **If your client supports it, you should prefer Streamable HTTP transport.**

```yaml
server:
  transport: sse
  port: 12345
  host: 127.0.0.1

resource:
  resourcePath: /Path/To/ResourceDir
  geoJsonPath: /Path/To/GeoJsonDir
```

## Security Recommendations

- Avoid listening on `0.0.0.0`.
- In production environments, it is recommended to use HTTPS transport.
- Properly configure CORS rules to avoid unnecessary cross-origin requests.
- _For public services, implement authentication yourself to prevent unauthorized access._

## Usage

In the client, create an MCP service with the deployed transport type, and set the URL to the service's exposed URL.
