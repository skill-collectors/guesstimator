import SvelteApp from "./lib/SvelteApp";
import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();
const subDomain = stack === "prod" ? "agile-poker" : `agile-poker-${stack}`;
const apexDomain = "superfun.link";
const tags = { iac: "pulumi", project: "agile-poker", stack };

const isLocalDev = stack === "localdev";

// In localdev, we can just run the app with Vite
const svelteApp = isLocalDev
  ? null
  : new SvelteApp("agile-poker-app", {
      subDomain,
      apexDomain,
      tags,
    });

// These are needed by deploy-dev.sh (so it doesn't have to parse json and require something like 'jq')
export const bucketName = svelteApp?.siteBucket.id;
export const distributionId = svelteApp?.cdn.id;
// These are needed for testing
export const bucket = svelteApp?.siteBucket;
export const cdn = svelteApp?.cdn;
