import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFileDto } from '../dto/create-file.dto';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { File } from '../schemas/file.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Folder } from 'src/modules/folder/schemas/folder.schema';
import { LogActivity } from 'src/modules/log-activity/schemas/log-activity.schema';

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private fileModel: Model<File>,
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(LogActivity.name) private logActivityModel: Model<LogActivity>,
  ) {}
  async manualUploadFile(folderId: string, body: CreateFileDto, user: IUser) {
    const existing = await this.folderModel.findById(folderId);
    if (!existing) {
      throw new BadRequestException('No folder exists for this id');
    }

    const saved = await this.fileModel.create({
      name: body.name,
      url: body.url,
      fileType: body.fileType,
      folder: existing.name,
      folderId: existing._id,
      uploadedBy: user._id,
      uploadedByUser: user.name,
    });

    await this.logActivityModel.create({
      user: {
        id: user._id,
        name: user.name,
      },
      kind: 'upload',
      fileId: saved._id,
      fileName: saved.name,
      folderId: existing['_id'],
      folderName: existing['name'],
    });
    return { data: saved };
  }

  async downloadFile(id: string, user: IUser) {
    const file = await this.fileModel.findById(id);
    if (!file) throw new NotFoundException('File not found');
    await this.logActivityModel.create({
      user: {
        id: user._id,
        name: user.name,
      },
      kind: 'download',
      fileId: file._id,
      fileName: file.name,
    });
    return { data: file.url };
  }

  async getFilesByFolderId(folderId: string, user: IUser) {
    let files = await this.fileModel.find({ folderId });
    return { data: files };
  }
}
