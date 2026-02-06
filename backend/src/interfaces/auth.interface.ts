export interface ILoginDto {
  SoDienThoai: string;
  MatKhau: string;
}

export interface IRegisterDto {
  TenKhachHang: string;
  TenNhanVien?: string;
  SoDienThoai: string;
  MatKhau: string;
  DiaChi?: string;
  isNhanVien?: boolean;
}

export interface ITokenData {
  id: number;
  role: number;
  tokenId?: string;
  iat?: number;
  exp?: number;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface IRefreshTokenData {
  id: number;
  role: number;
  tokenId: string;
} 