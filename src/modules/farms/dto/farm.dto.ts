import { Farm } from "../entities/farm.entity";
import { Expose, Transform } from "class-transformer";
import { Coordinates } from "../../users/entities/user.entity";

export class FarmDto {
    constructor(partial?: Partial<FarmDto>) {
        Object.assign(this, partial);
    }

    @Expose()
    public readonly id: string;

    @Expose()
    public name: string;

    @Transform(({ value }) => (value as Date).toISOString())
    @Expose()
    public createdAt: Date;

    @Transform(({ value }) => (value as Date).toISOString())
    @Expose()
    public updatedAt: Date;

    @Expose()
    public address: string;

    @Expose()
    public size: number;

    @Expose()
    public yield: number;

    @Expose()
    public coordinates: Coordinates;

    @Expose()
    public owner: string;

    @Expose()
    public distance: number;

    public static createFromEntity(farm: Farm | null): FarmDto | null {
        if (!farm) {
            return null;
        }
        const { user, farmYield, ...data } = farm;
        return new FarmDto({ ...data, yield: farmYield, owner: user.email })
    }
}
