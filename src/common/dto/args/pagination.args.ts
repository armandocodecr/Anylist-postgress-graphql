import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsNumber, IsOptional, Min } from "class-validator";

@ArgsType()
export class PaginationsArgs {

    @Field(() => Int, { nullable: true })
    @IsNumber()
    @IsOptional()
    @Min(0)
    offset: number = 0;

    @Field(() => Int, { nullable: true })
    @IsNumber()
    @IsOptional()
    @Min(1)
    limit: number = 10;

}