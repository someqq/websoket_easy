# WebSocket Client

A lightweight and flexible WebSocket client library for both browser and Node.js environments. It supports automatic reconnection with exponential backoff, heartbeat message handling, and event-based communication using `mitt`.

## Features

- **Automatic Reconnection**: Handles automatic reconnections with exponential backoff (configurable) to handle network interruptions.
- **Heartbeat Support**: Supports sending periodic heartbeat messages to keep the connection alive.
- **Customizable**: Configure WebSocket options like the heartbeat interval and message, as well as the reconnection behavior.

## Installation

### Using npm

To install the library via npm, run the following command:

```bash
npm install websocket-client
