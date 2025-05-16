import { Global, Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Folder, FolderSchema } from './schemas/folder.schema';
import { FolderController } from './folder.controller';
import { FolderService } from './service/folder.service';
import {
  LogActivity,
  LogActivitySchema,
} from '../log-activity/schemas/log-activity.schema';
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Folder.name,
        schema: FolderSchema,
      },
      {
        name: LogActivity.name,
        schema: LogActivitySchema,
      },
    ]),
  ],
  controllers: [FolderController],
  providers: [FolderService],
  exports: [MongooseModule],
})
export class FolderModule {}
