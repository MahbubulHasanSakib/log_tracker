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
import { AuthGuard } from '../auth/auth.guard';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { Response } from 'express';
import { FolderService } from './service/folder.service';
import { CreateFolderDto } from './dto/create-folder.dto';

@ApiTags('folder')
@UseInterceptors(ResponseInterceptor)
@Controller('folder')
export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post('')
  async createFolder(@Body() body: CreateFolderDto, @User() user: IUser) {
    return this.folderService.create(body, user);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('')
  async getAllFolders(@User() user: IUser) {
    return this.folderService.getAllFolders(user);
  }
}
