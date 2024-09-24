import * as pulumi from "@pulumi/pulumi";
import { DbService } from "./DbService";

export function createStaleRoomCleanupFunction(
  tableNameOutput: pulumi.Output<string>,
) {
  return async function () {
    const tableName = tableNameOutput.get();
    const db = new DbService(tableName);

    console.log(`Cleaning up stale rooms in ${tableName}`);
    const roomCount = await db.deleteStaleRooms();
    console.log(`Removed ${roomCount} stale rooms`);

    console.log(`Cleaning up stale users in ${tableName}`);
    const userCount = await db.deleteStaleUsers();
    console.log(`Removed ${userCount} stale users`);

    console.log(`Resetting inactive rooms in ${tableName}`);
    const resetCount = await db.resetInactiveRooms();
    console.log(`Reset ${resetCount} inactive rooms`);

    console.log("Cleanup complete!");
  };
}
