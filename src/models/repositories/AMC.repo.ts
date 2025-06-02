import { AMC } from '../schemas/AMC';
import AppDataSource from "../../config/db";
import common from "../../helpers/utils/common";
import moment from 'moment';
import _ from 'lodash';
import 'moment-timezone';
import { Category } from '../schemas/categories';
import { SubCategory } from '../schemas/subcategories';

const AMCRepository = AppDataSource.getRepository(AMC);

class amcRepository {

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
                .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                .where('req.id=:id', { id: id })
                .andWhere('req.is_deleted =:is_deleted', { is_deleted: false })
                .getOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAMCByName(name: string) {
        try {
            return await AMCRepository
                .createQueryBuilder('req')
                .where('req.amc_name=:amc_name', { amc_name: name })
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
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where(
                        `LOWER(req.client_name) LIKE :searchText or LOWER(req.amc_name) LIKE :searchText`,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    // .select([
                    //     'req.id as id',
                    //     'req.client_name as client_name',
                    //     'req.client_id as client_id',                       
                    //     'req.amc_name as amc_name',
                    //     'req.area_in_sqft as area_in_sqft',
                    //     'req.category_id as category_id',  
                    //     'req.sub_category_id as sub_category_id',  
                    //     'req.utilisation_per_year as utilisation_per_year',  
                    //     'req.start_date as start_date',
                    //     'req.end_date as end_date', 
                    //     'req.status as status',                  
                    //     'req.created_at as created_at',
                    //     'req.updated_at as updated_at',
                    // ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    // .select([
                    //     'req.id as id',
                    //     'req.client_name as client_name',
                    //     'req.client_id as client_id',                       
                    //     'req.amc_name as amc_name',
                    //     'req.area_in_sqft as area_in_sqft',
                    //     'c.category_id as category_id',  
                    //     'sc.sub_category_id as sub_category_id',  
                    //     'req.utilisation_per_year as utilisation_per_year',  
                    //     'req.start_date as start_date',
                    //     'req.end_date as end_date', 
                    //     'req.status as status',                  
                    //     'req.created_at as created_at',
                    //     'req.updated_at as updated_at',
                    // ])
                    .orderBy(`req.${order_by}`, sort_order)  // Use template literals for safety
                    .skip(offSet - 1)
                    .take(Limit)
                    .getMany();
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
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where(
                        `LOWER(req.client_name) LIKE :searchText or LOWER(req.amc_name) LIKE :searchText`,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    // .select([
                    //     'req.id as id',
                    //     'req.client_name as client_name',
                    //     'req.client_id as client_id',                       
                    //     'req.amc_name as amc_name',
                    //     'req.area_in_sqft as area_in_sqft',
                    //     'req.category_id as category_id',  
                    //     'req.sub_category_id as sub_category_id',  
                    //     'req.utilisation_per_year as utilisation_per_year',  
                    //     'req.start_date as start_date',
                    //     'req.end_date as end_date', 
                    //     'req.status as status',                  
                    //     'req.created_at as created_at',
                    //     'req.updated_at as updated_at',
                    // ])
                    .getMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    // .select([
                    //     'req.id as id',
                    //     'req.client_name as client_name',
                    //     'req.client_id as client_id',                       
                    //     'req.amc_name as amc_name',
                    //     'req.area_in_sqft as area_in_sqft',
                    //     'req.category_id as category_id',  
                    //     'req.sub_category_id as sub_category_id',  
                    //     'req.utilisation_per_year as utilisation_per_year',  
                    //     'req.start_date as start_date',
                    //     'req.end_date as end_date', 
                    //     'req.status as status',                  
                    //     'req.created_at as created_at',
                    //     'req.updated_at as updated_at',
                    // ])
                    .getMany();
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
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where(
                        `LOWER(req.client_name) LIKE :searchText or LOWER(req.amc_name) LIKE :searchText`,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )             
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    // .select([
                    //     'req.id as id',
                    //     'req.client_name as client_name',
                    //     'req.client_id as client_id',                       
                    //     'req.amc_name as amc_name',
                    //     'req.area_in_sqft as area_in_sqft',
                    //     'req.category_id as category_id',  
                    //     'req.sub_category_id as sub_category_id',  
                    //     'req.utilisation_per_year as utilisation_per_year',  
                    //     'req.start_date as start_date',
                    //     'req.end_date as end_date', 
                    //     'req.status as status',                  
                    //     'req.created_at as created_at',
                    //     'req.updated_at as updated_at',
                    // ])
                    .orderBy(`req.${order_by}`, sort_order)
                    .skip(offSet - 1) // Assuming `offSet` is zero-based
                    .take(Limit)
                    .getMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)             
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })
                    .orderBy(`req.${order_by}`, sort_order)  // Use template literals for safety
                    .skip(offSet - 1)
                    .take(Limit)
                    .getMany();
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
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
                    .where(
                        `LOWER(req.client_name) LIKE :searchText or LOWER(req.amc_name) LIKE :searchText`,
                        { searchText: `%${params.search_text.toLowerCase()}%` },
                    )               
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })       
                    .getMany();
            } else {
                return await AMCRepository
                    .createQueryBuilder('req')
                    .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
                    .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)                  
                    .where('req.is_deleted = :is_deleted', { is_deleted: false })                   
                    .getMany();
            }
        } catch (error) {
            console.log(error);
        }
    }

    public async getActiveContracts() {
        try {
            return await AMCRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .andWhere('req.status =:status', { status: 'Active' })
                .getCount();
        } catch (err) {
            console.log(err);
        }
    }

    public async getTotalContracts() {
        try {
            return await AMCRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted =:is_deleted', { is_deleted: false })                
                .getCount();
        } catch (err) {
            console.log(err);
        }
    }

    public async getAmountContracts() {
        try {
            return await AMCRepository
            .createQueryBuilder('req')
            .select('SUM(CAST(req.area_in_sqft AS DECIMAL))', 'total')
            .where('req.is_deleted = :is_deleted', { is_deleted: false })
            .andWhere('req.status = :status', { status: 'Active' })
            .getRawOne();
        } catch (err) {
            console.log(err);
        }
    }

    public async getBPActiveContracts(client_id:any) {
        try {
            return await AMCRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted =:is_deleted', { is_deleted: false })
                .andWhere('req.client_id = :client_id', { client_id: client_id })     
                .andWhere('req.status =:status', { status: 'Active' })
                .getCount();
        } catch (err) {
            console.log(err);
        }
    }

    public async getBPTotalContracts(client_id:any) {
        try {
            return await AMCRepository
                .createQueryBuilder('req')               
                .where('req.is_deleted =:is_deleted', { is_deleted: false }) 
                .andWhere('req.client_id = :client_id', { client_id: client_id })     
                .getCount();
        } catch (err) {
            console.log(err);
        }
    }

    public async getBPAmountContracts(client_id:any) {
        try {
            return await AMCRepository
            .createQueryBuilder('req')
            .select('SUM(CAST(req.area_in_sqft AS DECIMAL))', 'total')
            .where('req.is_deleted = :is_deleted', { is_deleted: false })   
            .andWhere('req.client_id = :client_id', { client_id: client_id })       
            .andWhere('req.status = :status', { status: 'Active' })
            .getRawOne();
        } catch (err) {
            console.log(err);
        }
    }
    
   // Reports
