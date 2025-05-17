import { IsString, IsUrl, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({
    example: 'monthly-report.xlsx',
    description: 'The name of the uploaded file',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'XLSX',
    description: 'Type of the uploaded file',
  })
  @IsString()
  @IsNotEmpty()
  fileType: string;

  @ApiProperty({
    example:
      'https://your-space.digitaloceanspaces.com/reports/monthly-report.xlsx',
    description:
      'The full public URL of the file stored in DigitalOcean Spaces',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}
