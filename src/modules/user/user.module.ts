import { Global, Module, forwardRef } from '@nestjs/common';
import { UserService } from './service/user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserType } from './interfaces/user.type';
import { UserRole, UserRoleSchema } from '../auth/schemas/user-role.schema';
import { AuthModule } from '../auth/auth.module';
@Global()
@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: UserRole.name, schema: UserRoleSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [MongooseModule],
})
export class UserModule {}
