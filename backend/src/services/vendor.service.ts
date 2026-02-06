import { Op } from 'sequelize';
import NguoiBan from '../models/NguoiBan.model';
import DanhMuc from '../models/DanhMuc.model';
import KhachHang from '../models/KhachHang.model';
import { sequelize } from '../config/db.config';

export default class VendorService {
  public async applyVendor(data: {
    MaKhachHang: number;
    LoaiHinh: 'CA_NHAN' | 'DOANH_NGHIEP';
    TenCuaHang?: string;
    DiaChiKinhDoanh: string;
    EmailLienHe?: string;
    MaDanhMucChinh?: number; // legacy single
    categories?: number[]; // new multi select
    SoDienThoaiLienHe: string;
    agreed: boolean;
  }) {
    if (!data.agreed) throw new Error('Bạn phải đồng ý với điều khoản và chính sách hoạt động');

    // Nếu đã có hồ sơ vendor PENDING/APPROVED thì không tạo mới
    const existing = await NguoiBan.findOne({ where: { MaKhachHang: data.MaKhachHang } });
    if (existing && existing.TrangThai !== 'REJECTED') {
      throw new Error('Bạn đã gửi hồ sơ hoặc đã là người bán');
    }

    if (existing && existing.TrangThai === 'REJECTED') {
      await existing.update({
        LoaiHinh: data.LoaiHinh,
        TenCuaHang: data.TenCuaHang,
        DiaChiKinhDoanh: data.DiaChiKinhDoanh,
        EmailLienHe: data.EmailLienHe,
        MaDanhMucChinh: data.MaDanhMucChinh,
        SoDienThoaiLienHe: data.SoDienThoaiLienHe,
        TrangThai: 'PENDING',
        LyDoTuChoi: null,
        NgayDuyet: null,
      });
      return existing;
    }

    const t = await sequelize.transaction();
    try {
      const created = await NguoiBan.create({
      MaKhachHang: data.MaKhachHang,
      LoaiHinh: data.LoaiHinh,
      TenCuaHang: data.TenCuaHang,
      DiaChiKinhDoanh: data.DiaChiKinhDoanh,
      EmailLienHe: data.EmailLienHe,
        MaDanhMucChinh: (data.MaDanhMucChinh || (data.categories && data.categories[0])) as number,
      SoDienThoaiLienHe: data.SoDienThoaiLienHe,
      TrangThai: 'PENDING',
      }, { transaction: t });

      // Insert bridge rows if provided
      if (data.categories && data.categories.length > 0) {
        const values = data.categories.map(catId => `(${created.MaNguoiBan}, ${catId})`).join(',');
        await sequelize.query(`INSERT INTO NguoiBanDanhMuc (MaNguoiBan, MaDanhMuc) VALUES ${values}` , { transaction: t });
      } else if (data.MaDanhMucChinh) {
        await sequelize.query(`INSERT INTO NguoiBanDanhMuc (MaNguoiBan, MaDanhMuc) VALUES (${created.MaNguoiBan}, ${data.MaDanhMucChinh})`, { transaction: t });
      }

      await t.commit();
      return created;
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
    EmailLienHe?: string;
    SoDienThoaiLienHe?: string;
  }) {
    const vendor = await NguoiBan.findOne({
      where: { MaKhachHang: khachHangId }
    });

    if (!vendor) {
      throw new Error('Không tìm thấy hồ sơ người bán');
    }

    // Chỉ cho phép cập nhật nếu đã được phê duyệt
    if (vendor.TrangThai !== 'APPROVED') {
      throw new Error('Chỉ có thể cập nhật thông tin khi hồ sơ đã được phê duyệt');
    }

    const updateData: any = {};
    if (data.DiaChiKinhDoanh !== undefined) updateData.DiaChiKinhDoanh = data.DiaChiKinhDoanh;
    if (data.TenCuaHang !== undefined) updateData.TenCuaHang = data.TenCuaHang;
    if (data.EmailLienHe !== undefined) updateData.EmailLienHe = data.EmailLienHe;
    if (data.SoDienThoaiLienHe !== undefined) updateData.SoDienThoaiLienHe = data.SoDienThoaiLienHe;

    await vendor.update(updateData);
    return vendor;
  }

  public async listApplications(status: 'PENDING' | 'APPROVED' | 'REJECTED', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const { count, rows } = await NguoiBan.findAndCountAll({
      where: { TrangThai: status },
      include: [{ model: KhachHang, as: 'KhachHang' }, { model: DanhMuc, as: 'DanhMucs' }],
      limit,
      offset,
      order: [['MaNguoiBan', 'DESC']],
    });
    return { total: count, totalPages: Math.ceil(count / limit), currentPage: page, applications: rows };
  }
}


