import { Request, Response } from "express";
import logger from '../middlewares/logger';
import AMCRepository from '../models/repositories/AMC.repo';


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
      AMCInfo = { ...AMCInfo, ...params };
      await AMCRepository.save(AMCInfo);
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
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllClientAMCs" }, "getAllClientAMCs method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

}

export default new RequestService();
