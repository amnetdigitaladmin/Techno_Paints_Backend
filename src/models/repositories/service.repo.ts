import { Category } from '../schemas/categories';
import { SubCategory } from '../schemas/subcategories';
import AppDataSource from "../../config/db";
import common from "../../helpers/utils/common";
import moment from 'moment';
import _ from 'lodash';
import 'moment-timezone';

const categoryRepository = AppDataSource.getRepository(Category);
const subcategoryRepository = AppDataSource.getRepository(SubCategory);

class serviceRepository {

    public async categorySave(obj: any) {
        try{
            return await categoryRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async subCategorySave(obj: any) {
        try{
            return await subcategoryRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async getCategoryByName(name: string) {
        try {
            return await categoryRepository
                .createQueryBuilder('req')
                .where('req.category=:category', { category: name })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getSubCategoryByName(name: string) {
        try {
            return await subcategoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                .where('req.subcategory=:subcategory', { subcategory: name })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getSubCategoryByNameAndCategoryId(name: string, categoryId:number) {
        try {
            return await subcategoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                .where('req.subcategory=:subcategory', { subcategory: name })
                .andWhere('req.category_id =:category_id', { category_id: categoryId })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllCategoriesListing() {
        try {
            return await categoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapMany('req.subcategories', SubCategory, 'sc', `req.id = sc.category_id and sc.is_deleted = false`)
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .getMany();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllCategories() {
        try {
            return await categoryRepository
                .createQueryBuilder('req')
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .getMany();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllSubCategoriesByCategoryId(id: number) {
        try {
            return await subcategoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .andWhere('req.category_id =:category_id', { category_id: id })
                .getMany();
        } catch (err) {
            console.log(err);
        }
    }

    
    public async findAllSubCategoriesByCategoryId(id: number) {
        try {
            return await categoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapMany('req.subcategories', SubCategory, 'sc', `req.id = sc.category_id and sc.is_deleted = false`)
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .andWhere('req.id =:id', { id: id })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }


}

export default new serviceRepository()