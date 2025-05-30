import { Request } from '../schemas/request';
import { Workflow } from '../schemas/workflow';
import AppDataSource from "../../config/db";
import common from "../../helpers/utils/common";
import moment from 'moment';
import _ from 'lodash';
import 'moment-timezone';

const requestRepository = AppDataSource.getRepository(Request);
const workflowRepository = AppDataSource.getRepository(Workflow);

class RequestRepository {

    public async save(obj: any) {
        try{
            return await requestRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async workflowSave(obj: any) {
        try{
            return await workflowRepository.save(obj)
        }catch(err){
            console.log(err);
            
        }
    }

    public async getReqById(id: number) {
        try {
            let data = await requestRepository
                .createQueryBuilder('req')
                .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                .leftJoinAndMapOne('amc.category', 'categories', 'category', 'amc.category_id = category.id')
                .leftJoinAndMapOne('amc.subcategory', 'subcategories', 'subcategory', 'amc.sub_category_id = subcategory.id')
                .where('req.id = :id', { id })
                .andWhere('req.is_deleted = false')
                .getOne();
            if (data?.client) {
                delete data.client.password;
                delete data.client.EncryptPassword;
            }
            if (data?.approver) {
                delete data.approver.password;
                delete data.approver.EncryptPassword;
            }

            return data;
        } catch (err) {
            console.log(err);
        }
    }

    public async getWorkflowByReqId(id: number, order: number) {
        try {
            return await workflowRepository
                .createQueryBuilder('req')
                .where('req.requestId = :requestId', { requestId: id })
                .andWhere('req.order = :order', { order: order })
                .andWhere('req.is_deleted = false')
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getWorkflowListing(id: number) {
        try {
            return await workflowRepository
                .createQueryBuilder('req')
                .where('req.requestId = :requestId', { requestId: id })
                .andWhere('req.is_deleted = false')
                .orderBy(`req.order`, 'ASC')
                .getMany();
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
                        `LOWER(client.full_name) LIKE :searchText`,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .select([
                        'req.id as id',
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .select([
                        'req.id as id',
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
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
                        `LOWER(client.full_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )

                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .select([
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
                    ])
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .select([
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
                    ])
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .getRawMany();

            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getAllRequestsByClientId(query: any) {
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
                        `LOWER(amc.amc_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .andWhere('req.client_id = :client_id', { client_id: query.meta.userId })
                    .select([
                        'req.id as id',
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .andWhere('req.client_id = :client_id', { client_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                   .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')                   
                    .select([
                        'req.id as id',
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
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

    public async getAllRequestsByClientIdCount(query: any) {
        try {
            let params: any = query.query
            if (params.search_text) {
                return await requestRepository
                    .createQueryBuilder('req')
                   .where(
                        `LOWER(amc.amc_name) LIKE :searchText `,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .andWhere('req.is_deleted = false')
                    .andWhere('req.client_id = :client_id', { client_id: query.meta.userId })
                    .select([
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
                    ])
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                   .andWhere('req.client_id = :client_id', { client_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                   .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')                   
                    .select([
                        'client.first_name AS client_first_name',
                        'client.last_name AS client_last_name',
                        'client.full_name AS client_full_name',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.area_in_sqft AS total_sqft',
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.approved_at AS approved_at',
                        'req.status AS status'
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
                .select([                   
                    `req.client_name AS "Client Name"`,
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