public async getAllAMCsForDownload(query: any) {
    try {
        let params: any = query;
        let offSet = params.offset ? params.offset : 1;
        let Limit = params.limit ? params.limit : 10000;
        let order_by = params.order_by ? params.order_by : 'updated_at';
        let sort_order = params.sort_order ? params.sort_order : 'DESC';
        let fromDate = params.from_date;
        let toDate = params.to_date;

        const qb = AMCRepository
            .createQueryBuilder('req')
            .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
            .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
            .where('req.is_deleted = :is_deleted', { is_deleted: false })
            // .select([
            //     'req.id as id',
            //     'req.client_name as client_name',
            //     'req.client_id as client_id',                       
            //     'req.amc_name as amc_name',
            //     'req.area_in_sqft as area_in_sqft',
            //     'req.category_id as category_id',  
            //     'req.sub_category_id as sub_category_id',  
            //     'req.utilisation_per_year as utilisation_per_year',  
            //     'req.start_date as start_date',
            //     'req.end_date as end_date', 
            //     'req.status as status',                  
            //     'req.created_at as created_at',
            //     'req.updated_at as updated_at',
            // ])
            

        if (fromDate && toDate) {
            qb.andWhere('req.start_date >= :fromDate AND req.end_date <= :toDate', {
                fromDate,
                toDate
            });
        }
        return await qb
            .orderBy(`req.${order_by}`, sort_order)
            .skip(offSet - 1)
            .take(Limit)
            .getRawMany();

    } catch (error) {
        console.log(error);
    }
}

   // Reports
public async getAllAMCsBPForDownload(query: any) {
    try {
        let params: any = query;
        let offSet = params.offset ? params.offset : 1;
        let Limit = params.limit ? params.limit : 10000;
        let order_by = params.order_by ? params.order_by : 'updated_at';
        let sort_order = params.sort_order ? params.sort_order : 'DESC';
        let fromDate = params.from_date;
        let toDate = params.to_date;

        const qb = AMCRepository
            .createQueryBuilder('req')
            .leftJoinAndMapOne('req.category_id', Category, 'c', `req.category_id = c.id`)
            .leftJoinAndMapOne('req.sub_category_id', SubCategory, 'sc', `req.sub_category_id = sc.id`)
            .where('req.is_deleted = :is_deleted', { is_deleted: false })          
            .andWhere('req.client_id = :client_id', { client_id: params.userId })   

        if (fromDate && toDate) {
            qb.andWhere('req.start_date >= :fromDate AND req.end_date <= :toDate', {
                fromDate,
                toDate
            });
        }
        return await qb
            .orderBy(`req.${order_by}`, sort_order)
            .skip(offSet - 1)
            .take(Limit)
            .getRawMany();

    } catch (error) {
        console.log(error);
    }
} 

