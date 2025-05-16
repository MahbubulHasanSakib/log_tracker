import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true, versionKey: false })
export class Folder {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description?: string;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
