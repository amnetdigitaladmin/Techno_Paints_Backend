import { AMC } from '../schemas/AMC';
import AppDataSource from "../../config/db";
import common from "../../helpers/utils/common";
import moment from 'moment';
import _ from 'lodash';
import 'moment-timezone';

const AMCRepository = AppDataSource.getRepository(AMC);

class RequestRepository {

    public async save(obj: any) {
        try{
            return await AMCRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async getAMCById(id: number) {
        try {
            return await AMCRepository
                .createQueryBuilder('req')
                .where('req.id=:id', { id: id })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAllAMCs(query: any) {
        try {
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                return await AMCRepository
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
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
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

    public async getAllAMCsCount(query: any) {
        try {
            let params: any = query.query
            if (params.search_text) {
                return await AMCRepository
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
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllAMCsByBPId(query: any) {
        try {
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                return await AMCRepository
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
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .where('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
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

    public async getAllAMCsByBPIdCount(query: any) {
        try {
            let params: any = query.query
            if (params.search_text) {
                return await AMCRepository
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
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
                        'req.created_at as created_at',
                        'req.updated_at as updated_at',
                    ])
                    .getRawMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .where('req.bp_id = :bp_id', { bp_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id as id',
                        'req.client_name as client_name',
                        'req.client_id as client_id',                       
                        'req.amount as amount',
                        'req.bp_id as bp_id',
                        'req.bp_name as bp_name',  
                        'req.start_date as start_date',
                        'req.end_date as end_date',                   
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