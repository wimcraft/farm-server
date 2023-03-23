import { FarmsService, IFarmFindOptions } from "./farms.service";
import { NextFunction, Request, Response } from "express";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { FarmDto } from "./dto/farm.dto";
import { IUser } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";

export class FarmsController {
    private readonly userService: UsersService;
    private readonly farmsService: FarmsService;

    constructor() {
        this.farmsService = new FarmsService();
        this.userService = new UsersService();
    }

    public async create(req: Request, res: Response, next: NextFunction) {
        try {
            const farm = await this.farmsService.createFarm(req.body as CreateFarmDto, req.user as IUser);
            res.status(201).send(FarmDto.createFromEntity(farm));
        } catch (error) {
            next(error);
        }
    }

    public async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const { outliers, sortBy } = req.query;
            const userData = await this.userService.findOneBy({ id: (req.user as IUser).id });
            const params: IFarmFindOptions = {
                outliers : (outliers as string) === "true",
                sortBy: sortBy as string,
                address: userData?.address
            }
            const farms = await this.farmsService.find(params);

            res.status(200).send(farms.map(FarmDto.createFromEntity));
        } catch (error) {
            console.log("error", error);
            next(error);
        }
    }

    public async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await this.farmsService.delete(req.params.id, req.user as IUser);
            res.status(200).send();
        } catch (error) {
            console.log("error", error);
            next(error);
        }
    }

}
