import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import { CreateUserDto } from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";
import { FarmsService } from "../farms.service";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { Farm } from "../entities/farm.entity";
import { mockGoogleMapsGeocodeRequest } from "../../../helpers/mockGoogleService";
import { User } from "../../users/entities/user.entity";
import { UnprocessableEntityError } from "../../../errors/errors";

describe("FarmsService", () => {
    let app: Express;
    let server: Server;

    let usersService: UsersService;
    let farmsService: FarmsService;

    beforeAll(() => {
        app = setupServer();
        server = http.createServer(app).listen(config.APP_PORT);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(async () => {
        await ds.initialize();
        usersService = new UsersService();
        farmsService = new FarmsService();
        mockGoogleMapsGeocodeRequest();
    });

    afterEach(async () => {
        await disconnectAndClearDatabase(ds);
    });

    describe("createFarm", () => {
        const createUserDto: CreateUserDto = {
            email: "user@test.com",
            password: "password",
            address: "Oak Street, 3",
            coordinates: {
                "lat": 37.7749,
                "long": -122.4194
            }
        }
        const createFarmDto: CreateFarmDto = {
            name: "test farm",
            address: "test address",
            size: 5,
            yield: 8.5
        }

        it("should create new farm", async () => {
            const createdUser = await usersService.createUser(createUserDto);
            const createdFarm = await farmsService.createFarm(createFarmDto, { id: createdUser.id });
            expect(createdFarm).toBeInstanceOf(Farm);
        });

        describe("with existing farm", () => {
            let createdUser: User;
            beforeEach(async () => {
                createdUser = await usersService.createUser(createUserDto);
                await farmsService.createFarm(createFarmDto, { id: createdUser.id });
            });

            it("should throw UnprocessableEntityError if user already exists", async () => {
                await farmsService.createFarm(createFarmDto, { id: createdUser.id }).catch((error: UnprocessableEntityError) => {
                    expect(error).toBeInstanceOf(UnprocessableEntityError);
                    expect(error.message).toBe("A farm for this address already exists");
                });
            });
        });
    });

    describe("findOneBy", () => {
        const createUserDto: CreateUserDto = {
            email: "user@test.com",
            password: "password",
            address: "Oak Street, 3",
            coordinates: {
                "lat": 37.7749,
                "long": -122.4194
            }
        }
        const createFarmDto: CreateFarmDto = {
            name: "test farm",
            address: "test address",
            size: 5,
            yield: 8.5
        }

        it("should get farm by provided param", async () => {
            const createdUser = await usersService.createUser(createUserDto);
            const { user, ...createdFarm } = await farmsService.createFarm(createFarmDto, { id: createdUser.id });
            const foundFarm = await farmsService.findOneBy({ id: createdFarm.id });

            expect(user.id).toEqual(createdUser.id);
            expect(foundFarm).toMatchObject({ ...createdFarm });
        });

        it("should return null if farm not found by provided param", async () => {
            const foundFarm = await farmsService.findOneBy({ address: "not found address" });
            expect(foundFarm).toBeNull();
        });
    });


    describe("deleteFarm", () => {
        const createUserDto1: CreateUserDto = {
            email: "user1@test.com",
            password: "password",
            address: "Oak Street, 3",
            coordinates: {
                "lat": 37.7749,
                "long": -122.4194
            }
        }
        const createUserDto2: CreateUserDto = {
            email: "user2@test.com",
            password: "password",
            address: "Oak Street, 3",
            coordinates: {
                "lat": 37.7749,
                "long": -122.4194
            }
        }
        const createFarmDto1: CreateFarmDto = {
            name: "test farm1",
            address: "test address2",
            size: 5,
            yield: 8.5
        }

        it("should delete farm", async () => {
            const createdUser = await usersService.createUser(createUserDto1);
            const createdFarm = await farmsService.createFarm(createFarmDto1, { id: createdUser.id });
            const deleteResult = await farmsService.delete(createdFarm.id, { id: createdUser.id });

            expect(deleteResult.affected).toEqual(1)
        });

        it("should not delete other user farm", async () => {
            const createdUser = await usersService.createUser(createUserDto1);
            const createdUser2 = await usersService.createUser(createUserDto2);
            const createdFarm = await farmsService.createFarm(createFarmDto1, { id: createdUser.id });
            await farmsService.delete(createdFarm.id, { id: createdUser2.id }).catch((error: Error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error.message).toBe("Farm does not exist");
            });
        });
    });
});
