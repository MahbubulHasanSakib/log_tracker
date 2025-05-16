import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LogActivity } from './schemas/log-activity.schema';
import { Model } from 'mongoose';

@Injectable()
export class LogActivityService {
  constructor(
    @InjectModel(LogActivity.name)
    private readonly logActivityModel: Model<LogActivity>,
  ) {}
}
