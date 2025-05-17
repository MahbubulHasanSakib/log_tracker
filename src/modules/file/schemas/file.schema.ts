import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class File {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  fileType: string;

  @Prop({ required: true })
  url: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Folder', required: true })
  folderId: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true })
  folder: string; // 'tech' or 'operation'

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  uploadedBy: mongoose.Schema.Types.ObjectId;

  @Prop({ required: false })
  uploadedByUser: string;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  deletedBy: mongoose.Schema.Types.ObjectId;
}

export const FileSchema = SchemaFactory.createForClass(File);
