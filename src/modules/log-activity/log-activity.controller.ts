import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LogActivityService } from './log-activity.service';

@Controller('auth-activity')
export class LogActivityController {
  constructor(private readonly logActivityService: LogActivityService) {}
}
