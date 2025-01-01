import * as rest from '../../../../src/lib/services/rest';
import { describe, it, vi, afterEach, expect } from 'vitest';

describe('rest', () => {
	const baseUrl = 'https://api.example.com';
	const apiKey = 'sUp3r_s3cr3t!';
	import.meta.env.VITE_PUBLIC_API_URL = baseUrl;
	import.meta.env.VITE_PUBLIC_API_KEY = apiKey;

	const mockFetch = vi.fn();
	vi.stubGlobal('fetch', mockFetch);

	function mockPromise(result: unknown) {
		return new Promise((resolve) => resolve(result));
	}

	function mockResponse(status: number, body: string | object) {
		let ok = true;
		if (status > 400) {
			ok = false;
		}
		if (typeof body === 'string') {
			body = { message: body };
		}
		return mockPromise({
			ok,
			status,
			json: vi.fn().mockImplementation(() => mockPromise(body)),
			text: vi.fn().mockImplementation(() => mockPromise(JSON.stringify(body))),
		});
	}

	afterEach(() => {
		vi.resetAllMocks();
	});

	describe('general behavior', () => {
		it('Prepends the base path', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.get(path);

			// Then
			expect(mockFetch.mock.calls[0][0]).toBe(`${baseUrl}${path}`);
		});
		it('Includes the API key', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.get(path);

			// Then
			expect((mockFetch.mock.calls[0][1].headers as Headers).has('x-api-key')).toBe(true);
		});
		it('Uses CORS mode', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.get(path);

			// Then
			expect(mockFetch.mock.calls[0][1].mode).toBe('cors');
		});
	});

	describe('error handling', () => {
		it('throws ApiOverloadedError for 429', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(429, 'Overloaded!'));

			const path = '/foo';

			// When
			try {
				await rest.get(path);
			} catch (err) {
				// Then
				expect(err).toBeInstanceOf(rest.ApiOverloadedError);
			}
		});
		it('throws ApiEndpointNotFoundError for 404', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(404, 'Not found!'));

			const path = '/foo';

			// When
			try {
				await rest.get(path);
			} catch (err) {
				// Then
				expect(err).toBeInstanceOf(rest.ApiEndpointNotFoundError);
			}
		});
		it('throws ApiErrorWithId for 500 if errorId is included in the response', async () => {
			// Given
			mockFetch.mockImplementationOnce(() =>
				mockResponse(500, {
					errorId: 'ABCD1234',
					timestamp: new Date().toISOString(),
				}),
			);

			const path = '/foo';

			// When
			try {
				await rest.get(path);
			} catch (err) {
				// Then
				expect(err).toBeInstanceOf(rest.ApiErrorWithId);
				expect((err as rest.ApiErrorWithId).errorId).toBe('ABCD1234');
			}
		});
		it('throws ApiUnknownError for 500 if errorId is NOT included in the response', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(500, 'No error ID!'));

			const path = '/foo';

			// When
			try {
				await rest.get(path);
			} catch (err) {
				// Then
				expect(err).toBeInstanceOf(rest.ApiUnknownError);
			}
		});
	});

	describe('get', () => {
		it('Calls fetch() with GET method', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.get(path);

			// Then
			expect(mockFetch.mock.calls[0][1].method).toBe('GET');
		});
	});
	describe('post', () => {
		it('Calls fetch() with POST method', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.post(path);

			// Then
			expect(mockFetch.mock.calls[0][1].method).toBe('POST');
		});
	});
	describe('del', () => {
		it('Calls fetch() with DELETE method', async () => {
			// Given
			mockFetch.mockImplementationOnce(() => mockResponse(200, 'ok'));

			const path = '/foo';

			// When
			await rest.del(path);

			// Then
			expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
		});
	});
});
