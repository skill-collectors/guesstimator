import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as apigateway from "@pulumi/aws-apigateway";

interface ApiArgs {
  tags: { [key: string]: string };
}

export default class Api extends pulumi.ComponentResource {
  url;

  constructor(
    name: string,
    args: ApiArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("pkg:index:Api", name, args, opts);

    const tags = args.tags;

    const helloHandler = new aws.lambda.CallbackFunction("hello-handler", {
      callback: async (ev, ctx) => {
        return {
          statusCode: 200,
          body: "Hello, API Gateway!",
        };
      },
      tags,
    });

    const api = new apigateway.RestAPI("api", {
      routes: [
        {
          path: "/",
          method: "GET",
          eventHandler: helloHandler,
        },
      ],
    });

    this.registerOutputs({
      url: api.url,
    });

    // locally this is https://<apiId>.execute-api.localhost.localstack.cloud:4566/stage/
    this.url = api.url;
  }
}
