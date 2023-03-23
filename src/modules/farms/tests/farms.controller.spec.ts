import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateUserDto } from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";
import { LoginUserDto } from "../../auth/dto/login-user.dto";
import { AccessToken } from "../../auth/entities/access-token.entity";
import { CreateFarmDto } from "../dto/create-farm.dto";
import { mockGoogleMapsDistanceMatrixRequest, mockGoogleMapsGeocodeRequest } from "../../../helpers/mockGoogleService";
import { FarmsService } from "../farms.service";
import dataSource from "../../../orm/orm.config";
import { Farm } from "../entities/farm.entity";

describe("FarmsController", () => {
    let app: Express;
    let agent: SuperAgentTest;
    let server: Server;

    let usersService: UsersService;
    let farmsService: FarmsService;
    const createUser = async (userDto: CreateUserDto) => usersService.createUser(userDto);
    const createUserDto: CreateUserDto = {
        email: "user@test.com",
        password: "password",
        address: "Oak Street, 3",
        coordinates: {
            "lat": 37.7749,
            "long": -122.4194
        }
    }
    const loginDto: LoginUserDto = {
        email: "user@test.com", password: "password"
    };
    let token: string;
    let userID: string;

    beforeAll(() => {
        app = setupServer();
        server = http.createServer(app).listen(config.APP_PORT);
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(async () => {
        await ds.initialize();
        agent = supertest.agent(app);

        usersService = new UsersService();
        farmsService = new FarmsService();
        mockGoogleMapsGeocodeRequest();
        mockGoogleMapsDistanceMatrixRequest()
        const user = await createUser(createUserDto);
        userID = user.id;

        const res = await agent.post("/api/v1/auth/login").send(loginDto);
        token = (res.body as AccessToken).token;
    });

    afterEach(async () => {
        await disconnectAndClearDatabase(ds);
    });

    describe("POST /farms", () => {
        const createFarmDto: CreateFarmDto = {
            name: "test farm",
            address: "test address",
            size: 10,
            yield: 40
        }

        it("should create new farm", async () => {
            const response = await agent.post("/api/v1/farms/").auth(token, { type: "bearer" }).send(createFarmDto);
            expect(response.statusCode).toBe(201);
            expect(response.body).toMatchObject({
                id: expect.any(String),
                name: expect.any(String),
                address: expect.any(String),
                size: expect.any(Number),
                yield: expect.any(Number),
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });
        });
    });


    describe("GET /farms", () => {
        const createFarmDto1: CreateFarmDto = {
            name: "bbbb",
            address: "test address1",
            size: 5,
            yield: 10.0
        }
        const createFarmDto2: CreateFarmDto = {
            name: "aaaa",
            address: "test address2",
            size: 10,
            yield: 20.0
        }

        it("should get list of farms", async () => {
            await farmsService.createFarm(createFarmDto1, { id: userID });
            await farmsService.createFarm(createFarmDto2, { id: userID });
            const response = await agent.get("/api/v1/farms/").auth(token, { type: "bearer" }).send();
            expect(response.statusCode).toBe(200);
            expect(response.body?.length).toEqual(2);
        });

        it("should get list of farms sorted by name", async () => {
            const createdFarm = await farmsService.createFarm(createFarmDto1, { id: userID });
            const createdFarm2 = await farmsService.createFarm(createFarmDto2, { id: userID });
            const response = await agent.get("/api/v1/farms?sortBy=name").auth(token, { type: "bearer" }).send();
            expect(response.statusCode).toBe(200);
            expect(response.body?.length).toEqual(2);
            expect(response.body[0].id).toEqual(createdFarm2.id);
            expect(response.body[1].id).toEqual(createdFarm.id);
        });

        it("should get list of farms sorted by date", async () => {
            const createdFarm = await farmsService.createFarm(createFarmDto1, { id: userID });
            const createdFarm2 = await farmsService.createFarm(createFarmDto2, { id: userID });
            const farmRepository = dataSource.getRepository(Farm);
            await farmRepository.update({ id: createdFarm2.id }, { createdAt: "2020-03-23T12:07:26.576Z" })
            const response = await agent.get("/api/v1/farms?sortBy=date").auth(token, { type: "bearer" }).send();
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(2);
            expect(response.body[0].id).toEqual(createdFarm.id);
            expect(response.body[1].id).toEqual(createdFarm2.id);
        });

        // todo: mock distance values
        it("should get list of farms sorted by distance", async () => {
            const createdFarm = await farmsService.createFarm(createFarmDto1, { id: userID });
            const createdFarm2 = await farmsService.createFarm(createFarmDto2, { id: userID });
            const response = await agent.get("/api/v1/farms?sortBy=distance").auth(token, { type: "bearer" }).send();
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toEqual(2);
            expect(response.body[0].id).toEqual(createdFarm2.id);
            expect(response.body[1].id).toEqual(createdFarm.id);
        });

    });
});
