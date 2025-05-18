import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LogActivity } from './schemas/log-activity.schema';
import { Model } from 'mongoose';
import { PaginateDto } from 'src/utils/dto/paginate.dto';

@Injectable()
export class LogActivityService {
  constructor(
    @InjectModel(LogActivity.name)
    private readonly logActivityModel: Model<LogActivity>,
  ) {}

  async getAllLogs(paginateDto: PaginateDto) {
    const { page, limit } = paginateDto;

    const [{ data = [], meta = {} } = {}] =
      await this.logActivityModel.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $facet: {
            data: [
              {
                $sort: {
                  createdAt: -1,
                },
              },

              {
                $skip: (page - 1) * limit,
              },
              {
                $limit: limit,
              },
            ],
            meta: [
              {
                $count: 'total',
              },
            ],
          },
        },
        {
          $unwind: {
            path: '$meta',
          },
        },
      ]);

    return {
      message: 'Successfully found role has permissions',
      data,
      meta: { ...meta, limit, page },
    };
  }
}
