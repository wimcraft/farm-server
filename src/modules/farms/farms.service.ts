import { DeepPartial, FindOptionsWhere, Repository } from "typeorm";
import dataSource from "../../orm/orm.config";
import { Farm } from "./entities/farm.entity";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { Coordinates, IUser, User } from "../users/entities/user.entity";
import { UnprocessableEntityError } from "../../errors/errors";
import axios from "axios";
import config from "config/config";
import { AverageYield } from "./entities/average-yield.entity";

interface GeocodeResponse {
    results: {
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
    }[];
}

interface DistanceMatrixResponse {
    status: string;
    rows: {
        elements: {
            status: string;
            distance: {
                value: number;
                text: string;
            };
            duration: {
                value: number;
                text: string;
            };
        }[];
    }[];
}

export interface IFarmFindOptions {
    sortBy: string | undefined;
    outliers: boolean;
    address: string | undefined;
}

export class FarmsService {
    private readonly farmRepository: Repository<Farm>;

    constructor() {
        this.farmRepository = dataSource.getRepository(Farm);
    }

    public async find(params: IFarmFindOptions): Promise<Farm[]> {
        const builder = this.farmRepository.createQueryBuilder("f").leftJoinAndSelect("f.user", "user")
        if (params.outliers) {
            let averageYield;
            averageYield = await this.farmRepository.manager.getRepository(AverageYield).findOne({
                    where: {},
                    order: { id: "DESC" }
                }
            )

            if (!averageYield) {
                averageYield = await this.farmRepository.createQueryBuilder()
                    .select('AVG("farmYield")', "average")
                    .getRawOne();
            }

            const lowerBound = averageYield.average * 0.7;
            const upperBound = averageYield.average * 1.3;

            builder.andWhere("f.farmYield BETWEEN :lowerBound AND :upperBound", { lowerBound, upperBound })
        }

        switch (params.sortBy) {
            case "date":
                builder.orderBy("f.createdAt", "DESC");
                break;
            case "name":
            default:
                builder.orderBy("f.name");
        }

        const farms = await builder.getMany();
        if (params.address) {
            const updatedFarms = await this.calculateDistance(farms, params.address)
            // replace array with updated farms
            farms.splice(0, farms.length, ...updatedFarms);
        }

        if (params.sortBy === "distance") {
            farms.sort((a, b) => {
                const aDistance = a.distance !== undefined ? a.distance : Infinity;
                const bDistance = b.distance !== undefined ? b.distance : Infinity;
                return aDistance - bDistance;
            })
        }

        return farms;
    }

    // todo: add caching
    public async calculateDistance(farms: Farm[], address: string): Promise<Farm[]> {
        const calculate = async (farm: Farm): Promise<Farm> => {
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${address}&destinations=${farm.address}&mode=driving&key=${config.GOOGLE_API_KEY}`;

            let distance;
            try {
                const response = await axios.get<DistanceMatrixResponse>(url);

                distance = response.data.rows[0].elements[0].distance.text;

            } catch (error) {
                console.error(error);
            }

            return Object.assign({ ...farm, distance });
        }

        // todo: rewrite using Promise.allSettled and catch errors
        return Promise.all(farms.map(calculate))
    }

    async createFarm(data: CreateFarmDto, user: IUser) {
        const { name, address, yield: farmYield, size } = data;
        const existingFarm = await this.findOneBy({ address });
        if (existingFarm) throw new UnprocessableEntityError("A farm for this address already exists");

        let coordinates: Coordinates;
        try {
            coordinates = await this.geocoder(address);
        } catch (error) {
            throw new Error("Can not get coordinates");

        }

        const farmData: DeepPartial<Farm> = { name, address, farmYield, size, coordinates };
        const newFarm = this.farmRepository.create(farmData)
        newFarm.user = new User({ id: user.id });

        return this.farmRepository.save(newFarm);
    }

    public async findOneBy(param: FindOptionsWhere<Farm>): Promise<Farm | null> {
        return this.farmRepository.findOneBy({ ...param });
    }

    private async geocoder(address: string): Promise<Coordinates> {
        if (!address) {
            throw new Error("Address is required");
        }
        const coords: Coordinates = new Coordinates();

        try {
            const response = await axios.get<GeocodeResponse>(`https://maps.googleapis.com/maps/api/geocode/json?key=${config.GOOGLE_API_KEY}&address=${encodeURIComponent(address )}`);

            const { lat, lng } = response.data.results[0].geometry.location;
            coords.long = lng;
            coords.lat = lat;
        } catch (error) {
            console.error(error);
            throw new Error("Internal Server Error");
        }

        return coords;
    }

    async delete(farmId: string, user: IUser) {
        const existingFarm = await this.findOneBy({ id: farmId, user: { id: user.id } });
        if (!existingFarm) throw new Error("Farm does not exist");
        return this.farmRepository.delete({ id: farmId, user: { id: user.id } });
    }
}
