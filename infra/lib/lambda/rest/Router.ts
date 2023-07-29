/**
 * This file encapsulates all the routing logic for the API. Note that path/url
 * parameter parsing is handled by PathParser.
 */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DbService } from "../DbService";
import { PathParser } from "./PathParser";
import { RequestWrapper } from "./RequestWrapper";
import { notFound, ok, clientError } from "./Response";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
type RouteHandler = (
  params: Record<string, string>,
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;
export type LambdaHandler = (
  event: APIGatewayProxyEvent,
) => Promise<APIGatewayProxyResult>;

/** Represents a single route in the API including the method (e.g. "GET" or "POST") */
class Route {
  method;
  urlPattern;
  handle;

  /**
   * Creates a Route
   * @param {HttpMethod} method - "GET", "POST", "DELETE", etc.
   * @param {string} urlPattern - Pattern for PathParser e.g. "/rooms/:roomId"
   * @param {RouteHandler} A handler that should be executed for requests matching this route.
   */
  constructor(method: HttpMethod, urlPattern: string, handler: RouteHandler) {
    this.method = method;
    this.urlPattern = new PathParser(urlPattern);
    this.handle = handler;
  }

  /**
   * Tests whether the given event matches this route and parses url params if so.
   *
   * @param {APIGatewayProxyEvent} event - The event to match
   * @returns An object of matching params (e.g. {roomId: 123} for /rooms/123
   * matching /rooms/:roomId). For static paths (with no placeholders) this
   * will return an empty object. Returns null if the event doesn't match this
   * route.
   */
  match(event: APIGatewayProxyEvent) {
    if (event.httpMethod === this.method) {
      return this.urlPattern.match(event.path);
    }
    return null;
  }
}

/**
 * Stores routes for the API and find matching routes for an event.
 */
class Router {
  routes: Route[];

  constructor() {
    this.routes = [];
  }

  /**
   * Adds a GET route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  get(path: string, handler: RouteHandler) {
    this.routes.push(new Route("GET", path, handler));
  }

  /**
   * Adds a POST route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  post(path: string, handler: RouteHandler) {
    this.routes.push(new Route("POST", path, handler));
  }

  /**
   * Adds a PUT route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  put(path: string, handler: RouteHandler) {
    this.routes.push(new Route("PUT", path, handler));
  }

  /**
   * Adds a DELETE route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  del(path: string, handler: RouteHandler) {
    this.routes.push(new Route("DELETE", path, handler));
  }

  /**
   * Adds an OPTIONS route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  options(path: string, handler: RouteHandler) {
    this.routes.push(new Route("OPTIONS", path, handler));
  }

  /**
   * Adds a PATCH route to the API
   *
   * @param {string} path - The path for this route (see PathParser for pattern syntax)
   * @param {RouteHandler} handler - The function to handle requests matching this route.
   */
  patch(path: string, handler: RouteHandler) {
    this.routes.push(new Route("PATCH", path, handler));
  }

  /**
   * Finds a route to match the given event and execute its handler.
   *
   * @param {APIGatewayProxyEvent} event - The event to match/execute
   * @return {Promise<APIGatewayProxyResult>} The result of the matching handler, or a 404 if no route matches.
   */
  async run(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log(`Routing: ${event.httpMethod} ${event.path}`);
    for (const route of this.routes) {
      const params = route.match(event);
      if (params !== null) {
        return route.handle(params, event);
      }
    }
    return notFound(`No route found for ${event.path}`);
  }
}

/**
 * Create the router for this API.
 */
export function initRouter(tableName: string) {
  const db = new DbService(tableName);

  const router = new Router();

  router.get("/status", async () => {
    return ok({ status: "UP" });
  });

  router.post("/rooms", async () => {
    const room = await db.createRoom();
    return ok(room);
  });

  router.del("/rooms/:id", async (params, event) => {
    const roomId = params.id;
    const room = await db.getRoomMetadata(roomId.toUpperCase());
    if (!room) {
      return notFound(`No room with ID ${roomId}`);
    }

    const req = new RequestWrapper(event);
    req.validate().hasSecretValue("hostKey", room.hostKey);
    if (req.hasErrors) {
      return clientError(req.clientError);
    }
    await db.deleteRoom(roomId.toUpperCase());
    return ok(`Room ${roomId} was deleted.`);
  });

  return router;
}
