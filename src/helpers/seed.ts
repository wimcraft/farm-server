import "reflect-metadata";
import dataSource from "orm/orm.config";
import { Farm } from "../modules/farms/entities/farm.entity";
import { faker } from "@faker-js/faker";
import { UsersService } from "../modules/users/users.service";
import ds from "../orm/orm.config";

async function seed() {
    await ds.initialize();
    const userService = new UsersService();
    const farmRepository = dataSource.getRepository(Farm);

    // Create users
    const users = [
        {
            name: "John Doe",
            email: "john.doe@example.com",
            password: faker.internet.password(),
            address: faker.address.streetAddress(),
            coordinates: { lat: Number(faker.address.latitude()), long: Number(faker.address.longitude()) }
        },
        {
            name: "Jane Smith",
            email: "jane.smith@example.com",
            password: faker.internet.password(),
            address: faker.address.streetAddress(),
            coordinates: { lat: Number(faker.address.latitude()), long: Number(faker.address.longitude()) }
        },
        {
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            password: faker.internet.password(),
            address: faker.address.streetAddress(),
            coordinates: { lat: Number(faker.address.latitude()), long: Number(faker.address.longitude()) }
        },
        {
            name: "Alice Brown",
            email: "alice.brown@example.com",
            password: faker.internet.password(),
            address: faker.address.streetAddress(),
            coordinates: { lat: Number(faker.address.latitude()), long: Number(faker.address.longitude()) }
        },
    ];

    const createdUsers = await Promise.all(users.map( ( user ) => userService.createUser(user)))

    // Create 30 farms for each user
    const farms = [];

    for (const user of createdUsers) {
        for (let i = 1; i <= 30; i++) {
            const farm = new Farm();
            farm.name = `Farm ${i}`;
            farm.address = faker.address.streetAddress();
            farm.coordinates = { lat: Number(faker.address.latitude()), long: Number(faker.address.longitude()) };
            farm.size = faker.datatype.number({
                "min": 10,
                "max": 50
            });
            farm.farmYield = faker.datatype.number({
                "min": 10,
                "max": 50
            });
            farm.user = user;
            farms.push(farm);
        }
    }

    await farmRepository.save(farms);
    await ds.destroy();
}

seed().then(() => {
    console.log("Seed script finished!");
});
