import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { FileService } from './service/file.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateFileDto } from './dto/create-file.dto';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';

@ApiTags('file')
@UseInterceptors(ResponseInterceptor)
@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('manual-upload-file/:folderId')
  async manualUploadFile(
    @Param('folderId') folderId: string,
    @Body() body: CreateFileDto,
    @User() user: IUser,
  ) {
    return this.fileService.manualUploadFile(folderId, body, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all-files/:folderId')
  async getFilesByFolderId(
    @Param('folderId') folderId: string,
    @User() user: IUser,
  ) {
    return this.fileService.getFilesByFolderId(folderId, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('download/:id')
  async downloadFile(@Param('id') id: string, @User() user: IUser) {
    return this.fileService.downloadFile(id, user);
  }
}
