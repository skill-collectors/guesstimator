import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/RestApi";
import { registerAutoTags } from "./lib/AutoTag";
import { subDomain, apexDomain } from "./lib/DomainName";
import { capitalize } from "./lib/utils/StringUtils";
import { buildCallbackFunction } from "./lib/Lambda";
import { createStaleRoomCleanupFunction } from "./lib/lambda/CleanupMain";
import WebSocketApi from "./lib/WebSocketApi";
import lambdaPolicy from "./lib/policies/LambdaPolicy";

const project = pulumi.getProject();
const stack = pulumi.getStack();

const resourceNamePrefix = `${capitalize(project)}-${capitalize(stack)}`;

registerAutoTags({ org: "tsc", iac: "pulumi", project, stack });

// In localdev, we can just run the app with Vite
const svelteApp = new SvelteApp(`${resourceNamePrefix}-App`, {
  subDomain,
  apexDomain,
});

const database = new Database(`${resourceNamePrefix}-Database`);

const restApi = new Api(`${resourceNamePrefix}-RestApi`, {
  database,
});

const webSocketApi = new WebSocketApi(`${resourceNamePrefix}-WebSocketApi`, {
  database,
});

const cleanUpLambdaPolicy = database.table.arn.apply((tableArn) =>
  lambdaPolicy(`${resourceNamePrefix}-CleanupLambdaPolicy`, tableArn)
);
aws.cloudwatch.onSchedule(
  `${resourceNamePrefix}-CleanupEvent`,
  "rate(1 day)",
  buildCallbackFunction(
    `${resourceNamePrefix}-CleanupFunction`,
    createStaleRoomCleanupFunction(database.table.name),
    cleanUpLambdaPolicy
  )
);

// These are needed by deploy-dev.sh or GitHub actions
// (so they don't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
export const apiUrl = restApi.url;
export const apiKey = restApi.apiKey;
export const webSocketUrl = webSocketApi.invokeUrl;

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
