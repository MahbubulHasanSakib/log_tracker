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
import { CmUser } from '../schemas/cm-user.schema';
import { AdminUser } from '../schemas/admin-user.schema';
import { MsUser } from '../schemas/ms-user.schema';
import { UserType } from '../interfaces/user.type';
import * as bcrypt from 'bcrypt';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { startAndEndOfDate, tz } from 'src/utils/utils';
import { IUser } from '../interfaces/user.interface';
import { WmaUser } from '../schemas/wma-user.schema';
import { DffUser } from '../schemas/dff-user.schema';
import { CcUser } from '../schemas/cc-user.schema';
import { MtcmUser } from '../schemas/mtcm-user.schema';
import { AgencyUser } from '../schemas/agency-user.schema';
import { RcUser } from '../schemas/rc-user.schema';
import { SearchEmployee } from '../dto/search-employee.dto';
import { dataManagementFilter } from 'src/utils/data-management-filter';
import { DailyActivityReportDto } from '../dto/daily-activity-report.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { UserRole } from 'src/modules/auth/schemas/user-role.schema';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { Draft } from '../schemas/draft.schema';
import { MailerService } from '@nestjs-modules/mailer';
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
    @InjectModel(CmUser.name) private cmUserModel: Model<CmUser>,
    @InjectModel(MsUser.name) private msUserModel: Model<MsUser>,
    @InjectModel(WmaUser.name) private wmaUserModel: Model<WmaUser>,
    @InjectModel(DffUser.name) private dffUserModel: Model<DffUser>,
    @InjectModel(CcUser.name) private ccUserModel: Model<CcUser>,
    @InjectModel(MtcmUser.name) private mtcmUserModel: Model<MtcmUser>,
    @InjectModel(AgencyUser.name) private agencyUserModel: Model<AgencyUser>,
    @InjectModel(RcUser.name) private rcUserModel: Model<RcUser>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    private mailerService: MailerService,
    private apiConfigService: ApiConfigService,
  ) {}

  async getTowns(user: IUser) {
    const userData = await this.userModel.aggregate([
      {
        $match: {
          _id: user._id,
          deletedAt: null,
        },
      },
      {
        $project: {
          town: 1,
        },
      },
    ]);
    return { data: { towns: userData[0]?.town } };
  }
}
