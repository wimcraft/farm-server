import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAverageYieldTable1679519324512 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "average_yield"
                                 (
                                     "id"      SERIAL  NOT NULL,
                                     "average" numeric NOT NULL,
                                     CONSTRAINT "PK_17ef1559e41a7367045ffa994f3" PRIMARY KEY ("id")
                                 )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "average_yield"`);
    }

}
