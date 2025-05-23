import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ discriminatorKey: 'kind', timestamps: true, versionKey: false })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false, type: [mongoose.Schema.Types.ObjectId] })
  folderAccess: mongoose.Schema.Types.ObjectId[];

  @Prop({ default: null, type: mongoose.Schema.Types.ObjectId })
  modifier: mongoose.Schema.Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ username: 1, kind: 1 });
UserSchema.index({ usercode: 1 });
