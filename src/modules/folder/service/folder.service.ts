// folder/folder.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Folder } from '../schemas/folder.schema';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { IUser } from 'src/modules/user/interfaces/user.interface';
import { LogActivity } from 'src/modules/log-activity/schemas/log-activity.schema';
@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<Folder>,
    @InjectModel(LogActivity.name) private logActivityModel: Model<LogActivity>,
  ) {}

  async create(createFolderDto: CreateFolderDto, user: IUser) {
    const existing = await this.folderModel.findOne({
      name: createFolderDto.name,
    });
    if (existing) {
      throw new ConflictException('Folder name already exists');
    }

    let folderCreated = await this.folderModel.create(createFolderDto);
    await this.logActivityModel.create({
      user: {
        id: user._id,
        name: user.name,
      },
      kind: 'create',
      folderId: folderCreated['_id'],
      folderName: folderCreated['name'],
    });
    return { data: folderCreated };
  }

  async getAllFolders(user: IUser) {
    const folders = await this.folderModel.find({ deletedAt: null });
    return { data: folders };
  }
}
