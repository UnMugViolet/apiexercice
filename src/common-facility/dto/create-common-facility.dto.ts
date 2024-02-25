import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate, IsOptional } from "class-validator";

export class CreateCommonFacilityDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsDate()
  lastInspection: Date;
}