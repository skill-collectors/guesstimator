---
layout: page
title: API Reference
permalink: /reference/api
---

# API Reference

## WebSocket API

### Client actions

The following messages can be sent to the service:

#### Subscribe

Attach the client's `connectionId` to the given Room so they will receive room updates.

```ts
{
  action: "subscribe",
  data: {
    roomId: string,
  }
}
```

#### Join

Associates the given username to the given userKey in the given room. This allows the user to vote.

```ts
{
  action: "join",
  data: {
    roomId: string,
    userKey: string,
    username: string,
  }
}
```

#### Vote

Submits a vote for the user

```ts
{
  action: "vote",
  data: {
    roomId: string,
    userKey: string,
    vote: string,
  }
}
```

#### Reveal

Reveals the cards (client must be the host)

```ts
{
  action: "reveal",
  data: {
    roomId: string,
    hostKey: string,
  }
}
```

#### Reset

Hides the cards and erases any current votes.

```ts
{
  action: "reset",
  data: {
    roomId: string,
    hostKey: string,
  }
}
```

#### Leave room

Removes the user from the room.

```ts
{
  action: "leave",
  data: {
    roomId: string,
    userKey: string,
  }
}
```

### Server respones

All actions result in the following data being sent to all users:

```ts
{
  status: 200,
  data: {
    roomId: string,
    validSizes: string[],
    isRevealed: boolean,
    users: [{
      userKey?: string, // only included for the current user
      userId: string,
      username?: string,
      hasVote: boolean,
      vote?: string, // only included if votes are revealed
    }]
  }
}
```

#### Errors

If there is an error, it will be sent to the client as follows:

```ts
{
  status: number, // 4xx or 5xx
  error: string,
}
```

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
