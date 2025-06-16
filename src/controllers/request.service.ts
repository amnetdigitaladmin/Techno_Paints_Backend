import { Request, Response } from "express";
import logger from '../middlewares/logger';
import RequestRepository from '../models/repositories/request.repo';
import AMCRepository from '../models/repositories/AMC.repo';
import userRepository from '../models/repositories/user.repo';
import { NotificationRequestType, RequestGroup } from '../helpers/utils/enum' 
import EmailService from './notification.service';
import s3service from "./s3.service";
import moment from "moment";


class RequestService {

  public async AddRequest(req: Request, res: Response) {
    try {
      logger.info({ params: req.body, init: "AddRequest" }, "AddRequest method called");
      let params: any = req.body;
      params.created_by = req.meta.userId;
      params.client_id = req.meta.userId;
      params.required_date = moment().format('YYYY-MM-DD');
      let AMCInfo: any = await AMCRepository.getAMCById(params.amc_id);
      let offer_percentage:any = AMCInfo.carry_forwarded_percentage + 5;
      let AMCTransactionInfo: any = await AMCRepository.getAMCByAmcIdAndClientId(params.amc_id, AMCInfo.client_id);
      let clientUtilizedPercentage:any = 0;
      let decValue:any = `${offer_percentage}`;
      if (AMCTransactionInfo === 0) {
        const PercentageOfferArea = (parseFloat(decValue) * parseInt(AMCInfo.requestAreaInsqft)) / 100;
        const requestedPercentage = (parseInt(params.requestAreaInsqft) / parseInt(AMCInfo.total_area_in_sqft)) * 100;
        if (PercentageOfferArea > parseInt(params.requestAreaInsqft)) {
          clientUtilizedPercentage = offer_percentage - requestedPercentage;
          params.payable_area_in_sqft = 0;
        } else {
          clientUtilizedPercentage = offer_percentage;
          params.payable_area_in_sqft = parseInt(params.requestAreaInsqft) - PercentageOfferArea;
        }
      } else if (AMCTransactionInfo > 0 && AMCTransactionInfo < offer_percentage) {
        let finalper: any = offer_percentage - AMCTransactionInfo;
        const PercentageOfferArea = (parseInt(AMCInfo.total_area_in_sqft) * parseFloat(finalper)) / 100;
        const requestedPercentage = (parseInt(params.requestAreaInsqft) / parseInt(AMCInfo.total_area_in_sqft)) * 100;
        if (finalper > requestedPercentage) {
          params.payable_area_in_sqft = 0;
          clientUtilizedPercentage = finalper - requestedPercentage;
        } else {
          params.payable_area_in_sqft = parseInt(params.requestAreaInsqft) -  PercentageOfferArea;
          clientUtilizedPercentage = offer_percentage;
        }
      } else {
        clientUtilizedPercentage = 0;
        params.payable_area_in_sqft = parseInt(params.requestAreaInsqft);
      }
      params.utilized_percentage = clientUtilizedPercentage;
      await RequestRepository.save(params);
      let userDetails: any = await userRepository.getById(+req.meta.userId)
      let admins: any = await userRepository.getAdminUsers()
      if (admins && admins.length > 0) {
        const notificationPayload: any = [];
        await admins.map((item: any) => {
          notificationPayload.push({
            empId: +item.id,
            type: NotificationRequestType.request_raised,
            request_group: RequestGroup.CLIENT,
            content: {
              title: `Raised Request`,
              data: `${userDetails && userDetails.full_name ? userDetails.full_name : 'NA'} created a service request for ${params.requestAreaInsqft}sqft on ${params.required_date}.`
            },
          })
        })
        notificationPayload.push({
          empId: + req.meta.userId,
          type: NotificationRequestType.request_raised,
          request_group: RequestGroup.CLIENT,
          content: {
            title: `Raised Request`,
            data: `created a service request for ${params.requestAreaInsqft} sqft on ${params.required_date} .`
          },
        })
        await EmailService.sendMessage({ payload: notificationPayload })
      }
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
      if (reqInfo && reqInfo.status !== 'Pending') {
        let statusText: any = reqInfo.status === 'Accepted' ? 'Approved' : 'Rejected';
        return res.status(500).json({ status: "failed", message: `Request Already ${statusText}` });
      }
      if (params.status === 'Accepted') {
        reqInfo.workflow_status = 'In-Progress';
      }
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
        //update AMC Information
        let AMCTransactionInfo: any = await AMCRepository.getAMCByAmcIdAndClientId(reqInfo.amc_id, reqInfo.client_id);
        if (AMCTransactionInfo && AMCTransactionInfo.total_utilized < 5) { //5% 
          let AMCInfo: any = await AMCRepository.getAMCById(reqInfo.amc_id);
          AMCInfo.id = +AMCInfo.id;
          AMCInfo.cumulative_free_area_in_sqft = (AMCInfo.cumulative_free_area_in_sqft - (parseInt(params.requestAreaInsqft)));
          AMCInfo.updated_by = req.meta.userId || 0;
          await AMCRepository.save(AMCInfo);
        }
        //insert transaction data
        let myObj:any = {};
        myObj.amc_id = reqInfo.amc_id;
        myObj.request_id = +req.params.id;
        myObj.client_id = reqInfo.client_id;
        myObj.requested_area_in_sqft = reqInfo.requestAreaInsqft;
        myObj.utilized_percentage = reqInfo.utilized_percentage;
        myObj.year = new Date().getFullYear();
        await AMCRepository.transactionSave(myObj);
      } else {
        //update AMC Information
        let AMCTransactionInfo: any = await AMCRepository.getAMCByAmcIdAndClientId(reqInfo.amc_id, reqInfo.client_id);
        if (AMCTransactionInfo && AMCTransactionInfo.total_utilized < 5) {
          let AMCInfo: any = await AMCRepository.getAMCById(reqInfo.amc_id);
          AMCInfo.id = +AMCInfo.id;
          AMCInfo.cumulative_free_area_in_sqft = AMCInfo.cumulative_free_area_in_sqft + reqInfo.requestAreaInsqft;
          AMCInfo.updated_by = req.meta.userId || 0;
          await AMCRepository.save(AMCInfo);
        }
      }
      const notificationPayload: any = [];
      notificationPayload.push({
        empId: reqInfo.client_id,
        type: NotificationRequestType.request_raised,
        request_group: RequestGroup.CLIENT,
        request_id: requestId,
        content: {
          title: `Request ${params.status}`,
          data: `Your Request ${params.status} by the admin`
        },
        employee_type: 'Client',
      })
      await EmailService.sendMessage({ payload: notificationPayload }) 
      res.status(200).json({ status: 'success', message: `Request ${params.status} Successfully` });
    } catch (error) {
      logger.error({ params: '', error: "requestStatusUpdate" }, "requestStatusUpdate method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async feedbackUpdate(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "feedbackUpdate" }, "feedbackUpdate method called");
      let requestId: any = +req.params.id;
      let params: any = req.body;
      let reqInfo: any = await RequestRepository.getReqById(requestId);
      let workflowData: any = await RequestRepository.findWorkflowByReqId(requestId);
      if (workflowData && workflowData.length > 0) {
        let filterData: any = workflowData.filter((item: any) => item.status === 'Completed');
        if (filterData.length !== workflowData.length) {
          return res
            .status(500)
            .json({ status: "failed", message: "Feedback submission is not allowed until the workflow is completed." });
        }
      } else {
        return res
          .status(500)
          .json({ status: "failed", message: "Workflow is not configured for this request. Please contact the admin to proceed." });

      }
      let workflowInfo: any = await RequestRepository.getWorkflowByReqId(requestId, params.order);
      if (workflowInfo) {
        const { title } = workflowInfo;
        workflowInfo.updated_by = req.meta.userId;
        workflowInfo.id = +workflowInfo.id;
        workflowInfo.status = 'Completed';
        if(title === 'Client Feedback'){
          workflowInfo.title = 'Client Feedback';
          workflowInfo.content = 'Client Feedback Completed Successfully';
          await RequestRepository.workflowSave(workflowInfo);
          reqInfo.client_comments = params.comments;
          reqInfo.client_rating = params.rating;
          reqInfo.updated_by = req.meta.userId;
          reqInfo.id = +reqInfo.id;
          await RequestRepository.save(reqInfo);
        }
        const notificationPayload: any = [];
        notificationPayload.push({
          empId: reqInfo.client_id,
          type: NotificationRequestType.request_raised,
          request_group: RequestGroup.CLIENT,
          request_id: requestId,
          content: {
            title: workflowInfo.title,
            data: workflowInfo.content
          },
          employee_type: 'Client',
        })
        await EmailService.sendMessage({ payload: notificationPayload }) 
        res.status(200).json({ status: 'success', message: `Client Feedback updated Successfully` });
      } else {
        return res
          .status(500)
          .json({ status: "failed", message: "Client Feedback Updation Failed" });
      }
    } catch (error) {
      logger.error({ params: '', error: "feedbackUpdate" }, "feedbackUpdate method error: " + JSON.stringify(error));
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
      let reqInfo: any = await RequestRepository.getReqById(requestId);
      let workflowInfo: any = await RequestRepository.getWorkflowByReqId(requestId, params.order);
      if (workflowInfo) {
        const { title } = workflowInfo;
        workflowInfo.updated_by = req.meta.userId;
        workflowInfo.id = +workflowInfo.id;
        workflowInfo.status = 'Completed';
        if(title === 'Client Feedback' && reqInfo.client_rating === null){
          return res
          .status(500)
          .json({ status: "failed", message: "Client feedback is required to proceed with marking this stage as completed." });
        }
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
        if (workflowInfo.title === 'Work Completed') {
          reqInfo.completed_on = moment().format('YYYY-MM-DD');
          reqInfo.updated_by = req.meta.userId;
          reqInfo.workflow_status = 'Completed';
          reqInfo.id = +reqInfo.id;
          await RequestRepository.save(reqInfo);
        }
        const notificationPayload: any = [];
        notificationPayload.push({
          empId: reqInfo.client_id,
          type: NotificationRequestType.request_raised,
          request_group: RequestGroup.CLIENT,
          request_id: requestId,
          content: {
            title: workflowInfo.title,
            data: workflowInfo.content
          },
          employee_type: 'Client',
        })
        await EmailService.sendMessage({ payload: notificationPayload }) 
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
      if(reqInfo && reqInfo.document && reqInfo.document !== ''){
        let signedURL = await s3service.getSignedUrlMethod('getObject', process.env.AWS_IMAGE_UPLOADS!, reqInfo.document.split("/").pop(), 604800);
        reqInfo.document_signedurl = signedURL;
      }
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
