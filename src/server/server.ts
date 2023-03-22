import express, { Express } from "express";
import { handleErrorMiddleware } from "middlewares/error-handler.middleware";
import routes from "routes/v1";

export function setupServer(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/api/v1", routes);
  app.use(handleErrorMiddleware);

  return app;
}
