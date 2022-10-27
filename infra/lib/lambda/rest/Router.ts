import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import UrlPattern = require("url-pattern");
import DbService from "../DbService";
import { notFound, ok } from "./Response";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS" | "PATCH";
type RouteHandler = (
  params: Record<string, string>,
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;
export type LambdaHandler = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

class Route {
  method;
  urlPattern;
  handle;

  constructor(method: HttpMethod, urlPattern: string, handler: RouteHandler) {
    this.method = method;
    this.urlPattern = new UrlPattern(urlPattern);
    this.handle = handler;
  }

  match(event: APIGatewayProxyEvent) {
    if (event.httpMethod === this.method) {
      return this.urlPattern.match(event.path);
    }
    return null;
  }
}

class Router {
  routes: Route[];

  constructor() {
    this.routes = [];
  }

  get(path: string, handler: RouteHandler) {
    this.routes.push(new Route("GET", path, handler));
  }
  post(path: string, handler: RouteHandler) {
    this.routes.push(new Route("POST", path, handler));
  }
  put(path: string, handler: RouteHandler) {
    this.routes.push(new Route("PUT", path, handler));
  }
  del(path: string, handler: RouteHandler) {
    this.routes.push(new Route("DELETE", path, handler));
  }
  options(path: string, handler: RouteHandler) {
    this.routes.push(new Route("OPTIONS", path, handler));
  }
  patch(path: string, handler: RouteHandler) {
    this.routes.push(new Route("PATCH", path, handler));
  }
  async run(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    for (const route of this.routes) {
      const params = route.match(event);
      if (params !== null) {
        return route.handle(params, event);
      }
    }
    return notFound(`No route found for ${event.path}`);
  }
}

export function initRouter(tableName: string) {
  const db = new DbService(tableName);

  const router = new Router();

  router.get("/rooms/:id", async (params) => {
    const roomId = params.id;
    const room = await db.getRoom(roomId.toUpperCase());
    if (room === null) {
      return notFound(`No room with id ${roomId}`);
    } else {
      return ok(room);
    }
  });

  router.post("/rooms", async () => {
    const room = await db.createRoom();
    return ok(room);
  });

  router.del("/rooms/:id", async (params) => {
    const roomId = params.id;
    await db.deleteRoom(roomId.toUpperCase());
    return ok({ message: `Room ${roomId} was deleted.` });
  });

  return router;
}
