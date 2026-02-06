import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import CategoryService from '../services/category.service';

export default class CategoryController {
  private categoryService = new CategoryService();

  public getAllCategories = async (_req: Request, res: Response): Promise<Response> => {
    try {
      const categories = await this.categoryService.getAllCategories();
      return res.status(200).json(categories);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi lấy danh sách danh mục'
      });
    }
  };

  public getCategoryById = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      const category = await this.categoryService.getCategoryById(id);
      return res.status(200).json(category);
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public createCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const categoryData = req.body;
      const category = await this.categoryService.createCategory(categoryData);
      
      return res.status(201).json({
        message: 'Tạo danh mục thành công',
        category
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || 'Lỗi khi tạo danh mục'
      });
    }
  };

  public updateCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const id = parseInt(req.params.id);
      const categoryData = req.body;
      
      const category = await this.categoryService.updateCategory(id, categoryData);
      return res.status(200).json({
        message: 'Cập nhật danh mục thành công',
        category
      });
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };

  public deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    try {
      const id = parseInt(req.params.id);
      await this.categoryService.deleteCategory(id);
      return res.status(200).json({
        message: 'Xóa danh mục thành công'
      });
    } catch (error: any) {
      return res.status(404).json({
        message: error.message
      });
    }
  };
} 