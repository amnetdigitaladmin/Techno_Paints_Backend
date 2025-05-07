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

    public async getAllRequestsDownload(query: any) {
        try {
            let params: any = query;
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
    
            const qb = requestRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .select([                   
                    `req.client_name AS "Client Name"`,                  
                    `req.material_type AS "Material Type"`,
                    `req.description AS "Description"`,
                    `req.quantity AS "Quantity"`,                  
                    `req.bp_name AS "Business Partner Name"`,
                    `req.status AS "Status"`,
                    `req.required_date AS "Required Date"`,                    
                    `req.comments AS "Comments"`,             
                ])
                .orderBy(`req.${order_by}`, sort_order)
                .skip(offSet - 1)
                .take(Limit);
    
            // Optional date range filter
            if (params.from_date && params.to_date) {
                qb.andWhere('req.required_date BETWEEN :from AND :to', {
                    from: params.from_date,
                    to: params.to_date,
                });
            }    
            return await qb.getRawMany();
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllBPRequestsDownload(query: any) {
        try {
            let params: any = query;
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
    
            const qb = requestRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .where('req.bp_id = :bp_id', { bp_id: query.userId })
                .select([                   
                    `req.client_name AS "Client Name"`,                  
                    `req.material_type AS "Material Type"`,
                    `req.description AS "Description"`,
                    `req.quantity AS "Quantity"`,                  
                    `req.bp_name AS "Business Partner Name"`,
                    `req.status AS "Status"`,
                    `req.required_date AS "Required Date"`,                    
                    `req.comments AS "Comments"`,             
                ])
                .orderBy(`req.${order_by}`, sort_order)
                .skip(offSet - 1)
                .take(Limit);
    
            // Optional date range filter
            if (params.from_date && params.to_date) {
                qb.andWhere('req.required_date BETWEEN :from AND :to', {
                    from: params.from_date,
                    to: params.to_date,
                });
            }    
            return await qb.getRawMany();
        } catch (error) {
            console.log(error);
        }
    }

    public async getRequestStatusCounts(): Promise<any> {
        try {
            // Define expected statuses
            const expectedStatuses = ['Pending', 'Accepted', 'Rejected'];

            // Initialize counts to 0
            const statusMap: Record<string, number> = {};
            expectedStatuses.forEach(status => statusMap[status] = 0);

            // Fetch actual counts from DB
            const result = await requestRepository
                .createQueryBuilder('req')
                .select(`req.status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })                
                .groupBy('req.status')
                .getRawMany();

            // Overwrite counts where data exists
            for (const row of result) {
                if (statusMap.hasOwnProperty(row.status)) {
                    statusMap[row.status] = parseInt(row.count);
                }
            }

            // Construct x and y arrays
            const x = expectedStatuses;
            const y = expectedStatuses.map(status => statusMap[status]);

            return { x, y };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get status counts');
        }
    }
    public async getRequestBPStatusCounts(user: number): Promise<any> {
        try {
            // Define expected statuses
            const expectedStatuses = ['Pending', 'Accepted', 'Rejected'];

            // Initialize counts to 0
            const statusMap: Record<string, number> = {};
            expectedStatuses.forEach(status => statusMap[status] = 0);

            // Fetch actual counts from DB
            const result = await requestRepository
                .createQueryBuilder('req')
                .select(`req.status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .andWhere('req.bp_id = :bp_id', { bp_id: user })
                .groupBy('req.status')
                .getRawMany();

            // Overwrite counts where data exists
            for (const row of result) {
                if (statusMap.hasOwnProperty(row.status)) {
                    statusMap[row.status] = parseInt(row.count);
                }
            }

            // Construct x and y arrays
            const x = expectedStatuses;
            const y = expectedStatuses.map(status => statusMap[status]);

            return { x, y };
        } catch (error) {
            console.error(error);
            throw new Error('Failed to get status counts');
        }
    }
    
    
    


}

export default new RequestRepository()