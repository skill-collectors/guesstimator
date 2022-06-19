---
layout: page
title: Frontend deploy
permalink: /context/frontend/deploy
---

The frontend Svelte app is deployed as a static Single Page Application (SPA) in an S3 bucket behind a CloudFront distribution. This does not provide Server Side Rendering (SSR) like we would get with the [other supported SvelteKit adapters](https://kit.svelte.dev/docs/adapters).

We do this mostly because it's easier. AWS is not one of the officially supported adapters for SvelteKit. At the moment we are deferring any decisions about what adapter to use and whether to try finding or building an unofficial AWS adapter.

There are also open questions about the pros and cons of Server Side Rendering for an app like this. Some thoughts:

- A full deploy would likely improves Search Engine Optimization (SEO), but we're not really concerned with that.
- A full deploy may improve performance, or percieved performance, but this is something that requires more research.
- A full deploy would potentially allow an "endpoint" in the frontend to call the database directly, without needing a separate lambda/api gateway deploy. This could greatly simplify our app, but we would need to understand how to give the backend access especially if it's not deployed on AWS.
