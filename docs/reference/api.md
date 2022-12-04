---
layout: page
title: API Reference
permalink: /reference/api
---

# API Reference

## REST API

The REST API is fairly minimal. It just handles a few things outside the WebSocket API

### Status

A sanity check on the backend service. Also useful for waking up the lambda.

`GET /status`

**Response body:**

```ts
{
  status: "UP";
}
```

### Create room

Creates a new room and returns the metadata to the host.

`POST /rooms`

**Response body:**

```ts
{
  roomId: string,
  hostKey: string,
  validSizes: string[]
}
```

### Delete room

Deletes a room and all the users/votes associated with it.

`DELETE /rooms/{roomId}`

**Request body:** `{ hostKey: string }`
