---
layout: page
title: API Reference
permalink: /reference/api
---

# API Reference

This is just a simple outline of the proposed API. At the beginning of the project, it will describe what we want to build. When the project is finished it will describe what actually exists.

## Create room

Creates a new room and returns the metadata to the host.

`POST /rooms`

**Response body:**

```json
{
  roomId: string,
  hostKey: string,
  validSizes: string[]
}
```

### Get room

Gets the current state of the room including users and votes.

`GET /rooms/{roomId}`

**Response Body:**

```json
{
  roomId: string,
  validSizes: string[],
  isRevealed: boolean,
  users: {
    username: string,
    userKey?: string,
    hasVote: boolean,
    vote: string
  }
}                                                              |
```

## Join room

Add a new user to the room and returns a userKey to the user.

`POST /rooms/{roomId}/users`

**Request body:** `{ name: string }`

**Response body:**

```json
{
  userKey: string,
  username: string
}
```

## Vote

Update the vote for a user. userKey and size must be valid for the room.

`POST /rooms/{roomId}/votes`

**Request body:**

```json
{ userKey: string, size: string }
```

## Reveal cards

Set the room's `isRevealed` flag to true. When `isRevealed` is true, then "Get room" will include vote values for all users.

`PUT /rooms/{roomId}/isRevealed`

**Request body:** `{ hostKey: string, value: true }`

## Hide cards

Same endpoint as "Reveal cards", but set `value` to `false`. This operation will clear all current votes.

`PUT /rooms/{roomId}/isRevealed`

**Request body:** `{ hostKey: string, value: false }`

## Delete room

Deletes a room and all the users/votes associated with it.

`DELETE /rooms/{roomId}`

**Request body:** `{ hostKey: string }`

## Unimplemented endpoints

These endpoints are not implemented yet.

| Description  | Method    | URL                        | Request                                                        | Response    | Comment                                                       |
| ------------ | --------- | -------------------------- | -------------------------------------------------------------- | ----------- | ------------------------------------------------------------- |
| Update sizes | PUT       | `/rooms/{roomId}/sizes`    | `{ hostKey: string, validSizes: string[] }`                    | 200 SUCCESS |                                                               |
| Watch room   | SUBSCRIBE | `/rooms/{roomId}`          | `{ userKey: string }`                                          |             | (web socket updates on new votes, show/hide cards, and reset) |
| Delete user  | DELETE    | `/rooms/{roomId}/username` | `{userKey: string }` OR `{hostKey: string, username: string }` | 200 SUCCESS | no response body                                              |
