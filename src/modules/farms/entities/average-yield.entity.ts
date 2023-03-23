import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AverageYield {
    constructor(partial?: Partial<AverageYield>) {
        Object.assign(this, partial);
    }
    @PrimaryGeneratedColumn()
    public readonly id: string;

    @Column("decimal")
    public average: number;
}
