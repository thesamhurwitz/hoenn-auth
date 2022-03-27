import { IsEmail, IsString, Length } from 'class-validator';

export class SignupDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(3, 25)
  readonly username: string;

  @IsString()
  @Length(8, 32)
  readonly password: string;
}
