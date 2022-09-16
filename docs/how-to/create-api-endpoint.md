---
layout: page
title: Create an API endpoint
permalink: /how-to/create-api-endpoint
---

# How to Create an API Endpoint

1. Create a function file in `infra/lib/lambda/`. Use `CreateRoom.ts` as an example/template.
   - **NOTE** These files don't export the lambda directly. They export a factory function that takes the table name and returns a handler.
2. Add an endpoint to the `Api` definition in `infra/index.ts`.
   - `name` should be unique and descriptive
   - `method` should be one of GET, POST, PUT, DELETE
   - `path` is the path you want to map your handler to
   - `policy` should be `tableAccessPolicy`
   - `handler` should be the your handler imported from `infra/lib/lambda/{your handler}`
3. Run `pulumi up` (via CLI for dev, or this will happen automatically for QA when you open a pull request).
4. Test your function at `https://agile-poker-api-{env}.superfun.link/{path}`.
   - `{env}` is one of `dev`, `qa`, or `prod`.
   - `{path}` is the value you specified in step #2 above.
5. Use `frontend/src/lib/services/rest.ts` to call your endpoint from within the frontend app.
