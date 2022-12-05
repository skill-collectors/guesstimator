import { APIGatewayProxyEvent } from "aws-lambda";

/**
 * Assumes the body of the request is JSON, and returns the parsed result.
 *
 * If the event is base64 encoded, then it will be decoded before parsing.
 *
 * @param event The event to parse. Any event with 'body' and 'isBase64Encoded' fields.
 * @returns The parsed body, or 'null' if the body is null.
 */
export function parseBodyAsJson(event: {
  body?: string | null;
  isBase64Encoded: boolean;
}) {
  if (event.body === null || event.body === undefined) {
    return event.body;
  } else if (event.body.length === 0) {
    return null;
  } else if (event.isBase64Encoded) {
    return JSON.parse(Buffer.from(event.body, "base64").toString("utf-8"));
  } else {
    return JSON.parse(event.body);
  }
}

/**
 * Wraps an APIGatewayProxyEvent to provide utilities for validation and parsing the body as JSON.
 *
 * Example usage:
 *
 *   const req = new RequestWrapper(event);
 *   req.validate().hasField("value").hasLength("value", {max: 30});
 *   if(req.hasErrors){
 *     return clientError(req.clientError);
 *   }
 *   const body = req.parsedBody;
 */
export class RequestWrapper {
  event;
  parsedBody;
  bodyValidator;

  constructor(event: APIGatewayProxyEvent) {
    this.event = event;
    this.parsedBody = parseBodyAsJson(event);
    this.bodyValidator = new BodyValidator(this.parsedBody);
  }

  validate() {
    return this.bodyValidator;
  }

  get clientError() {
    return {
      message: "Request data is invalid",
      errors: this.bodyValidator.errors,
    };
  }

  get hasErrors() {
    return this.bodyValidator.errors.length > 0;
  }
}

interface ValidationError {
  prop: string;
  message: string;
}

class BodyValidator {
  body;
  errors: ValidationError[];

  constructor(body: Record<string, unknown>) {
    this.body = body;
    this.errors = [];
  }

  /**
   * Private utility method for tracking errors
   */
  _addError(prop: string, message: string) {
    this.errors.unshift({ prop, message });
  }

  /**
   * Adds an error if the event body doesn't contain a field with the given name.
   *
   * @param prop The prop to validate
   * @returns this (for chaining)
   */
  hasField(prop: string) {
    const value = this.body[prop];
    if (typeof value === "undefined" || value === null) {
      this._addError(prop, "Field is missing on the request body");
    }
    return this;
  }

  /**
   * Adds an error if the event body doesn't contain a field with the given name and type boolean.
   *
   * @param prop The prop to validate
   * @returns this (for chaining)
   */
  isBoolean(prop: string) {
    if (typeof this.body[prop] !== "boolean") {
      this._addError(prop, "Value must be a boolean (true or false)");
    }
    return this;
  }

  /**
   * Adds an error if the evnet body doesn't contain a field with the given name and value.
   *
   * This is meant to be used for hostKey and userKey fields. The response will not reveal the expected value.
   *
   * @param prop The prop to validate
   * @param expectedValue The value that the prop must be fully equal to
   * @returns this (for chaining)
   */
  hasSecretValue(prop: string, expectedValue: unknown) {
    if (this.body[prop] !== expectedValue) {
      this._addError(prop, "Invalid value");
    }
    return this;
  }

  /**
   * Adds an error if the event body doesn't contain a field with the given name, type string, and length within the bounds specified by params.
   *
   * @param prop The prop to validate
   * @param params Specify min/max length (both inclusive)
   * @returns this (for chaining)
   */
  hasLength(prop: string, { min = 0, max = 0 }) {
    if (typeof this.body[prop] !== "string") {
      this._addError(prop, "Value must be a string");
      return;
    }
    const value = this.body[prop] as string;
    if (value.length < min || value.length > max) {
      this._addError(prop, `Value must be >= ${min} and <= ${max}`);
    }
    return this;
  }
}
