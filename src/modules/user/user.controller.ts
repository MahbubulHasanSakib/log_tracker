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
} from '@nestjs/common';
import { UserService } from './service/user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseInterceptor } from 'src/utils/response.interceptor';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './user.decorator';
import { IUser } from './interfaces/user.interface';
import { SearchEmployee } from './dto/search-employee.dto';
import { DailyActivityReportDto } from './dto/daily-activity-report.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Permissions } from '../auth/permissions.decorator';
import { PermissionType } from '../auth/interface/permission.type';
import { PermissionsGuard } from '../auth/permissions.guard';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { SMSSendDto } from './dto/sms-send.dto';
import { AccountOpenRequest } from './dto/account-open-request.dto';

@ApiTags('user')
@UseInterceptors(ResponseInterceptor)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('whoami')
  async whoami(@User() user: IUser) {
    return await this.userService.getWhoAmI(user);
  }
}
