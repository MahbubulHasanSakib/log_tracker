import { IsString, IsUrl, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({
    example: 'operation',
    description: 'The name of the folder',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Any description',
    description: 'Any description',
  })
  @IsString()
  @IsOptional()
  description?: string;
}
