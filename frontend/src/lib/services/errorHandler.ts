import { ApiEndpointNotFoundError, ApiErrorWithId, ApiOverloadedError, ApiUnknownError } from '$lib/services/rest';

export function redirectToErrorPage(err: unknown) {
	console.log(err);
	// These are errors thrown by src/lib/services/rest.ts
	if (err instanceof ApiEndpointNotFoundError) {
		// Invalid routes in the frontend render src/routes/+error.svelte instead.
		window.location.href = '/errors/notfound';
	} else if (err instanceof ApiOverloadedError) {
		// UsagePlan is exhausted
		window.location.href = '/errors/overload';
	} else if (err instanceof ApiErrorWithId) {
		// Error caught and logged in infra/lib/lambda/rest/Main.ts
		const apiErrorWithId = err as ApiErrorWithId;
		window.location.href = `/errors/server?timestamp=${apiErrorWithId.timestamp}&errorId=${apiErrorWithId.errorId}`;
	} else if (err instanceof ApiUnknownError) {
		window.location.href = '/errors/server';
	} else {
		window.location.href = '/errors/client';
	}
}
