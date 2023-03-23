import { JwtPayload, verify } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import config from "../config/config";
import dataSource from "../orm/orm.config";
import { AccessToken } from "../modules/auth/entities/access-token.entity";

const accessTokenRepository = dataSource.getRepository(AccessToken);

export async function authenticateJWT(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1];

        let decoded: JwtPayload;
        try {
            decoded = verify(token, config.JWT_SECRET) as JwtPayload;
        } catch (err) {
            return res.sendStatus(403);
        }
        const accessToken = await accessTokenRepository.findOne({ where: { token: decoded.sub } });

        if (!accessToken) {
            return res.status(401).json({ error: "Invalid token" });
        }

        req.user = { id: decoded.id }
        next();
    } else {
        res.sendStatus(401);
    }
}
