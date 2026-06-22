import { Module } from '@nestjs/common';
import { WalletModule } from './wallet/wallet.module';
import { VaultModule } from './vault/vault.module';
import { ChainModule } from './chain/chain.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule, WalletModule, VaultModule, ChainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
