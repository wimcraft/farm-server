import { Router } from "express";
import auth from "./auth.routes";
import user from "./user.routes";
import farms from "./farms.routes";

const routes = Router();

routes.use("/auth", auth);
routes.use("/users", user);
routes.use("/farms", farms)

export default routes;
