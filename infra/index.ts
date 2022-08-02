import SvelteApp from "./lib/SvelteApp";
import Database from "./lib/Database";
import * as pulumi from "@pulumi/pulumi";
import Api from "./lib/Api";
import dynamoTableAccessPolicy from "./lib/policies/DynamoTableAccessPolicy";
import helloHandler from "./lib/lambda/hello";

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
const tableAccessPolicy = database.table.arn.apply((arn) =>
  dynamoTableAccessPolicy(arn, tags)
);
const api = new Api("agile-poker-api", {
  endpoints: [
    {
      name: "hello-handler",
      method: "GET",
      path: "/hello",
      policy: tableAccessPolicy,
      handler: helloHandler(database.table.name),
    },
  ],
  tags,
});

export const apiUrl = api.url;
// These are needed by deploy-dev.sh (so it doesn't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
// These are needed for testing
export const bucket = svelteApp?.siteBucket;
export const cdn = svelteApp?.cdn;
export const dbTable = database.table;
