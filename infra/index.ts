import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/Api";

const stack = pulumi.getStack();
const subDomain = stack === "prod" ? "agile-poker" : `agile-poker-${stack}`;
const apiSubDomain =
  stack === "prod" ? "agile-poker-api" : `agile-poker-api-${stack}`;
const apexDomain = "superfun.link";
const tags = { iac: "pulumi", project: "agile-poker", stack };

const isLocalDev = stack === "localstack";

// In localdev, we can just run the app with Vite
const svelteApp = isLocalDev
  ? null
  : new SvelteApp(`AgilePoker-${stack}-App`, {
      subDomain,
      apexDomain,
      tags,
    });

const database = new Database(`AgilePoker-${stack}-Database`, { tags });
const api = new Api(`AgilePoker-${stack}-Api`, {
  subDomain: apiSubDomain,
  apexDomain: apexDomain,
  database,
  tags,
});

// These are needed by deploy-dev.sh (so it doesn't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
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
export const apiOutput = {
  url: api.url,
};
export const dbOutput = {
  arn: database.table.arn,
  name: database.table.name,
};
