import NguoiBan from '../models/NguoiBan.model';
import DanhMuc from '../models/DanhMuc.model';
import KhachHang from '../models/KhachHang.model';
import { sequelize } from '../config/db.config';

export default class VendorService {
  /**
   * Đăng ký người bán với AUTO-APPROVE.
   * Mô hình platform: không cần Admin duyệt — vendor được kích hoạt ngay.
   * KhachHang.MaVaiTro được nâng lên 3 (Người bán) sau khi apply thành công.
   */
  public async applyVendor(data: {
    MaKhachHang: number;
    LoaiHinh: 'CA_NHAN' | 'DOANH_NGHIEP';
    TenCuaHang?: string;
    DiaChiKinhDoanh: string;
    EmailLienHe?: string;
    MaDanhMucChinh?: number;
    categories?: number[];
    SoDienThoaiLienHe: string;
    agreed: boolean;
  }) {
    if (!data.agreed) {
      throw new Error('Bạn phải đồng ý với điều khoản và chính sách hoạt động');
    }

    const existing = await NguoiBan.findOne({ where: { MaKhachHang: data.MaKhachHang } });
    if (existing && existing.TrangThai !== 'REJECTED') {
      throw new Error('Bạn đã gửi hồ sơ hoặc đã là người bán');
    }

    const t = await sequelize.transaction();
    try {
      let vendor: NguoiBan;

      if (existing && existing.TrangThai === 'REJECTED') {
        // Tái kích hoạt hồ sơ bị từ chối — auto-approve ngay
        await existing.update({
          LoaiHinh: data.LoaiHinh,
          TenCuaHang: data.TenCuaHang,
          DiaChiKinhDoanh: data.DiaChiKinhDoanh,
          EmailLienHe: data.EmailLienHe,
          MaDanhMucChinh: data.MaDanhMucChinh,
          SoDienThoaiLienHe: data.SoDienThoaiLienHe,
          TrangThai: 'APPROVED',
          LyDoTuChoi: null,
          NgayDuyet: new Date(),
        }, { transaction: t });
        vendor = existing;
      } else {
        // Tạo mới — auto-approve ngay lập tức
        const maDanhMucChinh = (data.MaDanhMucChinh || (data.categories && data.categories[0])) as number;
        vendor = await NguoiBan.create({
          MaKhachHang: data.MaKhachHang,
          LoaiHinh: data.LoaiHinh,
          TenCuaHang: data.TenCuaHang,
          DiaChiKinhDoanh: data.DiaChiKinhDoanh,
          EmailLienHe: data.EmailLienHe,
          MaDanhMucChinh: maDanhMucChinh,
          SoDienThoaiLienHe: data.SoDienThoaiLienHe,
          TrangThai: 'APPROVED',
          NgayDuyet: new Date(),
        }, { transaction: t });

        if (data.categories && data.categories.length > 0) {
          const values = data.categories.map(catId => `(${vendor.MaNguoiBan}, ${catId})`).join(',');
          await sequelize.query(
            `INSERT INTO NguoiBanDanhMuc (MaNguoiBan, MaDanhMuc) VALUES ${values}`,
            { transaction: t }
          );
        } else if (data.MaDanhMucChinh) {
          await sequelize.query(
            `INSERT INTO NguoiBanDanhMuc (MaNguoiBan, MaDanhMuc) VALUES (${vendor.MaNguoiBan}, ${data.MaDanhMucChinh})`,
            { transaction: t }
          );
        }
      }

      // Nâng role KhachHang → 3 (Người bán)
      await KhachHang.update(
        { MaVaiTro: 3 },
        { where: { MaKhachHang: data.MaKhachHang }, transaction: t }
      );

      await t.commit();
      return vendor;
    } catch (e) {
      await t.rollback();
      throw e;
    }
  }

  public async getMyVendorProfile(khachHangId: number) {
    return await NguoiBan.findOne({
      where: { MaKhachHang: khachHangId },
      include: [{ model: DanhMuc, as: 'DanhMucs' }, { model: KhachHang, as: 'KhachHang' }],
    });
  }

  public async updateVendorProfile(khachHangId: number, data: {
    DiaChiKinhDoanh?: string;
    TenCuaHang?: string;
    LoaiHinh?: 'CA_NHAN' | 'DOANH_NGHIEP';
    EmailLienHe?: string;
    SoDienThoaiLienHe?: string;
  }) {
    const vendor = await NguoiBan.findOne({ where: { MaKhachHang: khachHangId } });
    if (!vendor) throw new Error('Không tìm thấy hồ sơ người bán');
    if (vendor.TrangThai !== 'APPROVED') throw new Error('Chỉ có thể cập nhật thông tin khi hồ sơ đã được phê duyệt');

    const updateData: any = {};
    if (data.DiaChiKinhDoanh !== undefined) updateData.DiaChiKinhDoanh = data.DiaChiKinhDoanh;
    if (data.TenCuaHang !== undefined) updateData.TenCuaHang = data.TenCuaHang;
    if (data.LoaiHinh !== undefined) updateData.LoaiHinh = data.LoaiHinh;
    if (data.EmailLienHe !== undefined) updateData.EmailLienHe = data.EmailLienHe;
    if (data.SoDienThoaiLienHe !== undefined) updateData.SoDienThoaiLienHe = data.SoDienThoaiLienHe;

    await vendor.update(updateData);
    return vendor;
  }
}
