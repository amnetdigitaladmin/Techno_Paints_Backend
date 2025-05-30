import { Request, Response } from "express";
import logger from '../middlewares/logger';
import RequestRepository from '../models/repositories/request.repo';
import { NotificationRequestType, RequestGroup } from '../helpers/utils/enum' 
import EmailService from './notification.service';
import moment from "moment";


class RequestService {

  public async AddRequest(req: Request, res: Response) {
    try {
      logger.info({ params: req.body, init: "AddRequest" }, "AddRequest method called");
      let params: any = req.body;
      params.created_by = req.meta.userId;
      params.client_id = req.meta.userId;
      params.required_date = moment().format('YYYY-MM-DD');
                // const notificationPayload: any = [];
                // notificationPayload.push({
                //   empId: +req.params.bpid,
                //   type: NotificationRequestType.request_raised,
                //   request_group: RequestGroup.ADMIN,
                //   content: {
                //     title: `Clients Assigned`,
                //     data: `New clients have been assigned to you. Please check your client list for details.`
                //   },
                //   employee_type: 'employee',
                // })
                // await EmailService.sendMessage({ payload: notificationPayload }) 
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
      params.approved_by = req.meta.userId;
      params.approved_at = moment().format('YYYY-MM-DD');
      let reqInfo: any = await RequestRepository.getReqById(requestId);
      reqInfo = { ...reqInfo, ...params };
      await RequestRepository.save(reqInfo);
      if (params.status === 'Accepted') {
        let myArray: any = [{
          title: 'Request Accepted',
          content: `Client Request Accepted`,
          created_by: 1,
          status: 'Completed',
          order: 1,
          requestId: +req.params.id
        },
        {
          title: 'Assign Execution Team',
          content: `Execution Team will assign shortly`,
          created_by: 1,
          status: 'Pending',
          order: 2,
          requestId: +req.params.id
        },
        {
          title: 'Execution Team Site Visit',
          content: `Execution Team, will Visit Client Site Soon`,
          created_by: 1,
          status: 'Pending',
          order: 3,
          requestId: +req.params.id
        },
        {
          title: 'Assign Workers',
          content: `Workers will Assign Shortly`,
          created_by: 1,
          status: 'Pending',
          order: 4,
          requestId: +req.params.id
        },
        {
          title: 'Work In-Progress',
          content: `Allocated Work In Progress`,
          created_by: 1,
          status: 'Pending',
          order: 5,
          requestId: +req.params.id
        },
        {
          title: 'Client Feedback',
          content: `Client Feedback is Pending`,
          created_by: 1,
          status: 'Pending',
          order: 6,
          requestId: +req.params.id
        }]
        await RequestRepository.workflowSave(myArray);
      }
      res.status(200).json({ status: 'success', message: `Request ${params.status} Successfully` });
    } catch (error) {
      logger.error({ params: '', error: "requestStatusUpdate" }, "requestStatusUpdate method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async workflowStatusUpdate(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "workflowStatusUpdate" }, "workflowStatusUpdate method called");
      let requestId: any = +req.params.id;
      let params: any = req.body;
      let workflowInfo: any = await RequestRepository.getWorkflowByReqId(requestId, params.order);
      if (workflowInfo) {
        const { title } = workflowInfo;
        workflowInfo.updated_by = req.meta.userId;
        workflowInfo.id = +workflowInfo.id;
        workflowInfo.status = 'Completed';
        switch (title) {
          case 'Assign Execution Team':
            workflowInfo.title = 'Execution Team Assigned';
            workflowInfo.content = 'Execution Team Assigned Successfully';
            break;

          case 'Execution Team Site Visit':
            workflowInfo.title = 'Execution Team Visited the Site';
            workflowInfo.content = 'Execution Team Visited the Site Successfully';
            break;

          case 'Assign Workers':
            workflowInfo.title = 'Workers are Assigned';
            workflowInfo.content = 'Workers are Assigned Successfully';
            break;

          case 'Work In-Progress':
            workflowInfo.title = 'Work Completed';
            workflowInfo.content = 'Allocated Work Completed Successfully';
            break;

          case 'Client Feedback':
            workflowInfo.title = 'Client Feedback';
            workflowInfo.content = 'Client Feedback Completed Successfully';
            break;

          default:
            // No action needed
            return;
        }
        await RequestRepository.workflowSave(workflowInfo);
        res.status(200).json({ status: 'success', message: `Worklow updated Successfully` });
      } else {
        return res
          .status(500)
          .json({ status: "failed", message: "Workflow Updation Failed" });
      }
    } catch (error) {
      logger.error({ params: '', error: "workflowStatusUpdate" }, "workflowStatusUpdate method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async workflowListing(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "workflowListing" }, "workflowListing method called");
      let requestId: any = +req.params.id;
      let params: any = req.body;
      let workflowInfo: any = await RequestRepository.getWorkflowListing(requestId);
      if (workflowInfo && workflowInfo.length > 0) {
        res.status(200).json({ status: 'success', data: workflowInfo });
      } else {
        res.status(200).json({ status: 'success', data: [] });
      }
    } catch (error) {
      logger.error({ params: '', error: "workflowListing" }, "workflowListing method error: " + JSON.stringify(error));
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

  public async getAllClientRequests(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllBPRequests" }, "getAllBPRequests method called");
      let reqInfo: any = await RequestRepository.getAllRequestsByClientId(req);
      let count: any = await RequestRepository.getAllRequestsByClientIdCount(req);
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
