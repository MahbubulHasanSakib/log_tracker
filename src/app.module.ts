import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiConfigModule } from './modules/api-config/api-config.module';
import { ApiConfigService } from './modules/api-config/api-config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { UploadModule } from './modules/upload/upload.module';
import { CoreModule } from './modules/core/core.module';
import { FileModule } from './modules/file/file.module';
import { FolderModule } from './modules/folder/folder.module';
import { LogActivityModule } from './modules/log-activity/log-activity.module';

@Module({
  imports: [
    ApiConfigModule,
    UserModule,
    AuthModule,
    UploadModule,
    CoreModule,
    FolderModule,
    FileModule,
    LogActivityModule,
    MongooseModule.forRootAsync({
      imports: [ApiConfigModule],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        uri: apiConfigService.getMongodbUri,
      }),
      inject: [ApiConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
