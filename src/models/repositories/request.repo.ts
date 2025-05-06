import { Request } from '../schemas/request';
import AppDataSource from "../../config/db";
import common from "../../helpers/utils/common";
import moment from 'moment';
import _ from 'lodash';
import 'moment-timezone';

const requestRepository = AppDataSource.getRepository(Request);

class RequestRepository {

    public async save(obj: any) {
        try{
            return await requestRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async getReqById(id: number) {
        try {
            return await requestRepository
                .createQueryBuilder('req')
                .where('req.id=:id', { id: id })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllRequests(query: any) {
        try {
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where(
                        `(LOWER(req.client_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date',
                        'req.comments as comments',                      
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date',   
                        'req.comments as comments',                    
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)  // Use template literals for safety
                    .skip(offSet - 1)
                    .take(Limit)
                    .getRawMany();
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllRequestsCount(query: any) {
        try {
            let params: any = query.query
            if (params.search_text) {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where(
                        `(LOWER(req.client_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date', 
                        'req.comments as comments',                      
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date',   
                        'req.comments as comments',                    
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllRequestsByBPId(query: any) {
        try {
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where(
                        `(LOWER(req.client_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date',  
                        'req.comments as comments',                     
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date',  
                        'req.comments as comments',                     
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)  // Use template literals for safety
                    .skip(offSet - 1)
                    .take(Limit)
                    .getRawMany();
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllRequestsByBPIdCount(query: any) {
        try {
            let params: any = query.query
            if (params.search_text) {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where(
                        `(LOWER(req.client_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.status as status',
                        'req.required_date as required_date', 
                        'req.comments as comments',                      
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.material_type as material_type',
                        'req.description as description',
                        'req.quantity as quantity',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name', 
                        'req.status as status', 
                        'req.required_date as required_date', 
                        'req.comments as comments',                      
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            }
        } catch (error) {
            console.log(error);
        }
    }


}

export default new RequestRepository()