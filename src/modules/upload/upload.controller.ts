import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  Req,
  Inject,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common/pipes';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as sharp from 'sharp';
import * as winston from 'winston';
import * as WinstonDailyRotateFile from 'winston-daily-rotate-file';
import * as dayjs from 'dayjs';
import * as timezone from 'dayjs/plugin/timezone';
import * as utc from 'dayjs/plugin/utc';
import { performance } from 'perf_hooks';

import { FileUploadDto } from './dto/file-upload.dto';
import { ApiConfigService } from '../api-config/api-config.service';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadSignedUrlDto } from './dto/upload-signed-url.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@ApiBearerAuth()
@ApiTags('upload')
@Controller('upload')
export class UploadController {
  constructor(
    private readonly apiConfigService: ApiConfigService,
    @Inject(S3Client.name) private readonly s3Client: S3Client,
  ) {}

  private getBangladeshTimestamp(): string {
    return dayjs().tz('Asia/Dhaka').format('DD/MM/YYYY, hh:mm:ss A');
  }

  @Post(':folder/:date')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @ApiParam({ name: 'folder', type: 'string', example: 'resource' })
  @ApiParam({ name: 'date', type: 'string', example: '02-02-2024' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadWithThumbnail(
    @Param() param: Record<'folder' | 'date', string>,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 1024 }),
          /*new FileTypeValidator({
            fileType: new RegExp(
              '(PNG|JPEG|JPG|PDF|MP4|DOC|DOCX|XLS|XLSX)',
              'i',
            ),
          }),*/
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const start = performance.now();
    const startTime = this.getBangladeshTimestamp();

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : 'No Token Provided';

    if (
      file.mimetype !== 'text/csv' &&
      !/^(image\/(png|jpeg)|application\/pdf|video\/mp4|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/vnd\.ms-excel|application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|application\/vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/i.test(
        file.mimetype,
      )
    ) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const bucket = this.apiConfigService.getBucket;
    const basePath = this.apiConfigService.getBasePath;
    const fileKey = `${basePath}/${param.folder}/${param.date}/${file.originalname}`;
    const endpoint = this.apiConfigService.getEndpoint.replace('https://', '');

    let result;

    try {
      if (/(PNG|JPEG)/i.test(file.mimetype)) {
        const originalKey = `${fileKey}-original`;
        const thumbKey = `${fileKey}-thumb`;
        const thumbnailImage = await sharp(file.buffer)
          .resize(200, 200)
          .toBuffer();

        const uploadOriginal = this.s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: originalKey,
            ContentType: file.mimetype,
            Body: file.buffer,
            ACL: 'public-read',
          }),
        );

        const uploadThumbnail = this.s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: thumbKey,
            ContentType: file.mimetype,
            Body: thumbnailImage,
            ACL: 'public-read',
          }),
        );

        await Promise.all([uploadOriginal, uploadThumbnail]);

        result = {
          message: 'Image upload successfully.',
          data: {
            original: `https://${bucket}.${endpoint}/${originalKey}`,
            thumb: `https://${bucket}.${endpoint}/${thumbKey}`,
          },
        };
      } else {
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: fileKey,
            ContentType: file.mimetype,
            Body: file.buffer,
            ACL: 'public-read',
          }),
        );

        result = {
          message: 'File upload successfully.',
          data: {
            fileUrl: `https://${bucket}.${endpoint}/${fileKey}`,
          },
        };
      }

      return result;
    } catch (err) {
      throw err;
    } finally {
      const end = performance.now();
      const endTime = this.getBangladeshTimestamp();
      const duration = (end - start).toFixed(2);
    }
  }

  @Post('signed-url/:folder/:date')
  @ApiParam({ name: 'folder', type: 'string', example: 'resource' })
  @ApiParam({ name: 'date', type: 'string', example: '02-02-2024' })
  async getSignedUrl(
    @Param('folder') folder: string,
    @Param('date') date: string,
    @Body() body: UploadSignedUrlDto,
  ) {
    const bucket = this.apiConfigService.getBucket;
    const basePath = this.apiConfigService.getBasePath;

    const key = `${basePath}/${folder}/${date}/${body.filename}`;
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.filetype,
      ACL: 'public-read', // if you want public files
    });

    const url = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });

    return { url };
  }
}
