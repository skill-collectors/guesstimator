import * as pulumi from "@pulumi/pulumi";
import DbService from "./DbService";

export function createStaleRoomCleanupFunction(
  tableNameOutput: pulumi.Output<string>
) {
  return async function () {
    const tableName = tableNameOutput.get();
    console.log(`Cleaning up stale rooms in ${tableName}`);
    const db = new DbService(tableName);
    const count = await db.deleteStaleRooms();
    console.log(`Cleanup complete. Removed ${count} stale rooms`);
  };
}
