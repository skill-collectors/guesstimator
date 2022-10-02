---
layout: page
title: Why only one lambda function?
permalink: /context/infra/lambda-router
---

# Why only one lambda function?

We use a single lambda for all backend calls that routes to different handler functions. We do this because:

- Each endpoint doesn't have to cold start independently.
- It creates better separation between app logic and Pulumi logic.
- It creates better separation between REST logic (matching paths, managing headers) and implementation logic for the endpoint itself.
