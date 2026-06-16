import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ExportPrivateKeyRequestDto {
  @IsString()
  @ApiProperty({
    example: '3ab5dada-ec1d-34a6-19ed-d63c9f6eba9c',
    description: "Vault AppRole `role_id`, re-checked as a confirmation step before exporting the user's key.",
  })
  role_id: string;

  @IsString()
  @ApiProperty({
    example: 'e857e495-48b2-ab69-3cd1-99f6fe44ccc1',
    description: "Vault AppRole `secret_id`, re-checked as a confirmation step before exporting the user's key.",
  })
  secret_id: string;
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
