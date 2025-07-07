---
title: FAQ
icon: ph:question-duotone
order: 99
footer: Translated by GPT-4.1
---

# FAQ

## Installation / Startup Failure Locally

When using locally, if errors occur during installation or startup, please check the following:

**First, try installing `node-canvas` globally using `npm i -g canvas`. If the installation fails, please search for the relevant logs and how to install `node-canvas` on your platform.**

`node-canvas` is a server-side rendering library, which is OS and platform dependent. Depending on your system and CPU architecture, installation methods may vary. You can search for keywords like `Install node-canvas on Windows` or `Install node-canvas on macOS`, or search the error logs for more information.

For other errors, please search the error logs provided by the application or submit an Issue.

## No Map in Map Series Charts After Startup

First, **due to copyright issues, the release version does not include any GeoJSON**. If you need to use map charts, you need to prepare the required GeoJSON files yourself.

If you have completed the above steps but map series charts still do not display maps, please check whether your GeoJSON path configuration is correct. **In particular, if you are using `npx`, it is best to specify an absolute path.**

## MacOS Fails to Connect to MCP Server

For MacOS users, the default `1122` (MCP Port) and `1123` (Resource Port) may violate MacOS security policies for low-numbered ports. You need to specify a higher port number.

## "Illegal Tool" Prompt in Some Clients

In some clients (especially VSCode), you may be prompted that the connected MCP server has an illegal tool (specifically, the Schema is invalid). This is due to dynamic map registration in map series charts:

- When all maps fail to register
- When there are no maps available for registration

In these two cases, the server will return a JSON Schema with an empty enum parameter.

**If you do not intend to use map charts, you can ignore this error.** Otherwise, refer to [No Map](#no-map-in-map-series-charts-after-startup) for troubleshooting.

## Generated Chart Link Does Not Display Image

If: the service has started successfully, the LLM is called successfully, but the generated chart link does not display an image.

Ensure: the `resourcePath` you set is a writable directory, the path is correct (preferably use an absolute path), and `npx` has permission to create files in that directory.
