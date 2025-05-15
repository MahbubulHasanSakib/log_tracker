import { Global, Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { CmUser, CmUserSchema } from './schemas/cm-user.schema';
import { MsUser, MsUserSchema } from './schemas/ms-user.schema';
import { UserType } from './interfaces/user.type';
import { WmaUser, WmaUserSchema } from './schemas/wma-user.schema';
import { CcUser, CcUserSchema } from './schemas/cc-user.schema';
import { AgencyUser, AgencyUserSchema } from './schemas/agency-user.schema';
import { DffUser, DffUserSchema } from './schemas/dff-user.schema';
import { RcUser, RcUserSchema } from './schemas/rc-user.schema';
import { MtcmUser, MtcmUserSchema } from './schemas/mtcm-user.schema';
import { UserRole, UserRoleSchema } from '../auth/schemas/user-role.schema';
import { Draft, DraftSchema } from './schemas/draft.schema';
import { AuthModule } from '../auth/auth.module';
@Global()
@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        discriminators: [
          { name: CmUser.name, schema: CmUserSchema, value: UserType.CM },
          { name: MsUser.name, schema: MsUserSchema, value: UserType.MS },
          { name: WmaUser.name, schema: WmaUserSchema, value: UserType.WMA },
          { name: CcUser.name, schema: CcUserSchema, value: UserType.CC },
          { name: DffUser.name, schema: DffUserSchema, value: UserType.DFF },
          { name: RcUser.name, schema: RcUserSchema, value: UserType.RC },
          { name: MtcmUser.name, schema: MtcmUserSchema, value: UserType.MTCM },
          {
            name: AgencyUser.name,
            schema: AgencyUserSchema,
            value: UserType.AGENCY,
          },
          {
            name: AdminUser.name,
            schema: AdminUserSchema,
            value: UserType.ADMIN,
          },
        ],
      },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [MongooseModule],
})
export class UserModule {}
