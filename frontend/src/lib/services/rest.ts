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

async function handleFailure(path: string, response: Response) {
  if (!response.ok) {
    if (response.status === 429) {
      console.log("Server is overloaded!");
      throw new Error("Server is overloaded!");
    } else {
      throw new Error(
        `${path} => ${response.status} (${
          response.statusText
        }): ${await response.text()}`
      );
    }
  }
}

export async function get(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: headers(),
      method: "GET",
      mode: "cors",
    });
    await handleFailure(path, response);
    const json = await response.json();
    return json;
  } catch (err) {
    // This happens when the API Gateway responds with 429 status, but WITHOUT
    // the CORS headers. In that case we can't see the response (including the
    // 429 status). It's unknown if this happens in other situations.
    // This is an opportunity to improve the code so we don't need this catch.
    console.log(err);
    throw err;
  }
}

export async function post(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: headers(),
      method: "POST",
      mode: "cors",
    });
    await handleFailure(path, response);
    return response.json();
  } catch (err) {
    // This happens when the API Gateway responds with 429 status, but WITHOUT
    // the CORS headers. In that case we can't see the response (including the
    // 429 status). It's unknown if this happens in other situations.
    // This is an opportunity to improve the code so we don't need this catch.
    console.log(err);
    throw err;
  }
}

export async function del(path: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: headers(),
      method: "DELETE",
      mode: "cors",
    });
    await handleFailure(path, response);
    return response.json();
  } catch (err) {
    // This happens when the API Gateway responds with 429 status, but WITHOUT
    // the CORS headers. In that case we can't see the response (including the
    // 429 status). It's unknown if this happens in other situations.
    // This is an opportunity to improve the code so we don't need this catch.
    console.log(err);
    throw err;
  }
}
