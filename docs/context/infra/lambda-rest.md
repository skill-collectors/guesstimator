---

title: Lambda REST architecture
permalink: /context/infra/lambda-rest
---

# Lambda REST architecture

The entire REST API is run by a single Lambda Function which parses the path and delegates to different handler functions. We do this because:

- Each endpoint doesn't have to cold start independently.
- It creates better separation between app logic and Pulumi logic.
- It creates better separation between REST logic (matching paths, managing headers) and implementation logic for the endpoint itself.
- It makes it easier to abstract "middleware" features like CORS

To learn more, take a look at the following code in the `/infra/lib/lambda/rest` directory:

- `Main.ts` - This is the main lambda function and the entrypoint for all REST requests.
- `Router.ts` - This file contains all the routing logic. Routes are defined at the bottom in the `initRouter` function.
- `CorsRules.ts` - Provides a `corsRules` factory function for defining and applying CORS rules (allowed origins, etc.).
- `PathParser.ts` - Matches paths (like `/foo/123/bar/abc`) to path patterns (like `/foo/:foo/bar/:bar` while extracting placeholder values into a result object (like `{foo: '123', bar: 'abc'}`).

