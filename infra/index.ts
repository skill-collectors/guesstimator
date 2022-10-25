import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/Api";
import { registerAutoTags } from "./lib/AutoTag";

const stack = pulumi.getStack();
const subDomain = stack === "prod" ? "guesstimator" : `guesstimator-${stack}`;
const apiSubDomain =
  stack === "prod" ? "guesstimator-api" : `guesstimator-api-${stack}`;
const apexDomain = "superfun.link";

const isLocalDev = stack === "localstack";

registerAutoTags({ org: "tsc", iac: "pulumi", project: "guesstimator", stack });

// In localdev, we can just run the app with Vite
const svelteApp = isLocalDev
  ? null
  : new SvelteApp(`Guesstimator-${stack}-App`, {
      subDomain,
      apexDomain,
    });

const database = new Database(`Guesstimator-${stack}-Database`);
const api = new Api(`Guesstimator-${stack}-Api`, {
  subDomain: apiSubDomain,
  apexDomain: isLocalDev ? null : apexDomain,
  database,
});

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
