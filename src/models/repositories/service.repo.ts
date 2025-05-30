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

    public async findSubCategoryByNameAndCategoryId(name: string, categoryId:number) {
        try {
            return await subcategoryRepository
                .createQueryBuilder('req')
                .where('req.subcategory=:subcategory', { subcategory: name })
                .andWhere('req.category_id =:category_id', { category_id: categoryId })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllCategoriesListing(query: any) {
        try {
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                return await categoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapMany('req.subcategories', SubCategory, 'sc', `req.id = sc.category_id and sc.is_deleted = false`)
                .where(
                    `(LOWER(req.category) LIKE :searchText)`,
                    { searchText: `%${params.search_text.toLowerCase()}%` },
                )
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .orderBy(`req.${order_by}`, sort_order)
                .skip(offSet - 1) 
                .take(Limit)
                .getManyAndCount();
            }else{
                return await categoryRepository
                .createQueryBuilder('req')
                .leftJoinAndMapMany('req.subcategories', SubCategory, 'sc', `req.id = sc.category_id and sc.is_deleted = false`)
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .orderBy(`req.${order_by}`, sort_order)
                .skip(offSet - 1) 
                .take(Limit)
                .getManyAndCount();
            }
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