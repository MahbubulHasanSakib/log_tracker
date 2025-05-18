import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Permission } from './schemas/permission.schema';
import { RoleHasPermission } from './schemas/role-has-permission.schema';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreateRoleHasPermissionDto } from './dto/create-role-has-permission.dto';
import { UpdateRoleHasPermissionDto } from './dto/update-role-has-permission.dto';
import { CreateUserSignInDto } from './dto/create-user-signin.dto';
import { CreateUserSignUpDto } from './dto/create-user-signup.dot';
import { User } from '../user/schemas/user.schema';
import { ApiConfigService } from 'src/modules/api-config/api-config.service';
import { JwtService } from '@nestjs/jwt';
import { UserType } from '../user/interfaces/user.type';
import { Request } from 'express';
import RequestDetails from 'request-details';
import * as bcrypt from 'bcrypt';
import * as mongoose from 'mongoose';
import { IUser } from '../user/interfaces/user.interface';
import { LoggedOnType } from '../user/interfaces/loggedOn.type';
import { UserRole } from './schemas/user-role.schema';
import { PaginateDto } from 'src/utils/dto/paginate.dto';
import { ObjectId } from 'mongodb';
import { LogActivity } from '../log-activity/schemas/log-activity.schema';
import { getRequestSourceData } from 'src/utils/request.helper';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Permission.name) private permissionModel: Model<Permission>,
    @InjectModel(RoleHasPermission.name)
    private roleHasPermissionModel: Model<RoleHasPermission>,
    @InjectModel(LogActivity.name)
    private logActivityModel: Model<LogActivity>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(UserRole.name) private userRoleModel: Model<UserRole>,
    private apiConfigService: ApiConfigService,
    private jwtService: JwtService,
  ) {}

  // Below are all the permission related services.

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const data = await this.permissionModel.create(createPermissionDto);

    return { data, message: 'Permission created successfully.' };
  }

  async findAllPermission() {
    const data = await this.permissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $sort: {
          module: 1,
          submodule: 1,
        },
      },
      {
        $group: {
          _id: '$module',
          res: {
            $push: {
              label: { $ifNull: ['$submodule', '$module'] },
              value: '$_id',
            },
          },
        },
      },
      { $sort: { _id: 1 } },
      {
        $group: {
          _id: null,
          res: {
            $push: '$res',
          },
        },
      },
    ]);

    return {
      data: data[0]?.res ?? [],
      message: 'All permissions were found successfully.',
    };
  }

  async findPermissionList() {
    const data = await this.permissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $sort: {
          module: 1,
        },
      },
      {
        $project: {
          _id: 0,
          label: { $ifNull: ['$submodule', '$module'] },
          value: '$_id',
        },
      },
    ]);

    return { data, message: 'All permissions were found successfully.' };
  }

  async findOnePermission(id: string) {
    const data = await this.permissionModel.findById(id);

    return { data, message: 'A permission was successfully fetched.' };
  }

  async updatePermission(id: string, updatePermissionDto: UpdatePermissionDto) {
    const data = await this.permissionModel.findByIdAndUpdate(
      id,
      updatePermissionDto,
      { new: true },
    );

    if (!data) {
      throw new ForbiddenException('Failed to update permission.');
    }

    return {
      data,
      message: 'A permission update has been completed successfully.',
    };
  }

  async removePermission(id: string) {
    const data = await this.permissionModel.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true },
    );

    if (!data) {
      throw new ForbiddenException('Failed to delete permission.');
    }

    return {
      data,
      message: 'A permission has been successfully deleted.',
    };
  }

  async createRoleHasPermission(
    createRoleHasPermissionDto: CreateRoleHasPermissionDto,
  ) {
    const roleHasPermissions = await this.roleHasPermissionModel.create(
      createRoleHasPermissionDto,
    );

    return {
      message: 'Successfully created role has permissions',
      data: roleHasPermissions,
    };
  }

  async findAllRoleHasPermission(paginateDto: PaginateDto) {
    const { page, limit } = paginateDto;

    const [{ data = [], meta = {} } = {}] =
      await this.roleHasPermissionModel.aggregate([
        {
          $match: {
            deletedAt: null,
          },
        },
        {
          $lookup: {
            from: 'permissions',
            localField: 'permissions',
            foreignField: '_id',
            as: 'permissions',
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
                $project: {
                  name: 1,
                  modules: {
                    $substr: [
                      {
                        $reduce: {
                          input: {
                            $sortArray: {
                              input: '$permissions',
                              sortBy: { module: 1, submodule: 1 },
                            },
                          },
                          initialValue: '',
                          in: {
                            $concat: [
                              '$$value',
                              ', ',
                              {
                                $ifNull: ['$$this.submodule', '$$this.module'],
                              },
                            ],
                          },
                        },
                      },
                      2,
                      -1,
                    ],
                  },
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

  async findAllRoleHasPermissionList() {
    const roleHasPermissions = await this.roleHasPermissionModel.aggregate([
      {
        $match: {
          deletedAt: null,
        },
      },
      {
        $project: {
          _id: 0,
          label: '$name',
          value: '$_id',
        },
      },
    ]);

    return {
      message: 'Successfully found role has permissions',
      data: roleHasPermissions,
    };
  }

  async findOneRoleHasPermission(id: string) {
    const data = await this.roleHasPermissionModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'permissions',
          foreignField: '_id',
          pipeline: [
            { $sort: { module: 1, submodule: 1 } },
            {
              $project: {
                _id: 0,
                label: {
                  $ifNull: ['$submodule', '$module'],
                },
                value: '$_id',
              },
            },
          ],
          as: 'permissions',
        },
      },
      {
        $project: {
          name: 1,
          permissions: 1,
        },
      },
    ]);

    return {
      message: data[0]
        ? 'Successfully found role has permission'
        : "didn't find role has permission",
      data: data[0] ?? [],
    };
  }

  async updateRoleHasPermission(
    id: string,
    updateRoleHasPermissionDto: UpdateRoleHasPermissionDto,
  ) {
    const updatedRoleHasPermission =
      await this.roleHasPermissionModel.findByIdAndUpdate(
        id,
        updateRoleHasPermissionDto,
        { new: true },
      );

    if (!updatedRoleHasPermission) {
      throw new NotFoundException("didn't find role has permision to update!");
    }

    return {
      message: 'Successfully update role has permission',
      data: updatedRoleHasPermission,
    };
  }

  async removeRoleHasPermission(id: string) {
    const deletedRoleHasPermission =
      await this.roleHasPermissionModel.findByIdAndUpdate(
        id,
        {
          deletedAt: new Date(),
        },
        { new: true },
      );

    if (!deletedRoleHasPermission) {
      throw new NotFoundException("didn't find role has permision to delete!");
    }
    return {
      message: 'Successfully delete role has permission',
      data: deletedRoleHasPermission,
    };
  }

  async findRoleHasPermissionByUserId(userId: string) {
    const switchCaseForLookupMatchExpr = [
      ['$regionId', '$$regionId'],
      ['$areaId', '$$areaId'],
      ['$territoryId', '$$territoryId'],
      ['$_id', '$$townId'],
    ].map(([expr1, expr2]) => ({
      case: {
        $gte: [
          {
            $size: expr2,
          },
          1,
        ],
      },
      then: {
        $in: [expr1, expr2],
      },
    }));

    const pipeline = [
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: 'rolehaspermissions',
          localField: 'roleId',
          foreignField: '_id',
          as: 'rolehaspermission',
        },
      },
      {
        $unwind: '$rolehaspermission',
      },
      {
        $lookup: {
          from: 'permissions',
          localField: 'rolehaspermission.permissions',
          foreignField: '_id',
          as: 'permissions',
        },
      },
      {
        $addFields: {
          permissions: {
            $map: {
              input: '$permissions',
              in: { $ifNull: ['$$this.submodule', '$$this.module'] },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'towns',
          let: {
            regionId: '$regionId',
            areaId: '$areaId',
            territoryId: '$territoryId',
            townId: '$townId',
            msId: '$msId',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $switch: {
                    branches: [...switchCaseForLookupMatchExpr],
                    default: {
                      $not: [
                        {
                          $anyElementTrue: [
                            {
                              $concatArrays: [
                                '$$regionId',
                                '$$areaId',
                                '$$territoryId',
                                '$$townId',
                                '$$msId',
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  },
                },
              },
            },
            { $project: { _id: 1 } },
          ],
          as: 'towns',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'msId',
          foreignField: '_id',
          as: 'msTownId',
        },
      },
      {
        $project: {
          townsId: {
            $concatArrays: [
              { $map: { input: '$towns', in: '$$this._id' } },
              {
                $reduce: {
                  input: '$msTownId',
                  initialValue: [],
                  in: { $concatArrays: ['$$value', '$$this.town'] },
                },
              },
            ],
          },
          msId: 1,
          projectAccess: 1,
          name: '$rolehaspermission.name',
          permissions: 1,
        },
      },
    ];

    const [roleHasPermission = {}] =
      await this.userRoleModel.aggregate(pipeline);

    return roleHasPermission;
  }

  // Below are the services related to user sign in, sign up and sign out.

  async userSignIn(createUserSignInDto: CreateUserSignInDto, request: Request) {
    const userData = await this.userModel.aggregate([
      {
        $match: {
          username: createUserSignInDto.username,
          deletedAt: null,
        },
      },
      {
        $lookup: {
          from: 'folders',
          localField: 'folderAccess',
          foreignField: '_id',
          as: 'folderAccess',
        },
      },
    ]);

    let user = userData[0];

    if (!user) {
      throw new NotFoundException('Sorry, no user found for this username.');
    }

    const isMatch = await bcrypt.compare(
      createUserSignInDto.password,
      user.password,
    );

    const { browser, platform: plat } = getRequestSourceData(request.headers);
    const ip = request.clientIp;
    const _ip = ip.startsWith('::ffff:') ? ip.substring(7) : ip;
    const platform = plat.replaceAll('"', '');
    /*const clientIp = request.clientIp;
    const requestOs = requestDetails.getOs();
    const requestBrowser = requestDetails.getBrowser();
    const requestDevice = requestDetails.getDevice();

     let device: string;
    let browser: string;

    if (requestOs.name === 'Android') {
      device = `${requestDevice.vendor} ${requestDevice.model}`;
    } else {
      device = `${requestOs.name} ${requestOs.version}`;
      browser = `${requestBrowser.name}/${requestBrowser.version}`;
    }*/

    const authActivity = new this.logActivityModel({
      user: { id: user['_id'], name: user.name },
      kind: 'login',
      ip: _ip,
      device: createUserSignInDto.device?.name ?? platform,
      browser,
      success: false,
    });

    if (!isMatch) {
      await authActivity.save();

      throw new ForbiddenException('The password you provided is incorrect.');
    }

    authActivity.success = true;

    await authActivity.save();

    const { _id: sub, username, name, folderAccess } = user;

    const access_token = await this.jwtService.signAsync({
      sub,
      username,
      name,
      folderAccess,
    });

    return {
      data: {
        access_token,
        payload: { id: sub, username, name, folderAccess },
        message: 'You have successfully signed in.',
      },
    };
  }

  async userSignOut(user: IUser, request: Request) {
    const found = await this.userModel.findById(user._id);
    const { browser, platform: plat } = getRequestSourceData(request.headers);
    const ip = request.clientIp;
    const _ip = ip.startsWith('::ffff:') ? ip.substring(7) : ip;
    const platform = plat.replaceAll('"', '');

    const authActivity = await this.logActivityModel.create({
      user: { id: user['_id'], name: user.name },
      kind: 'logout',
      device: user.device?.name ?? platform,
      browser,
      ip: _ip,
      success: false,
    });
    if (!found) {
      throw new ForbiddenException('You are not able to log out.');
    }
    authActivity.success = true;
    await authActivity.save();
    return { data: null, message: 'You have successfully logged out.' };
  }
}
