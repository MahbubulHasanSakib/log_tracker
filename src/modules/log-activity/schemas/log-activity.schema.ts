// log-activity/schemas/log-activity.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}
export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true, versionKey: false })
export class LogActivity {
  @Prop({ type: UserSchema, required: true })
  user: User;

  @Prop({
    required: true,
    enum: ['login', 'logout', 'upload', 'download', 'delete', 'create'],
  })
  kind: 'login' | 'logout' | 'upload' | 'download' | 'delete' | 'create';

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  fileId?: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  fileName?: string;

  @Prop({ required: false, type: mongoose.Schema.Types.ObjectId })
  folderId?: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  folderName?: string;

  @Prop()
  ip?: string;

  @Prop()
  success?: boolean;

  @Prop()
  device?: string;

  @Prop()
  browser?: string;
}

export const LogActivitySchema = SchemaFactory.createForClass(LogActivity);
