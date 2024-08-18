---

title: How to call the API
permalink: /how-to/call-the-api
---

# How to call the API from the frontend

## WebSockets

Use `GuesstimatorWebSocket` in `src/lib/services/websockets.ts` to send messages to the server. When you create a new `GuesstimatorWebSocket`, you need to provide the following callbacks:

- `onmessage`: Handle messages (including expected errors, when the service returns `{ status, error }`).
- `onerror`: Handle unexpected errors.
- `onopen`: Called when the connection is open and ready to be used. **Do not attempt to send any messages until this callback is called.**
- `onclose`: Called when the connection is closed. If this callback is called, do not attempt to send any more messages. If you did not expect the connection to be closed, then you can treat this as an error and inform the user of an unexpected situation.

`GuesstimatorWebSocket` is tailored for use on the `src/routes/rooms/[roomId]/+page.svelte` route. If needed, you could create another service for other purposes that uses the [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) differently.

## REST

REST calls to the API from a Svelte component should be performed using services in `src/lib/services` that group similar calls into a client-side SDK (`rooms.ts` is a good example). Those services should use `src/lib/services/rest.ts` to actually make the HTTP Request instead of using `fetch` directly.

Functions in `rest.ts` are `async` and should be called using the `async/await` syntax unless there is a compelling reason to deal with `Promises` directly.

Functions on `rest.ts` will throw the following errors on 4xx or 5xx response codes:

- **ApiOverloadedError**: If the server returns 429
- **ApiEndpointNotFoundError**: If the server returns 404
- **ApiErrorWithId**: If the server returns 500 with an 'errorId' on the response JSON.
- **ApiUnknownError**: If the server returns something unexpected.

These are caught and handled with generic error pages in `src/routes/+layout.svelte`, but you should consider whether your page should handle them directly. For example, `src/rooms/[roomId]/+page.svelte` intentionally handles `ApiEndpointNotFoundError` in order to explain that the room doesn't exist.

Putting it all together, here's an example:

```typescript
async function callApi(myParam: string) {
  try {
    rest.get(`/my/endpoint/${myParam}`);
  } catch (err) {
    if (err instanceof ApiEndpointNotFoundError) {
      // situation-specific handling of a 404
    }
  }
}
```

See the JSDoc in `rest.ts` for more details.
