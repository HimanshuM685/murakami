import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExportPrivateKeyRequestDto {
  @IsString()
  @ApiProperty({
    example: 's3cr3t-passphrase',
    description:
      'The user`s password (the one set at user creation). It is verified against the stored ' +
      'scrypt hash before the private key is exported, so a stolen JWT alone is not enough to ' +
      'extract key material.',
  })
  password: string;
}

export class ExportPrivateKeyResponseDto {
  @IsString()
  @ApiProperty({
    example: '1234',
    description: 'The unique identifier of the User',
  })
  user_id: string;

  @IsString()
  @ApiProperty({
    example: 'I3345FUQQ2GRBHFZQPLYQQX5HJMMRZMABCHRLWV6RCJYC6OO4MOLEUBEGU',
    description: 'The public address of the User',
  })
  public_address: string;

  @IsString()
  @ApiProperty({
    example: '1',
    description: 'The Vault transit key version that was exported',
  })
  key_version: string;

  @IsString()
  @ApiProperty({
    example: 'gA2k3...base64...==',
    description:
      'The raw ed25519 private key material, base64-encoded, as returned by ' +
      "Vault's transit `export/signing-key` endpoint. Treat this value as " +
      'highly sensitive: anyone who obtains it can fully impersonate this user.',
  })
  private_key: string;
}
