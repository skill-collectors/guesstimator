import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/Api";

const stack = pulumi.getStack();
const subDomain = stack === "prod" ? "agile-poker" : `agile-poker-${stack}`;
const apexDomain = "superfun.link";
const tags = { iac: "pulumi", project: "agile-poker", stack };

const isLocalDev = stack === "localstack";

// In localdev, we can just run the app with Vite
const svelteApp = isLocalDev
  ? null
  : new SvelteApp("agile-poker-app", {
      subDomain,
      apexDomain,
      tags,
    });

const database = new Database("agile-poker-db", { tags });
const api = new Api("agile-poker-api", {
  endpoints: [{ routeKey: "GET /hello", localPath: "./lambda/hello" }],
  tags,
});

// These are needed by deploy-dev.sh (so it doesn't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
// These are needed for testing
export const bucket = svelteApp?.siteBucket;
export const cdn = svelteApp?.cdn;
export const dbTable = database.table;
export const apigw = api.apigw;
