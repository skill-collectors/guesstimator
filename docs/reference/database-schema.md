---
layout: page
title: Database schema
permalink: /reference/database-schema
---

# Database schema

We use DynamoDB, which is "schemaless" meaning the fields are not formally defined within the database itself. Nevertheless we obviously have a consistent format for our data, which is described below.

| PK            | SK             | fields                                                |
| ------------- | -------------- | ----------------------------------------------------- |
| ROOM:[roomId] | ROOM           | hostKey, validSizes, isRevealed, createdOn, updatedOn |
| ROOM:[roomId] | USER:[userKey] | userId, username, vote, createdOn, updatedOn          |

## Fields

| Name       | Description                                                                    |
| ---------- | ------------------------------------------------------------------------------ |
| roomId     | Randomly generated ID (public)                                                 |
| hostKey    | Randomly generated key (private, known only to the host)                       |
| validSizes | Space-delimited list of valid sizes e.g. `1 2 3`                               |
| isRevealed | `true` if users are allowed to see all votes                                   |
| createdOn  | The timestamp the item was created                                             |
| updatedOn  | The timestamp the item was last updated                                        |
| userKey    | Randomly generated key (known only to the given user)                          |
| userId     | An identifier for the user -- to disambiguate two users with the same username |
| username   | A display name to use.                                                         |
| vote       | The current vote for the user. One of `validSizes`                             |

## Operations

- **Create room** generates ID/hostKey and inserts `ROOM:[roomId]` with default sizes (`1 2 3 5 8 13 20 ? ∞`) and `isVoteRevealed=false`.
- **Update sizes** updates the value of `validSizes` for the given room key
- **Join room** Generates a `userKey` and creates a USER row with the given `userName`
- **Vote** Upserts VOTE for the given `userKey`
- **Reveal cards** Sets `isVoteRevealed` to `true` which allows users to see the value of `currentVote` for all users.
- **Reset** Sets `isVoteRevealed` to `false` and deletes all VOTES rows
- **Delete user** Deletes the USER item for the given `userKey`
- **Delete room** Deletes all rows with the `ROOM[roomId]` prefix
