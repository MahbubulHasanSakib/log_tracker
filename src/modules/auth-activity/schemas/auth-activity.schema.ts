import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AuthActivityDocument = HydratedDocument<AuthActivity>;

@Schema({ _id: false })
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  id: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

@Schema({ timestamps: true, versionKey: false })
export class AuthActivity {
  @Prop({ type: UserSchema, required: true })
  user: User;

  @Prop({ required: true })
  kind: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  browser: string;

  @Prop({ required: true })
  success: boolean;

  @Prop({ required: true })
  at: Date;
}

export const AuthActivitySchema = SchemaFactory.createForClass(AuthActivity);
