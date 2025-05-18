import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { LogActivityService } from './log-activity.service';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { ResponseInterceptor } from 'src/utils/response.interceptor';

@ApiTags('log-activity')
@UseInterceptors(ResponseInterceptor)
@Controller('log-activity')
export class LogActivityController {
  constructor(private readonly logActivityService: LogActivityService) {}
  @ApiQuery({ name: 'page', type: Number })
  @ApiQuery({ name: 'limit', type: Number })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all-logs')
  async getAllLogs(@Query() paginateDto: PaginateDto) {
    return this.logActivityService.getAllLogs(paginateDto);
  }
}
