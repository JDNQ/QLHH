import { IsBoolean, IsIn, IsOptional } from 'class-validator';

export class UpdatePostStatusDto {
  @IsOptional()
  @IsIn(['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'])
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
