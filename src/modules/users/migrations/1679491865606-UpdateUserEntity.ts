import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntity1679491865606 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user"
            ADD "address" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD "coordinatesLat" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user"
            ADD "coordinatesLong" double precision NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user"
            DROP COLUMN "coordinatesLong"`);
        await queryRunner.query(`ALTER TABLE "user"
            DROP COLUMN "coordinatesLat"`);
        await queryRunner.query(`ALTER TABLE "user"
            DROP COLUMN "address"`);
    }

}
