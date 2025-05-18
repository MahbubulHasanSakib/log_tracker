import { Module } from '@nestjs/common';
import { LogActivityService } from './log-activity.service';
import { LogActivityController } from './log-activity.controller';
import { LogActivity, LogActivitySchema } from './schemas/log-activity.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: LogActivity.name, schema: LogActivitySchema },
    ]),
  ],
  controllers: [LogActivityController],
  providers: [LogActivityService],
})
export class LogActivityModule {}