public async getAMCChartData(filter: any) {
    try {
      const { filterType, date, startDate, endDate } = filter;
  
      const query = AMCRepository.createQueryBuilder('amc')
        .select('COALESCE(SUM(CAST(amc.amount AS NUMERIC)), 0)::int', 'value')
        .where('amc.amount IS NOT NULL')
        .andWhere('amc.is_deleted = false');
  
      let groupBy = '';
      let labelExpr = '';
  
      switch (filterType) {
        case 'year':
          labelExpr = `TO_CHAR(amc.created_at, 'Mon')`;
          query.andWhere(
            `DATE_TRUNC('year', amc.created_at) = DATE_TRUNC('year', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'month':
          labelExpr = `TO_CHAR(amc.created_at, 'DD')`;
          query.andWhere(
            `DATE_TRUNC('month', amc.created_at) = DATE_TRUNC('month', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'week':
          labelExpr = `TO_CHAR(amc.created_at, 'Dy')`;
          query.andWhere(
            `DATE_TRUNC('week', amc.created_at) = DATE_TRUNC('week', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'day':
          labelExpr = `TO_CHAR(amc.created_at, 'HH24:00')`;
          query.andWhere(
            `DATE_TRUNC('day', amc.created_at) = DATE_TRUNC('day', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'custom':
          labelExpr = `TO_CHAR(amc.created_at, 'YYYY-MM-DD')`;
          query.andWhere(
            `amc.created_at::date BETWEEN :startDate AND :endDate`,
            { startDate, endDate }
          );
          break;
  
        default:
          throw new Error('Invalid filter type');
      }
  
      // Add label select and group/order
      query.addSelect(labelExpr, 'label');
      query.groupBy(labelExpr);
      query.orderBy(labelExpr, 'ASC');
  
      const result = await query.getRawMany();
  
      const xAxis: string[] = result.map((row: any) => row.label);
      const yAxis: number[] = result.map((row: any) => parseInt(row.value, 10));
  
      return {
        x: xAxis,
        y: yAxis
      };
  
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate chart data');
    }
  }

  public async getBPAMCChartData(filter: any) {
    try {
      const { filterType, date, startDate, endDate } = filter;
  
      const query = AMCRepository.createQueryBuilder('amc')
        .select('COALESCE(SUM(CAST(amc.amount AS NUMERIC)), 0)::int', 'value')
        .where('amc.amount IS NOT NULL')
        .andWhere('amc.is_deleted = false')
     
  
      let groupBy = '';
      let labelExpr = '';
  
      switch (filterType) {
        case 'year':
          labelExpr = `TO_CHAR(amc.created_at, 'Mon')`;
          query.andWhere(
            `DATE_TRUNC('year', amc.created_at) = DATE_TRUNC('year', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'month':
          labelExpr = `TO_CHAR(amc.created_at, 'DD')`;
          query.andWhere(
            `DATE_TRUNC('month', amc.created_at) = DATE_TRUNC('month', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'week':
          labelExpr = `TO_CHAR(amc.created_at, 'Dy')`;
          query.andWhere(
            `DATE_TRUNC('week', amc.created_at) = DATE_TRUNC('week', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'day':
          labelExpr = `TO_CHAR(amc.created_at, 'HH24:00')`;
          query.andWhere(
            `DATE_TRUNC('day', amc.created_at) = DATE_TRUNC('day', TO_DATE(:date, 'YYYY-MM-DD'))`,
            { date }
          );
          break;
  
        case 'custom':
          labelExpr = `TO_CHAR(amc.created_at, 'YYYY-MM-DD')`;
          query.andWhere(
            `amc.created_at::date BETWEEN :startDate AND :endDate`,
            { startDate, endDate }
          );
          break;
  
        default:
          throw new Error('Invalid filter type');
      }
  
      // Add label select and group/order
      query.addSelect(labelExpr, 'label');
      query.groupBy(labelExpr);
      query.orderBy(labelExpr, 'ASC');
  
      const result = await query.getRawMany();
  
      const xAxis: string[] = result.map((row: any) => row.label);
      const yAxis: number[] = result.map((row: any) => parseInt(row.value, 10));
  
      return {
        x: xAxis,
        y: yAxis
      };
  
    } catch (err) {
      console.error(err);
      throw new Error('Failed to generate chart data');
    }
  }

  public async getAllAMCsByClientId(query: any) {
        try {
            let params: any = query.query          
                return await AMCRepository
                    .createQueryBuilder('req')
                    .where('req.client_id = :client_id', { client_id: query.meta.userId })
                    .andWhere('req.is_deleted = :is_deleted', { is_deleted: false })
                    .andWhere('req.status = :status', { status: 'Active' })                                 
                    .getMany();
            
        } catch (error) {
            console.log(error);
        }
    }
  


}

export default new amcRepository()