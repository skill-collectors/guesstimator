/**
 * This utility:
 * - applies the baseUrl
 * - always uses CORS
 * - assumes JSON responses.
 * - throws errors if the response is not ok
 */

const baseUrl = "https://agile-poker-api-dev.superfun.link";
const apiKey = "25ZGtwoMAa3zr8jGGPZna8oyuIWQItjn5nYVARBG";

function headers() {
  const baseHeaders = new Headers();
  baseHeaders.append("x-api-key", apiKey);
  return baseHeaders;
}

export async function post(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: headers(),
    method: "POST",
    mode: "cors",
  });
  if (response.ok) {
    return response.json();
  } else {
    throw new Error(
      `${path} => ${response.status} (${response.statusText}): ${response.body}`
    );
  }
}
