/**
 * This utility:
 * - applies the baseUrl
 * - always uses CORS
 * - assumes JSON responses.
 * - throws errors if the response is not ok
 */

const baseUrl = import.meta.env.VITE_PUBLIC_API_URL;
const apiKey = import.meta.env.VITE_PUBLIC_API_KEY;

function headers() {
  const baseHeaders = new Headers();
  baseHeaders.append("x-api-key", apiKey);
  return baseHeaders;
}

function handleFailure(path: string, response: Response) {
  if (!response.ok) {
    if (response.status === 429) {
      window.location.href = "/overload";
    } else {
      throw new Error(
        `${path} => ${response.status} (${response.statusText}): ${response.body}`
      );
    }
  }
}

export async function post(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: headers(),
    method: "POST",
    mode: "cors",
  });
  handleFailure(path, response);
  return response.json();
}
