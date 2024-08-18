---

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
- **Subscribe** Creates a `USER:[userKey]` item by generating a `userKey` and `userId` for the user and stores them with the `connectionId` from the caller.
- **Join room** Sets the `username` on the user with the given `userKey`.
- **Leave room** Clears the `username` on the user with the given `userKey`.
- **Set valid sizes** updates the value of `validSizes` for the given room key
- **Reconnect** Resets the `connectionId` for the user with the given `userKey`. Also clears the username and vote.
- **Kick user** Clears the `username`, `vote`, and `connectionId` for the user with the given `userKey`.
- **Set cards revealed** Sets `isVoteRevealed` to a given (boolean) value which shows or hides the value of `vote` for all users.
- **Vote** Sets the `vote` for the user with the given `userKey`
- **Reset** Sets `isVoteRevealed` to `false` and deletes all VOTES rows
- **Delete user** Deletes the USER item for the given `userKey`
- **Delete room** Deletes all rows with the `ROOM[roomId]` prefix
