import { IsArray, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppCallRequestDto } from './app-call-request.dto';
import { CreateAssetDto } from './create-asset.dto';
import { AssetTransferRequestDto } from './asset-transfer-request.dto';
import { AlgoTransferRequestDto } from './algo-transfer-request.dto';
import { AssetClawbackRequestDto } from './asset-clawback-request.dto';

export class GroupRequestDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    required: false,
    example: 's3cr3t-passphrase',
    description:
      'Required when any step is sent by a real user (not `manager`): that user`s password, ' +
      'verified before their signing key is used. When several user-sent steps are present they ' +
      'must all belong to the same user / share this password.',
  })
  password?: string;

  @IsArray()
  @IsOptional()
  @ApiProperty({
    required: true,
    example: [
      { type: 'payment', payload: { toAddress: 'ADDR', amount: 1000, fromUserId: 'manager' } },
      { type: 'appCall', payload: { appId: 123, onComplete: 0, fromUserId: 'manager' } },
    ],
  })
  transactions: Array<
    | { type: 'payment'; payload: AlgoTransferRequestDto }
    | { type: 'appCall'; payload: AppCallRequestDto }
    | { type: 'assetConfig'; payload: CreateAssetDto }
    | { type: 'assetTransfer'; payload: AssetTransferRequestDto }
    | { type: 'assetClawback'; payload: AssetClawbackRequestDto }
  >;
}
