import { Role } from '@prisma/client';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength
} from 'class-validator';

export class PatchUserDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  readonly email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  readonly bio?: string;

  @IsOptional()
  @IsEnum(Role)
  readonly role?: Role;

  @IsOptional()
  @IsString()
  readonly picture?: string;

  @IsOptional()
  @IsDate()
  readonly birthday?: Date;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female'])
  readonly gender?: string;

  // TODO: emails   String[]

  @IsOptional()
  @IsPhoneNumber()
  readonly phone?: string;
}
