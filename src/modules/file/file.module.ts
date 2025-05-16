import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FileController } from './file.controller';
import { FileService } from './service/file.service';
import { File, FileSchema } from './schemas/file.schema';
import {
  LogActivity,
  LogActivitySchema,
} from '../log-activity/schemas/log-activity.schema';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: File.name,
        schema: FileSchema,
      },
      {
        name: LogActivity.name,
        schema: LogActivitySchema,
      },
    ]),
  ],
  controllers: [FileController],
  providers: [FileService],
  exports: [MongooseModule],
})
export class FileModule {}
