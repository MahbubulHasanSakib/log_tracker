import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get getMongodbUri() {
    return this.configService.get('MONGODB_URI');
  }

  get getRedisUri() {
    return this.configService.get('REDIS_URI');
  }

  get getAiBaseUrl() {
    return this.configService.get('AI_BASEURL');
  }

  get getPort() {
    return this.configService.get('PORT');
  }

  get getJwtSecret() {
    return this.configService.get('JWT_SECRET');
  }

  get getJwtExpire() {
    return this.configService.get('JWT_EXPIRE');
  }

  get getSaltRounds() {
    return this.configService.get('SALT_ROUNDS');
  }

  get getBucket() {
    return this.configService.get('BUCKET');
  }

  get getEndpoint() {
    return this.configService.get('ENDPOINT');
  }

  get getRegion() {
    return this.configService.get('REGION');
  }

  get getAccessKeyId() {
    return this.configService.get('ACCESS_KEY_ID');
  }

  get getSecretAccessKey() {
    return this.configService.get('SECRET_ACCESS_KEY');
  }

  get getBasePath() {
    return this.configService.get('BASE_PATH');
  }

  get getEmailHost() {
    return this.configService.get('EMAIL_HOST');
  }

  get getEmailUser() {
    return this.configService.get('EMAIL_USER');
  }

  get getEmailPassword() {
    return this.configService.get('EMAIL_PASS');
  }

  get getSMSAPI() {
    return this.configService.get('SMS_API');
  }

  get getSMSUsername() {
    return this.configService.get('SMS_USERNAME');
  }

  get getSMSPassword() {
    return this.configService.get('SMS_PASSWORD');
  }
}
