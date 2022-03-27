import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(3, 25)
  readonly username: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  readonly bio?: string;
}
