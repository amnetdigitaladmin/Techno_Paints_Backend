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
        try {
            return await requestRepository.save(obj)
        } catch (err) {
            console.log(err);

        }
    }

    public async workflowSave(obj: any) {
        try {
            return await workflowRepository.save(obj)
        } catch (err) {
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

    public async findWorkflowByReqId(id: number) {
        try {
            return await workflowRepository
            .createQueryBuilder('req')
            .where('req.requestId = :requestId', { requestId: id })
            .andWhere('req.title != :excludedTitle', { excludedTitle: 'Client Feedback' })
            .andWhere('req.is_deleted = false')
            .getMany();        
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
            console.log('testssss')
            let params: any = query.query
            let offSet = params.offset ? params.offset : 1;
            let Limit = params.limit ? params.limit : 10000;
            let order_by = params.order_by ? params.order_by : 'updated_at';
            let sort_order = params.sort_order ? params.sort_order : 'DESC';
            if (params.search_text) {
                const searchText = params.search_text ? `%${params.search_text.toLowerCase()}%` : '%%';
                return await requestRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .where('LOWER(amc.amc_name) LIKE :searchText', { searchText })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .select([
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft',
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
                    ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1)
                    .take(Limit)
                    .getRawMany();
            } else {
                return await requestRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                    .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                    .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                    .where('req.is_deleted = false')
                    .select([
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft',
                        'amc.utilisation_per_year as utilisation_per_year',  
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                        'req.id AS id',
                        'client.company AS company',
                        'approver.first_name AS approver_first_name',
                        'approver.last_name AS approver_last_name',
                        'approver.full_name AS approver_full_name',
                        'amc.amc_name AS amc_name',
                        'amc.total_area_in_sqft AS total_sqft',
                        // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                        'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                        'amc.utilisation_per_year as utilisation_per_year', 
                        // 'amc.utilized_percentage as utilized_percentage',
                        // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                        'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                        'req.required_date AS required_date',
                        'req.created_by AS created_by',
                        'req.requestAreaInsqft AS request_area_in_sqft',
                        'req.payable_area_in_sqft AS payable_area_in_sqft',
                        'req.utilized_percentage AS utilized_percentage',
                        'req.utilized_year AS utilized_year',
                        'req.approved_at AS approved_at',
                        'req.status AS status',
                        'req.client_comments AS client_comments',
                        'req.client_rating AS client_rating',
                        'req.completed_on AS completed_on'
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
                .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                .select([                      
                    'client.company AS company',
                    'approver.full_name AS approver_name',       // ✅ fixed
                    'amc.amc_name AS amc',
                    'amc.total_area_in_sqft AS total_sqft',            // ✅ fixed
                    // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                    'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                    'amc.utilisation_per_year as utilisation_per_year', 
                    // 'amc.utilized_percentage as utilized_percentage',
                    // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                    'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                    'req.required_date AS requested_date',       // ✅ fixed
                    'req.requestAreaInsqft AS request_area_in_sqft', // ✅ fixed
                    'req.payable_area_in_sqft AS payable_area_in_sqft',
                    'req.utilized_percentage AS utilized_percentage',
                    'req.utilized_year AS utilized_year',
                    'req.approved_at AS approved_at',
                    'req.status AS status',
                    'req.client_rating AS client_rating',
                    'req.completed_on AS completed_on'
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
            if (params.client_id) {
                qb.andWhere('req.client_id = :client_id', { client_id: params.client_id });
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
                .andWhere('req.client_id = :client_id', { client_id: params.userId })
                .leftJoinAndMapOne('req.amc', 'AMCs', 'amc', 'req.amc_id = amc.id')
                .leftJoinAndMapOne('req.client', 'users', 'client', 'req.client_id = client.id')
                .leftJoinAndMapOne('req.approver', 'users', 'approver', 'req.approved_by = approver.id')
                .select([                                  
                    'client.company AS company',
                    'approver.full_name AS approver_name',       // ✅ fixed
                    'amc.amc_name AS amc',
                    'amc.total_area_in_sqft AS total_sqft',            // ✅ fixed
                    // 'amc.requested_area_in_sqft as requested_area_in_sqft',
                    'amc.cumulative_free_area_in_sqft as cumulative_free_area_in_sqft', 
                    'amc.utilisation_per_year as utilisation_per_year', 
                    // 'amc.utilized_percentage as utilized_percentage',
                    // 'amc.remaining_utilize_percentage as remaining_utilize_percentage',
                    'amc.carry_forwarded_percentage as carry_forwarded_percentage', 
                    'req.required_date AS requested_date',       // ✅ fixed
                    'req.requestAreaInsqft AS request_area(sqft)', // ✅ fixed
                    'req.payable_area_in_sqft AS payable_area_in_sqft',
                    'req.utilized_percentage AS utilized_percentage',
                    'req.utilized_year AS utilized_year',
                    'req.approved_at AS approved_at',
                    'req.status AS status',
                    'req.client_rating AS client_rating',
                    'req.completed_on AS completed_on'
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
            const expectedStatuses = ['Pending', 'Accepted', 'Rejected','In-Progress','Completed'];

            // Initialize counts to 0
            const statusMap: Record<string, number> = {};
            expectedStatuses.forEach(status => statusMap[status] = 0);

            // Fetch actual counts from DB
            let result:any = await requestRepository
                .createQueryBuilder('req')
                .select(`req.status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .groupBy('req.status')
                .getRawMany();

     
            const workflowresult = await requestRepository
                .createQueryBuilder('req')
                .select(`req.workflow_status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .where('req.workflow_status IN (:...status)', { status: ['In-Progress', 'Completed'] })
                .groupBy('req.workflow_status')
                .getRawMany();
            result = result.concat(workflowresult)   
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
            const expectedStatuses =  ['Pending', 'Accepted', 'Rejected','In-Progress','Completed'];

            // Initialize counts to 0
            const statusMap: Record<string, number> = {};
            expectedStatuses.forEach(status => statusMap[status] = 0);

            // Fetch actual counts from DB
            let result:any = await requestRepository
                .createQueryBuilder('req')
                .select(`req.status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .andWhere('req.client_id = :client_id', { client_id: user })  
                .groupBy('req.status')
                .getRawMany();
                  const workflowresult = await requestRepository
                .createQueryBuilder('req')
                .select(`req.workflow_status`, 'status')
                .addSelect('COUNT(*)', 'count')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .andWhere('req.client_id = :client_id', { client_id: user })  
                .andWhere('req.workflow_status IN (:...status)', { status: ['In-Progress', 'Completed'] })
                .groupBy('req.workflow_status')
                .getRawMany();           
                result = result.concat(workflowresult)
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
    public async getTotalRequestsCount() {
        try {
            const qb = requestRepository
                .createQueryBuilder('req')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .select([
                    'req.id AS id'
                ])

            return await qb.getCount()
        } catch (error) {
            console.log(error);
        }
    }
    public async getTotalClientRequestsCount(client: any) {
        try {
            const qb = requestRepository
                .createQueryBuilder('req')
                .where('req.is_deleted = :is_deleted', { is_deleted: false })
                .andWhere('req.client_id = :client_id', { client_id: client })
                .select([
                    'req.id AS id'
                ])

            return await qb.getCount()
        } catch (error) {
            console.log(error);
        }
    }


}

export default new RequestRepository()