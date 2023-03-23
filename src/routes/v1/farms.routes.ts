import { RequestHandler, Router } from "express";
import { FarmsController } from "../../modules/farms/farms.controller";
import { authenticateJWT } from "../../middlewares/authenticate-jwt.middleware";

const router = Router();
const farmsController = new FarmsController();

router.get("/", authenticateJWT, farmsController.findAll.bind(farmsController) as RequestHandler);
router.post("/", authenticateJWT, farmsController.create.bind(farmsController) as RequestHandler);
router.delete("/:id", authenticateJWT, farmsController.delete.bind(farmsController) as RequestHandler);

export default router;
