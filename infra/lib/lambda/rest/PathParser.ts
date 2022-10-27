/**
 * This file is based on https://github.com/dstillman/pathparser.js
 *
 * It has been converted to modern TypeScript and simplified to just param parsing.
 *
 * The main reason for this mini-fork is that the package is not compatible with
 * ES6 modules.
 */
export class PathParser {
  parts;

  constructor(urlPattern: string) {
    this.parts = urlPattern.replace(/^\//, "").split("/");
  }

  match(url: string): Record<string, string> | null {
    if (url.length) {
      url = url
        // Remove redundant slashes
        .replace(/\/+/g, "/")
        // Strip leading and trailing '/' (at end or before query string)
        .replace(/^\/|\/($|\?)/, "")
        // Strip fragment identifiers
        .replace(/#.*$/, "");
    }

    const urlSplit = url.split("?", 2);
    const pathParts = urlSplit[0].split("/", 50);
    const queryParts = urlSplit[1] ? urlSplit[1].split("&", 50) : [];

    const params: Record<string, string> = {};
    const missingParams: Record<string, boolean> = {};

    // Don't match if fixed rule is longer than path
    if (this.parts.length < pathParts.length) return null;

    // Parse path components
    for (let i = 0; i < this.parts.length; i++) {
      const rulePart = this.parts[i];
      const part = pathParts[i];

      if (part !== undefined) {
        // Assign part to named parameter
        if (rulePart.charAt(0) == ":") {
          params[rulePart.substring(1)] = part;
          continue;
        }
        // If explicit parts differ, no match
        else if (rulePart !== part) {
          return null;
        }
      }
      // If no path part and not a named parameter, no match
      else if (rulePart.charAt(0) != ":") {
        return null;
      } else {
        missingParams[rulePart.substring(1)] = true;
      }
    }

    // Parse query strings
    for (let i = 0; i < queryParts.length; i++) {
      const nameValue = queryParts[i].split("=", 2);
      const key = nameValue[0];
      // But ignore empty parameters and don't override named parameters
      if (nameValue.length == 2 && !params[key] && !missingParams[key]) {
        params[key] = nameValue[1];
      }
    }

    return params;
  }
}
