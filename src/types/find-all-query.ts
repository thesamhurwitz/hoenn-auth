import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class FindAllQuery {
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(30)
  readonly take: number = 10;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  readonly skip: number = 0;
}
