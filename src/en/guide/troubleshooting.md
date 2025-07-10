---
title: FAQ
icon: ph:question-duotone
order: 99
footer: Translated by GPT-4.1
---

# FAQ

::: info

If you encounter issues during use, please first check the answers to common questions on this page, or look for / submit an Issue on [GitHub Issues]().

For the application's log location, see [Log Location](../docs/logging#日志文件位置).

:::

## Installation / Startup Failure Locally

If errors occur during installation or startup when using locally, please check the following:

**First, try installing `node-canvas` globally using `npm i -g canvas`. If the installation fails, please search for the relevant logs and how to install `node-canvas` for your platform.**

`node-canvas` is a server-side rendering library and is OS and platform dependent. The installation method may vary depending on your system and CPU architecture. You can search for keywords such as `Install node-canvas on Windows` or `Install node-canvas on macOS`, or search the error logs for more information.

For other errors, please search the relevant application error logs or submit an Issue.

## No Map Displayed in Map Series Charts After Startup

First, **due to copyright issues, the release version does not include any GeoJSON**. If you need to use map charts, you need to prepare the required GeoJSON files yourself.

If you have completed the above steps but the map series chart still does not display the map, please check whether your GeoJSON path configuration is correct. **In particular, if you are using `npx`, it is best to specify an absolute path.**

## Failed to Connect to MCP Server on MacOS

For MacOS users, the default ports `1122` (MCP Port) and `1123` (Resource Port) may violate MacOS security policies for low-numbered ports. You need to specify a higher port number.

## "Illegal Tool" Prompt on Some Clients

On some clients (especially VSCode), you may be prompted that the connected MCP server has an illegal tool (specifically, the Schema is invalid). This is due to dynamic map registration in map series charts:

- When all maps fail to register
- When there are no maps available for registration

In these two cases, the server will return a JSON Schema with an empty enum parameter.

**If you do not intend to use map charts, you can ignore this error.** Otherwise, refer to [No Map](#no-map-displayed-in-map-series-charts-after-startup) for troubleshooting.

## Generated Chart Link Does Not Display Image

If the following occurs: startup is successful, LLM is called successfully, but the generated chart link does not display an image.

Make sure: the `resourcePath` you set is a writable directory, the path is correct (preferably use an absolute path), and `npx` has permission to create files in that directory.
