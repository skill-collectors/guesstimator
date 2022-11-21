import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/Api";
import { registerAutoTags } from "./lib/AutoTag";
import { subDomain, apiSubDomain, apexDomain } from "./lib/DomainName";
import { capitalize } from "./lib/utils/StringUtils";
import { buildCallbackFunction } from "./lib/Lambda";
import { createStaleRoomCleanupFunction } from "./lib/lambda/CleanupMain";

const project = pulumi.getProject();
const stack = pulumi.getStack();

const resourceNamePrefix = `${capitalize(project)}-${capitalize(stack)}`;

const isLocalDev = stack === "localstack";

registerAutoTags({ org: "tsc", iac: "pulumi", project, stack });

// In localdev, we can just run the app with Vite
const svelteApp = isLocalDev
  ? null
  : new SvelteApp(`${resourceNamePrefix}-App`, {
      subDomain,
      apexDomain,
    });

const database = new Database(`${resourceNamePrefix}-Database`);

const api = new Api(`${resourceNamePrefix}-Api`, {
  subDomain: apiSubDomain,
  apexDomain: isLocalDev ? null : apexDomain,
  database,
});

aws.cloudwatch.onSchedule(
  `${resourceNamePrefix}-CleanupEvent`,
  "rate(1 day)",
  buildCallbackFunction(
    `${resourceNamePrefix}-CleanupFunction`,
    database.table.arn,
    createStaleRoomCleanupFunction(database.table.name)
  )
);

// These are needed by deploy-dev.sh or GitHub actions
// (so they don't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
export const apiUrl = api.url;
export const apiKey = api.apiKey;

// These are just informational:
export const appOutput = {
  bucket: {
    arn: svelteApp?.siteBucket.arn,
    name: svelteApp?.siteBucket.id,
  },
  cdn: {
    arn: svelteApp?.cdn.arn,
    id: svelteApp?.cdn.id,
    domain: svelteApp?.cdn.domainName,
  },
};
export const dbOutput = {
  arn: database.table.arn,
  name: database.table.name,
};
