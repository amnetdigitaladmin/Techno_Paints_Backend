import { Request, Response } from "express";
import logger from '../middlewares/logger';
import AMCRepository from '../models/repositories/AMC.repo';
import userRepository from '../models/repositories/user.repo';
import { NotificationRequestType, RequestGroup } from '../helpers/utils/enum' 
import EmailService from './notification.service';


class RequestService {

  public async createAMC(req: Request, res: Response) {
    try {
      logger.info({ params: req.body, init: "createAMC" }, "createAMC method called");
      let params: any = req.body;
      params.created_by = req.meta.userId;
      let amcInfo: any = await AMCRepository.getAMCByName(req.body.amc_name);
      if (amcInfo && amcInfo.amc_name) {
        return res.status(400).json({ status: 'Failed', message: "AMC Name already exists" });
      }
      await AMCRepository.save(params);
       let ClientDetails: any = await userRepository.getById(+req.body.client_id)
            let admins: any = await userRepository.getAdminUsers()
            if (admins && admins.length > 0) {
              const notificationPayload: any = [];
              await admins.map((item:any)=>{
                notificationPayload.push({
                empId: +item.id,
                type: NotificationRequestType.request_raised,
                request_group: RequestGroup.CLIENT,
                content: {
                  title: `AMC created `,
                  data: `Created an AMC named "${req.body.amc_name}" for ${req.body.total_area_in_sqft} sqft. Duration: ${req.body.start_date} to ${req.body.end_date}. Client: ${ClientDetails?.full_name || 'NA'}.`
                },         
              })
              })    
                notificationPayload.push({
                empId: + req.meta.userId,
                type: NotificationRequestType.request_raised,
                request_group: RequestGroup.CLIENT,
                content: {
                  title: `Raised Request`,
                  data: `AMC ${req.body.amc_name} created for ${req.body.total_area_in_sqft} sqft for the duration ${req.body.start_date} - ${req.body.end_date}.`
                },         
              }) 
              await EmailService.sendMessage({ payload: notificationPayload })
            }
      res.status(200).json({ status: 'success', message: 'AMC Created Successfully' });
    } catch (error) {
      logger.error({ params: req.body, error: "createAMC" }, "createAMC method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async updateAMC(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "updateAMC" }, "updateAMC method called");
      let AMCId: any = +req.params.id;
      let params: any = req.body;
      let AMCInfo: any = await AMCRepository.getAMCById(AMCId);
      if (AMCInfo.start_date !== params.start_date && AMCInfo.end_date !== params.end_date) {
        AMCInfo = { ...AMCInfo, ...params };
        AMCInfo.remaining_area_in_sqft = AMCInfo.total_area_in_sqft;
        AMCInfo.utilized_percentage = 0;
        AMCInfo.remaining_utilize_percentage = 5;
        AMCInfo.carry_forwarded_percentage = 0;
        AMCInfo.updated_by = req.meta.userId || 0;
        await AMCRepository.save(AMCInfo);
      } else {
        AMCInfo = { ...AMCInfo, ...params };
        await AMCRepository.save(AMCInfo);
      }
      res.status(200).json({ status: 'success', message: 'AMC Updated Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "updateAMC" }, "updateAMC method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }


  public async getAMCById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAMCById" }, "getAMCById method called");
      let AMCId: any = +req.params.id;
      let AMCInfo: any = await AMCRepository.getAMCById(AMCId);
      res.status(200).json({ status: 'success', data: AMCInfo.id ? AMCInfo : {} });
    } catch (error) {
      logger.error({ params: '', error: "getAMCById" }, "getAMCById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async deleteAMCById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "deleteAMCById" }, "deleteAMCById method called");
      let AMCId: any = +req.params.id;
      let AMCInfo: any = await AMCRepository.getAMCById(AMCId);
      AMCInfo.id = +AMCInfo.id;
      AMCInfo.updated_by = req.meta.userId || 0;
      AMCInfo.is_deleted = true;
      await AMCRepository.save(AMCInfo);
      res.status(200).json({ status: 'success', message: 'AMC Deleted Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "deleteAMCById" }, "deleteAMCById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllAMCs(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllAMCs" }, "getAllAMCs method called");
      let AMCInfo: any = await AMCRepository.getAllAMCs(req);
      let count: any = await AMCRepository.getAllAMCsCount(req);
      if (AMCInfo && AMCInfo.length > 0) {
        res.status(200).json({ status: 'success', data: AMCInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllAMCs" }, "getAllAMCs method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllBPAMCs(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllBPAMCs" }, "getAllBPAMCs method called");
      let AMCInfo: any = await AMCRepository.getAllAMCsByBPId(req);
      let count: any = await AMCRepository.getAllAMCsByBPIdCount(req);
      if (AMCInfo && AMCInfo.length > 0) {
        res.status(200).json({ status: 'success', data: AMCInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllBPAMCs" }, "getAllBPAMCs method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllClientAMCs(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllClientAMCs" }, "getAllClientAMCs method called");
      let AMCInfo: any = await AMCRepository.getAllAMCsByClientId(req);     
      if (AMCInfo && AMCInfo.length > 0) {
        res.status(200).json({ status: 'success', data: AMCInfo });
      } else {
        res.status(200).json({ status: 'success', data: [] });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllClientAMCs" }, "getAllClientAMCs method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllClientAMCsListing(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllClientAMCsListing" }, "getAllClientAMCsListing method called");
      let AMCInfo: any = await AMCRepository.getAllClientAMCs(req);
      let count: any = await AMCRepository.getAllClientAMCsCount(req);
      if (AMCInfo && AMCInfo.length > 0) {
        res.status(200).json({ status: 'success', data: AMCInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllClientAMCsListing" }, "getAllClientAMCsListing method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

}

export default new RequestService();
