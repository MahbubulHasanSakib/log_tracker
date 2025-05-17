import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { UserType } from '../interfaces/user.type';
import * as bcrypt from 'bcrypt';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import { IUser } from '../interfaces/user.interface';
import { SearchEmployee } from '../dto/search-employee.dto';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { DailyActivityReportDto } from '../dto/daily-activity-report.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { UserRole } from 'src/modules/auth/schemas/user-role.schema';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import axios from 'axios';
import { SMSSendDto } from '../dto/sms-send.dto';
import { AccountOpenRequest } from '../dto/account-open-request.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private apiConfigService: ApiConfigService,
  ) {}

  async getWhoAmI(user: IUser) {
    let userData: any = await this.userModel.aggregate([
      {
        $match: {
          _id: user._id,
        },
      },
      {
        $project: {
          password: false,
        },
      },
      {
        $lookup: {
          from: 'folders',
          localField: 'folderAccess',
          foreignField: '_id',
          as: 'folderAccess',
        },
      },
      {
        $project: {
          password: 0,
          deletedAt: 0,
          createdAt: 0,
          updatedAt: 0,
        },
      },
    ]);
    return { data: userData[0] };
  }
}
