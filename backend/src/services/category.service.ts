import DanhMuc from '../models/DanhMuc.model';
import { IDanhMuc } from '../interfaces/models.interface';

export default class CategoryService {
  public async getAllCategories() {
    try {
      const categories = await DanhMuc.findAll({
        order: [['TenDanhMuc', 'ASC']]
      });
      return categories;
    } catch (error) {
      throw error;
    }
  }

  public async getCategoryById(id: number) {
    try {
      const category = await DanhMuc.findByPk(id);
      
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  public async createCategory(categoryData: IDanhMuc) {
    try {
      const category = await DanhMuc.create({
        TenDanhMuc: categoryData.TenDanhMuc,
        HinhAnh: categoryData.HinhAnh
      });
      return category;
    } catch (error) {
      throw error;
    }
  }

  public async updateCategory(id: number, categoryData: Partial<IDanhMuc>) {
    try {
      const category = await DanhMuc.findByPk(id);
      
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      await category.update({
        TenDanhMuc: categoryData.TenDanhMuc,
        HinhAnh: categoryData.HinhAnh
      });
      return category;
    } catch (error) {
      throw error;
    }
  }

  public async deleteCategory(id: number) {
    try {
      const category = await DanhMuc.findByPk(id);
      
      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      await category.destroy();
      return true;
    } catch (error) {
      throw error;
    }
  }
} 