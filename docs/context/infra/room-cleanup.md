---

title: Room cleanup
permalink: /context/infra/room-cleanup
---

# Room cleanup process

Rooms in the app are meant to be re-usable. If a user creates a room and shares the URL with a number of users, then they can expect to be able to bookmark and keep using that room URL on a different day. However, many rooms will be abandoned for various reasons and we don't want to waste storage space on rooms that will never be used again.

To prevent the database from growing forever, we have a lambda (`CleanupMain.ts`) that runs once per day to delete any rooms **older than one month**.

"Stale" rooms are identified by their `updatedOn` field, which is updated whenever cards are hidden or revealed.
