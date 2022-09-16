---
layout: page
title: API Reference
permalink: /reference/api
---

# API Reference

This is just a simple outline of the proposed API. At the beginning of the project, it will describe what we want to build. When the project is finished it will describe what actually exists.

| Description  | Method    | URL                             | Request                                                        | Response                                                  | Comment                                                       |
| ------------ | --------- | ------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------- |
| Create room  | POST      | `/rooms/new`                    | `{ }`                                                          | `{ roomId: string, hostKey: string, validSizes: string }` |                                                               |
| Update sizes | PUT       | `/rooms/{roomId}/sizes`         | `{ hostKey: string }`                                          | 200 SUCCESS                                               | do we keep historical votes after "clearing"?                 |
| Join room    | POST      | `/rooms/{roomId}/join`          | `{ username: string }`                                         | `{ userKey: string, username: string }`                   | (Username must not already exist in room)                     |
| Watch room   | SUBSCRIBE | `/rooms/{roomId}`               | `{ userKey: string }`                                          |                                                           | (web socket updates on new votes, show/hide cards, and reset) |
| Vote         | POST      | `/rooms/{roomId}/{userId}/vote` | `{ userKey: string, size: string }`                            | 201 CREATED                                               | (size must be valid for room, else 4xx)                       |
| Reveal cards | POST      | `/rooms/{roomId}/showCards`     | `{ hostKey: string, showCards: boolean }`                      | 200 SUCCESS                                               | no response body                                              |
| Reset        | POST      | `/rooms/{roomId}/reset`         | `{ hostKey: string }`                                          | 200 SUCCESS                                               |                                                               |
| Delete user  | DELETE    | `/rooms/{roomId}/username`      | `{userKey: string }` OR `{hostKey: string, username: string }` | 200 SUCCESS                                               | no response body                                              |
| Delete room  | DELETE    | `/rooms/{roomId}`               | `{ hostKey: string }`                                          | 200 SUCCESS                                               | no response body                                              |
