import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateFarmDto  {
    @IsString()
    @IsNotEmpty()
    public name: string;

    @IsString()
    @IsNotEmpty()
    public address: string;

    @IsNumber()
    @IsNotEmpty()
    public size: number;

    @IsNumber()
    @IsNotEmpty()
    public yield: number;
}
