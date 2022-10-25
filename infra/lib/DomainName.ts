import * as pulumi from "@pulumi/pulumi";

const stack = pulumi.getStack();

export const subDomain =
  stack === "prod" ? "guesstimator" : `guesstimator-${stack}`;

export const apiSubDomain =
  stack === "prod" ? "guesstimator-api" : `guesstimator-api-${stack}`;

export const apexDomain = "superfun.link";
