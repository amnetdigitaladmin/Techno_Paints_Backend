import { Request, Response } from "express";
import logger from '../middlewares/logger';
import ServiceRepository from '../models/repositories/service.repo';
import common from "../helpers/utils/common";


class RequestService {

    public async createCategory(req: Request, res: Response) {
        try {
            logger.info({ params: req.body, init: "createCategory" }, "createCategory method called");
            let params: any = req.body;
            params.created_by = req.meta.userId;
            let categoryInfo: any = await ServiceRepository.getCategoryByName(req.body.category);
            if (categoryInfo && categoryInfo.category) {
                return res.status(400).json({ status: 'Failed', message: "Category already exists" });
            }
            await ServiceRepository.categorySave(params);
            res.status(200).json({ status: 'success', message: 'Category Created Successfully' });
        } catch (error) {
            logger.error({ params: req.body, error: "createCategory" }, "createCategory method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }

    public async createSubCategory(req: Request, res: Response) {
        try {
            logger.info({ params: req.body, init: "createSubCategory" }, "createSubCategory method called");
            let params: any = req.body;
            params.created_by = req.meta.userId;
            params.subcategory = req.body.subcategory;
            params.category_id = req.body.category_id;
            let subCategoryInfo: any = await ServiceRepository.getSubCategoryByNameAndCategoryId(req.body.subcategory, req.body.category_id);
            if (subCategoryInfo && subCategoryInfo.subcategory) {
                return res.status(400).json({ status: 'Failed', message: "Subcategory already exists" });
            }
            await ServiceRepository.subCategorySave(params);
            res.status(200).json({ status: 'success', message: 'Subcategory Created Successfully' });
        } catch (error) {
            logger.error({ params: req.body, error: "createSubCategory" }, "createSubCategory method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }

    public async updateSubCategory(req: Request, res: Response) {
        try {
            logger.info({ params: '', init: "updateSubCategory" }, "updateSubCategory method called");
            let params: any = req.body;
            if (params.new_subcatogires && params.new_subcatogires.length > 0) {
                await common.asyncForEach(params.new_subcatogires, async (record: any) => {
                    let subCategoryInfo: any = await ServiceRepository.getSubCategoryByNameAndCategoryId(record.subcategory, req.body.category_id);
                    if (subCategoryInfo && subCategoryInfo.subcategory) {
                        return res.status(400).json({ status: 'Failed', message: "Subcategory already exists" });
                    }
                    let myObj: any = {}
                    myObj.created_by = req.meta.userId;
                    myObj.subcategory = record.subcategory;
                    myObj.category_id = req.body.category_id;
                    await ServiceRepository.subCategorySave(myObj);
                })
            }
            if (params.removed_subcatogires && params.removed_subcatogires.length > 0) {
                await common.asyncForEach(params.removed_subcatogires, async (item: any) => {
                    let subCategoryInfo: any = await ServiceRepository.findSubCategoryByNameAndCategoryId(item.subcategory, req.body.category_id);
                    if (subCategoryInfo && subCategoryInfo.subcategory) {
                        subCategoryInfo.updated_by = req.meta.userId;
                        subCategoryInfo.is_deleted = true;
                        subCategoryInfo.id = +subCategoryInfo.id;
                        await ServiceRepository.subCategorySave(subCategoryInfo);
                    }
                })
            }
            res.status(200).json({ status: 'success', message: 'Service Updated Successfully' });
        } catch (error) {
            logger.error({ params: '', error: "updateSubCategory" }, "updateSubCategory method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }

    public async getAllCategoriesListing(req: Request, res: Response) {
        try {
            logger.info({ params: '', init: "getAllCategoriesListing" }, "getAllCategoriesListing method called");
            let params: any = req.body;
            let categories: any = await ServiceRepository.getAllCategoriesListing();
            if (categories && categories.length > 0) {
                res.status(200).json({ status: 'success', data: categories });
            } else {
                res.status(200).json({ status: 'success', data: [] });
            }
        } catch (error) {
            logger.error({ params: '', error: "getAllCategoriesListing" }, "getAllCategoriesListing method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }

    public async getAllCategories(req: Request, res: Response) {
        try {
            logger.info({ params: '', init: "getAllCategories" }, "getAllCategories method called");
            let params: any = req.body;
            let categories: any = await ServiceRepository.getAllCategories();
            if (categories && categories.length > 0) {
                res.status(200).json({ status: 'success', data: categories });
            } else {
                res.status(200).json({ status: 'success', data: [] });
            }
        } catch (error) {
            logger.error({ params: '', error: "getAllCategories" }, "getAllCategories method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }
    public async getAllSubCategoriesByCategoryId(req: Request, res: Response) {
        try {
            logger.info({ params: '', init: "getAllSubCategoriesByCategoryId" }, "getAllSubCategoriesByCategoryId method called");
            let category: any = +req.params.id;
            let subcategories: any = await ServiceRepository.getAllSubCategoriesByCategoryId(category);
            if (subcategories && subcategories.length > 0) {
                res.status(200).json({ status: 'success', data: subcategories });
            } else {
                res.status(200).json({ status: 'success', data: [] });
            }
        } catch (error) {
            logger.error({ params: '', error: "getAllSubCategoriesByCategoryId" }, "getAllSubCategoriesByCategoryId method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }
    public async deleteCategoryByCategoryId(req: Request, res: Response) {
        try {
            logger.info({ params: '', init: "deleteCategoryByCategoryId" }, "deleteCategoryByCategoryId method called");
            let category: any = +req.params.id;
            let categories: any = await ServiceRepository.findAllSubCategoriesByCategoryId(category);
            if (categories && categories.id) {
                if (categories.subcategories && categories.subcategories.length > 0) {
                    await common.asyncForEach(categories.subcategories, async (item: any) => {
                        item.updated_by = req.meta.userId;
                        item.is_deleted = true;
                        item.id = +item.id;
                        await ServiceRepository.subCategorySave(item);
                    })
                }
                categories.updated_by = req.meta.userId;
                categories.is_deleted = true;
                categories.id = +categories.id;
                await ServiceRepository.categorySave(categories);
                res.status(200).json({ status: 'success', message: 'Service deleted successfully' });
            }
        } catch (error) {
            logger.error({ params: '', error: "deleteCategoryByCategoryId" }, "deleteCategoryByCategoryId method error: " + JSON.stringify(error));
            return res
                .status(500)
                .json({ status: "failed", message: "Internal Server Error" });
        }
    }

}

export default new RequestService();
