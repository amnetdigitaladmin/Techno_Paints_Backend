import { Request, Response } from "express";
import logger from '../middlewares/logger';
import RequestRepository from '../models/repositories/request.repo';


class RequestService {

  public async AddRequest(req: Request, res: Response) {
    try {
      logger.info({ params: req.body, init: "AddRequest" }, "AddRequest method called");
      let params: any = req.body;
      params.created_by = req.meta.userId;
      await RequestRepository.save(params);
      res.status(200).json({ status: 'success', message: 'Request Created Successfully' });
    } catch (error) {
      logger.error({ params: req.body, error: "AddRequest" }, "AddRequest method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async updateRequest(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "updateRequest" }, "updateRequest method called");
      let requestId: any = +req.params.id;
      let params: any = req.body;
      let reqInfo: any = await RequestRepository.getReqById(requestId);
      reqInfo = { ...reqInfo, ...params };
      await RequestRepository.save(reqInfo);
      res.status(200).json({ status: 'success', message: 'Request Updated Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "updateRequest" }, "updateRequest method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async requestStatusUpdate(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "requestStatusUpdate" }, "requestStatusUpdate method called");
      let requestId: any = +req.params.id;
      let params: any = req.body;
      let reqInfo: any = await RequestRepository.getReqById(requestId);
      reqInfo = { ...reqInfo, ...params };
      await RequestRepository.save(reqInfo);
      res.status(200).json({ status: 'success', message: `Request ${params.status} Successfully` });
    } catch (error) {
      logger.error({ params: '', error: "requestStatusUpdate" }, "requestStatusUpdate method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getRequestById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getRequestById" }, "getRequestById method called");
      let reqId: any = +req.params.id;
      let reqInfo: any = await RequestRepository.getReqById(reqId);
      res.status(200).json({ status: 'success', data: reqInfo.id ? reqInfo : {} });
    } catch (error) {
      logger.error({ params: '', error: "getRequestById" }, "getRequestById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async deleteRequestById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "deleteRequestById" }, "deleteRequestById method called");
      let reqId: any = +req.params.id;
      let reqInfo: any = await RequestRepository.getReqById(reqId);
      reqInfo.id = +reqInfo.id;
      reqInfo.updated_by = req.meta.userId || 0;
      reqInfo.is_deleted = true;
      await RequestRepository.save(reqInfo);
      res.status(200).json({ status: 'success', message: 'Request Deleted Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "deleteRequestById" }, "deleteRequestById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllRequests(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllRequests" }, "getAllRequests method called");
      let reqInfo: any = await RequestRepository.getAllRequests(req);
      let count: any = await RequestRepository.getAllRequestsCount(req);
      if (reqInfo && reqInfo.length > 0) {
        res.status(200).json({ status: 'success', data: reqInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllRequests" }, "getAllRequests method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllBPRequests(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllBPRequests" }, "getAllBPRequests method called");
      let reqInfo: any = await RequestRepository.getAllRequestsByBPId(req);
      let count: any = await RequestRepository.getAllRequestsByBPIdCount(req);
      if (reqInfo && reqInfo.length > 0) {
        res.status(200).json({ status: 'success', data: reqInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllBPRequests" }, "getAllBPRequests method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

}

export default new RequestService();
