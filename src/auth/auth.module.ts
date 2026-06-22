import { Module } from '@nestjs/common';
import { VaultModule } from '../vault/vault.module';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';

/**
 * Auth surface for the service.
 *
 * `AuthService` + the global `AuthGuard` exchange a Vault token for a
 * JWT and gate every controller that does not opt out via `@Public()`.
 * The only public route is `/v1/auth/sign-in`, where the JWT is minted
 * in the first place.
 */
@Module({
  imports: [
    VaultModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [Auth],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
