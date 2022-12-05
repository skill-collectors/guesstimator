---
layout: page
title: Create an API endpoint
permalink: /how-to/create-api-endpoint
---

# How to Create API Endpoints

## WebSockets

1. Add an action to the `switch` statement in `infra/lib/lambda/websockets/Main.ts`.
2. In most cases, you can defer to a simple operation in `infra/lib/lambda/DbService.ts`. If you have complex business logic, consider creating a new service in `infra/lib/lambda` as needed.
3. Add unit tests in `infra/tests/lib/lambda` to correspond to any added/updated code.
4. Use `GuesstimatorWebSocket` from `frontend/src/lib/services/websockets.ts` to send the new action from the frontend app.

## REST

1. Add a route in `infra/lib/lambda/rest/Router.ts. Use other cases as an example.
2. In most cases, you can defer to a simple operation in `infra/lib/lambda/DbService.ts`. If you have complex business logic, consider creating a new service in `infra/lib/lambda` as needed.
3. Add unit tests in `infra/tests/lib/lambda` to correspond to any added/updated code.
4. Run `deploy-local.sh`. Run `bootstrap.sh` first, if you haven't already, and ensure that the localstack docker container is running.
5. Get the API URL by running `pulumilocal stack output`.
   - If your router in `Router.ts` is `/foo/bar`, then the url will be something like `https://lczi8knisx.execute-api.us-east-1.amazonaws.com/stage/foo/bar`
6. Use `frontend/src/lib/services/rest.ts` to call your endpoint from within the frontend app.
