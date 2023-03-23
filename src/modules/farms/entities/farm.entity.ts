import {
    AfterInsert, AfterLoad,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import { Coordinates, User } from "../../users/entities/user.entity";
import dataSource from "../../../orm/orm.config";
import { AverageYield } from "./average-yield.entity";

@Entity()
export class Farm {
    @AfterInsert()
    public async calculateAverage() {
        const farmRepository = dataSource.getRepository(Farm);
        const { average } = await farmRepository.createQueryBuilder()
            .select('AVG("farmYield")', "average")
            .getRawOne();
        if (average) {
            const averageYieldRepository = dataSource.getRepository(AverageYield)
            const averageYield = await averageYieldRepository.findOne({
                where: {},
                order: { id: "DESC" }
            });
            if (!averageYield) {
                await averageYieldRepository.save(new AverageYield({ average }));
            } else {
                await averageYieldRepository.update({ id: averageYield.id }, { average });
            }
        }
    }
    @AfterLoad() _convertNumerics() {
        this.size = parseFloat(this.size as any);
        this.farmYield = parseFloat(this.farmYield as any);
    }

    @PrimaryGeneratedColumn("uuid")
    public readonly id: string;

    @Column()
    public name: string;

    @Column()
    public address: string;

    @Column(() => Coordinates)
    public coordinates: Coordinates;

    @Column("decimal")
    public size: number;

    @Column("decimal")
    public farmYield: number;

    @CreateDateColumn()
    public createdAt: Date;

    @UpdateDateColumn()
    public updatedAt: Date;

    @ManyToOne(() => User, user => user.farms)
    public user: User;

    public distance?: number;
}
