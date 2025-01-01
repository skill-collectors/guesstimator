/**
 * This utility:
 * - applies the baseUrl
 * - always uses CORS
 * - assumes JSON responses.
 * - includes the apiKey in all calls if present
 * - throws errors if the response is 4xx or 5xx
 */

/**
 * Performs a GET request for the given path.
 * @param path The path, not including the API baseUrl, e.g. "/rooms".
 * @param options Any additional options to pass to fetch().
 * @param headers Any headers to include in the request. 'x-api-key' is always included and need not be passed to this method.
 * @returns The result of the fetch().
 * @throws {ApiOverloadedError} If the server returns 429
 * @throws {ApiEndpointNotFoundError} If the server returns 404
 * @throws {ApiErrorWithId} If the server returns 500 with an 'errorId' on the response JSON.
 * @throws {ApiUnknownError} If the server returns something unexpected.
 */
export async function get(path: string, options: RequestInit = {}, headers = new Headers()) {
	const body = null; // GET requests can't contain a body.
	return doFetch('GET', path, body, options, headers);
}

/**
 * Performs a POST request for the given path.
 * @param path The path, not including the API baseUrl, e.g. "/rooms".
 * @param body The body of the request as an object (will be serialized as JSON)
 * @param options Any additional options to pass to fetch().
 * @param headers Any headers to include in the request. 'x-api-key' is always included and need not be passed to this method.
 * @returns The result of the fetch().
 * @throws {ApiOverloadedError} If the server returns 429
 * @throws {ApiEndpointNotFoundError} If the server returns 404
 * @throws {ApiErrorWithId} If the server returns 500 with an 'errorId' on the response JSON.
 * @throws {ApiUnknownError} If the server returns something unexpected.
 */
export async function post(path: string, body: object = {}, options: RequestInit = {}, headers = new Headers()) {
	return doFetch('POST', path, body, options, headers);
}

/**
 * Performs a PUT request for the given path.
 * @param path The path, not including the API baseUrl, e.g. "/rooms".
 * @param body The body of the request as an object (will be serialized as JSON)
 * @param options Any additional options to pass to fetch().
 * @param headers Any headers to include in the request. 'x-api-key' is always included and need not be passed to this method.
 * @returns The result of the fetch().
 * @throws {ApiOverloadedError} If the server returns 429
 * @throws {ApiEndpointNotFoundError} If the server returns 404
 * @throws {ApiErrorWithId} If the server returns 500 with an 'errorId' on the response JSON.
 * @throws {ApiUnknownError} If the server returns something unexpected.
 */
export async function put(path: string, body: object = {}, options: RequestInit = {}, headers = new Headers()) {
	return doFetch('PUT', path, body, options, headers);
}

/**
 * Performs a DELETE request for the given path.
 * @param path The path, not including the API baseUrl, e.g. "/rooms".
 * @param body The body of the request as an object (will be serialized as JSON)
 * @param options Any additional options to pass to fetch().
 * @param headers Any headers to include in the request. 'x-api-key' is always included and need not be passed to this method.
 * @returns The result of the fetch().
 * @throws {ApiOverloadedError} If the server returns 429
 * @throws {ApiEndpointNotFoundError} If the server returns 404
 * @throws {ApiErrorWithId} If the server returns 500 with an 'errorId' on the response JSON.
 * @throws {ApiUnknownError} If the server returns something unexpected.
 */
export async function del(path: string, body: object = {}, options: RequestInit = {}, headers = new Headers()) {
	return doFetch('DELETE', path, body, options, headers);
}

/**
 * Wraps fetch() with the assumptions described in the jsdoc at the top of this file.
 *
 * @param method The request method, e.g. "GET" or "POST".
 * @param path The path of the request, not including the baseUrl prefix.
 * @param body The body of the request as an object (will be serialized as JSON)
 * @param options Additional options to pass to fetch()
 * @param headers Any headers to add to the request. This method automatically includes the correct 'x-api-key'.
 * @returns The result of the fetch call.
 */
async function doFetch(method: string, path: string, body: object | null, options: RequestInit, headers: Headers) {
	const baseUrl = import.meta.env.VITE_PUBLIC_API_URL;
	const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;

	headers.append('x-api-key', apiKey);
	const response = await fetch(`${baseUrl}${path}`, {
		...options,
		headers,
		body: body === null ? null : JSON.stringify(body),
		method,
		mode: 'cors',
	});
	await throwIfNotOk(method, path, response);
	const json = await response.json();
	return json;
}

/**
 * If the given response is not "OK" (status is not 2xx), then this method
 * throws an appropriate Error.
 *
 * If the given response is ok, then this function does nothing.
 *
 * @param method The method that was called, e.g. "GET" or "POST".
 * @param path The path requested from the server.
 * @param response The response received from "fetch".
 * @throws {ApiOverloadedError} If the server returns 429
 * @throws {ApiEndpointNotFoundError} If the server returns 404
 * @throws {ApiErrorWithId} If the server returns 500 with an 'errorId' on the response JSON.
 * @throws {ApiUnknownError} If the server returns something unexpected.
 */
async function throwIfNotOk(method: string, path: string, response: Response) {
	if (!response.ok) {
		if (response.status === 429) {
			throw new ApiOverloadedError();
		} else if (response.status === 404) {
			throw new ApiEndpointNotFoundError(method, path, await response.text());
		} else {
			let json;
			try {
				json = await response.json();
			} catch {
				// In case of errors parsing JSON on the response
				throw new ApiUnknownError(method, path, await response.text());
			}
			if ('errorId' in json) {
				const { errorId, timestamp } = json;
				throw new ApiErrorWithId(method, path, errorId, timestamp);
			}
		}
		throw new ApiUnknownError(method, path, await response.text());
	}
}

/* ******************************************************************
 * The following classes exist so that frontend code can use 'typeof'
 * expressions to determine what went wrong.
 * ******************************************************************/

/**
 * Thrown if the gateway response with 429 because the usage plan was exceeded.
 */
export class ApiOverloadedError extends Error {
	constructor() {
		super('The API rate limit is exceeded or the quota has been reached.');

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown if the gateway response with 404. This would happen if the user does
 * something like request a room that no longer exists.
 */
export class ApiEndpointNotFoundError extends Error {
	constructor(method: string, path: string, responseText: string) {
		super(`${method} ${path} => 404 (NOT FOUND): ${responseText}`);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown if the server responds with a 500 and includes an 'errorId'. The
 * errorId and timestamp should be given to the user so they can include it if
 * they create an issue in GitHub.
 */
export class ApiErrorWithId extends Error {
	errorId;
	timestamp;

	constructor(method: string, path: string, errorId: string, timestamp: string) {
		super(`${timestamp}: ${method} ${path} => 500 (Internal Server Error): ${errorId}`);
		this.errorId = errorId;
		this.timestamp = timestamp;

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Thrown if we get something other than the other defined error types. This
 * should never happen normally and probably represents a programming error.
 */
export class ApiUnknownError extends Error {
	constructor(method: string, path: string, responseText: string) {
		super(`${method} ${path} => 500 (Internal Server Error): ${responseText}`);

		// Set the prototype explicitly.
		Object.setPrototypeOf(this, new.target.prototype);
	}
}
