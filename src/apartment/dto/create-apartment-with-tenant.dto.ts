import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateApartmentWithTenantDto {

  @ApiProperty({ example: '1'})
  tenantId: number;
}