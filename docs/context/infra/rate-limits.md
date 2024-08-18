---

title: API Rate Limiting
permalink: /context/infra/rate-limits
---

The API Gateway (defined in `infra/lib/Api.ts`) is rate limited via a [_Usage Plan_ and _API Key_](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html). This is to prevent abusive behavior and runaway costs. The limits are set much higher than we expect this app to ever need with just "friends and family" using it.

## Security

The API key is _not_ a secret. It's a global key for all users that is meant to enforce global rate limits. It's embedded in the client app where any user could extract it, so someone could use it in an alternate frontend, which actually sounds pretty cool (although we don't guarantee the key won't change, so that wouldn't be a stable implementation).

## Alternatives

Amazon's [documentation says](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-api-usage-plans.html#apigateway-usage-plans-best-practices) not to rely on usage plans for cost control, but the alternative is a WAF, which is more expensive than the entire app.

The problem is that rate limits are enforced on a "best effort" basis, but that should be good enough. The production account also has budget alerts configured, so we will be notified if things go haywire. The hope is that the rate limit will keep it under control until we can perform some manual intervention.
