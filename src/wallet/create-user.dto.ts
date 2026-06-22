import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @ApiProperty({
    example: '1234',
    description: 'The unique identifier of the User',
  })
  user_id: string;

  @IsString()
  @MinLength(1)
  @ApiProperty({
    example: 's3cr3t-passphrase',
    description:
      'Password that protects this user`s signing key. It is hashed (scrypt) and stored in Vault; ' +
      'the same password must be supplied to spend the user`s Algos (`transfer-algo`, `app-call`, ' +
      '`group-transaction`) and to export the user`s private key.',
  })
  password: string;
}
