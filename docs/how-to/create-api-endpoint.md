---
layout: page
title: Create an API endpoint
permalink: /how-to/create-api-endpoint
---

# How to Create an API Endpoint

1. Add a matching if/else block to `infra/lib/lambda/Router.ts`. Use other cases as an example.
2. In most cases, you can defer to a simple operation in `infra/lib/lambda/DbService.ts`. If you have complex business logic, consider creating a new service in `infra/lib/lambda` as needed.
3. Add unit tests in `infra/tests/lib/lambda` to correspond to any added/updated code.
4. Run `pulumi up` (via CLI for dev, or this will happen automatically for QA when you open a pull request).
5. Test your function at `https://agile-poker-api-{env}.superfun.link/{path}`.
   - `{env}` is one of `dev`, `qa`, or `prod`.
   - `{path}` is the value you specified in step #2 above.
6. Use `frontend/src/lib/services/rest.ts` to call your endpoint from within the frontend app.
