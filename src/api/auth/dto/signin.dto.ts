import { IsString, Length } from 'class-validator';

export class SigninDto {
  @IsString()
  @Length(3, 25)
  readonly username: string;

  @IsString()
  @Length(8, 32)
  readonly password: string;
}
