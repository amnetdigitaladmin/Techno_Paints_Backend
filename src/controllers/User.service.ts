import { Request, Response } from "express";
import generator from "generate-password";
import common from "../helpers/utils/common";
import logger from '../middlewares/logger'
import UserRepository from '../models/repositories/user.repo';
import RoleRepository from '../models/repositories/roles.repo';
import amcRepository from '../models/repositories/AMC.repo';
import requestRepository from '../models/repositories/request.repo';
import { contextType, NotificationRequestType, RequestGroup } from '../helpers/utils/enum' 
import { Parser } from 'json2csv';
import EmailService from './notification.service';

class UserService {
  public async AddUser(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "AddUser" }, "add user method called");
      let params: any = req.body;
      params.created_by = req.meta.userId;
      let userInfo: any = await UserRepository.getUserByemail(req.body.email);
      if (userInfo && userInfo.email) {
        return res.status(400).json({ status: 'Failed', message: "Email already exists" });
      }
      params.full_name = `${params.first_name || ''} ${params.last_name || ''}`.trim();
      let password: any = generator.generate({ length: 10, numbers: true });
      let userPassword = password;
      params.password = password;
      params.EncryptPassword = await common.stringToBinary64(password);
      await UserRepository.save(params);
      params.userPassword = userPassword
      await EmailService.sendInvitation(params);
      res.status(200).json({ status: 'success', message: 'User Created Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "AddUser" }, "add user method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async updateUser(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "updateUser" }, "updateUser method called");
      let userId: any = +req.params.id;
      let params: any = req.body;
      params.full_name = `${params.first_name || ''} ${params.last_name || ''}`.trim();
      let usersInfo: any = await UserRepository.getById(userId);
      usersInfo = { ...usersInfo, ...params };  
      await UserRepository.userSave(usersInfo);
      res.status(200).json({ status: 'success', message: 'User Details Updated Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "updateUser" }, "updateUser method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getUserById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getUserById" }, "getUserById method called");
      let userId: any = +req.params.id;
      let usersInfo: any = await UserRepository.getById(userId);
      if (usersInfo && usersInfo.id) {
        delete usersInfo.password;
        delete usersInfo.EncryptPassword;
      } else {
        usersInfo = {}
      }
      res.status(200).json({ status: 'success', data: usersInfo });
    } catch (error) {
      logger.error({ params: '', error: "getUserById" }, "getUserById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async deleteUserById(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "deleteUserById" }, "deleteUserById method called");
      let userId: any = +req.params.id;
      let roles = await RoleRepository.getRolesForImport()
      let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
      if (Role == contextType.ADMIN) {
        let usersCout: any = await UserRepository.getCountByRole(req.meta.roleId)
        if (usersCout == 1) {
          return res
            .status(400)
            .json({ status: "failed", message: "Your not allowed to delete this final admin user" });
        }
      }
      let usersInfo: any = await UserRepository.getById(userId);
      usersInfo.id = +usersInfo.id;
      usersInfo.updated_by = req.meta.userId || 0;
      usersInfo.is_deleted = true;
      await UserRepository.save(usersInfo);
      res.status(200).json({ status: 'success', message: 'User Deleted Successfully' });
    } catch (error) {
      logger.error({ params: '', error: "deleteUserById" }, "deleteUserById method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllUsers(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllUsers" }, "getAllUsers method called");
      let usersInfo: any = await UserRepository.getAllUsers(req);
      let count: any = await UserRepository.getAllUserCount(req);
      if (usersInfo && usersInfo.length > 0) {

        res.status(200).json({ status: 'success', data: usersInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllUsers" }, "getAllUsers method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getBPAllClients(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getBPAllClients" }, "getBPAllClients method called");
      let usersInfo: any = await UserRepository.getBPAllClients(req);
      let count: any = await UserRepository.getBPAllClientsCount(req);
      if (usersInfo && usersInfo.length > 0) {
        res.status(200).json({ status: 'success', data: usersInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getBPAllClients" }, "getBPAllClients method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async getAllBusinessPartners(req: Request, res: Response) {
    try {
      logger.info({ params: '', init: "getAllBusinessPartners" }, "getAllBusinessPartners method called");
      let roleInfo: any = await RoleRepository.getRoleByName('Business Partner');
      let roleId: any = roleInfo.id ? roleInfo.id : 0;
      let usersInfo: any = await UserRepository.getAllBusinessPartners(req, roleId);
      let count: any = await UserRepository.getAllBusinessPartnersCount(req, roleId);
      if (usersInfo && usersInfo.length > 0) {
        res.status(200).json({ status: 'success', data: usersInfo, total_count: count.length });
      } else {
        res.status(200).json({ status: 'success', data: [], total_count: 0 });
      }
    } catch (error) {
      logger.error({ params: '', error: "getAllBusinessPartners" }, "getAllBusinessPartners method error: " + JSON.stringify(error));
      return res
        .status(500)
        .json({ status: "failed", message: "Internal Server Error" });
    }
  }

  public async Assignclients(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "Assignclients" }, "Assignclients method called");
      let BpInfo: any = await UserRepository.getById(+req.params.bpid);
      if (BpInfo && BpInfo.hasOwnProperty('id')) {
        BpInfo.updated_by = req.meta.userId
        let updatedData: any = await UserRepository.assignClients(BpInfo, req.body.clientsIds);
        if (updatedData && updatedData.affected > 0) {
          const notificationPayload: any = [];
          notificationPayload.push({
            empId: +req.params.bpid,
            type: NotificationRequestType.request_raised,
            request_group: RequestGroup.ADMIN,
            content: {
              title: `Clients Assigned`,
              data: `New clients have been assigned to you. Please check your client list for details.`
            },
            employee_type: 'employee',
          })
          await EmailService.sendMessage({ payload: notificationPayload }) 
          return res.status(200).json({ status: 'success', message: "Client assaignment Success" });
        } else {
          return res.status(200).send({ status: 'Failed', message: "Client assaignment Failed" });
        }
      } else {
        return res.status(200).send({ status: 'Failed', message: "Business Partner not found" });
      }
    } catch (error: any) {
      console.log(error)
      logger.error({ userId: req.meta.userId, error: "Assignclients" }, "Assignclients method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };

  public async dashboardKpis(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "dashboard" }, "dashboard method called");
      let roles = await RoleRepository.getRolesForImport()
      let KPIs: any = []
      let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
      if (Role == contextType.ADMIN) {
        let ClientRole = (roles.find((item: any) => { return item.name == contextType.CLIENT })).hasOwnProperty('name') ?
          (roles.find((item: any) => { return item.name == contextType.CLIENT })).id : 3
      
        KPIs.push({
          name: 'Total Clients',
          Count: await UserRepository.getCountByRole(ClientRole)
        }
        )    
        KPIs.push({
          name: 'Total area in sqft',
          Count: +(await amcRepository.getAmountContracts()).total
        }
        )
        KPIs.push({
          name: 'Total Contracts',
          Count: await amcRepository.getTotalContracts()
        }
        )
        KPIs.push({
          name: 'Active Contracts',
          Count: await amcRepository.getActiveContracts()
        }
        )
         KPIs.push({
          name: 'Total Requests',
          Count: await requestRepository.getTotalRequestsCount()
        }
        )
      } else { 
        KPIs.push({
          name: 'Total area in sqft',
          Count: +(await amcRepository.getBPAmountContracts(+req.meta.userId)).total
        })

        KPIs.push({
          name: 'Total Contracts',
          Count: await amcRepository.getBPTotalContracts(+req.meta.userId)
        }
        )

        KPIs.push({
          name: 'Active Contracts',
          Count: await amcRepository.getBPActiveContracts(+req.meta.userId)
        })
          KPIs.push({
          name: 'Total Requests',
          Count: await requestRepository.getTotalClientRequestsCount(+req.meta.userId)
        }
        )
      }


      res.status(200).json({ status: 'success', data: KPIs });
    } catch (error: any) {
      console.log(error)
      logger.error({ userId: req.meta.userId, error: "dashboard" }, "dashboard method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };

  public async dashboardActiveAndInactive(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "dashboardActiveAndInactive" }, "dashboardActiveAndInactive method called");
      let roles = await RoleRepository.getRolesForImport()    
      let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
        let resp:any = {};
        resp.x = ['Active', 'Inactive'];
        resp.y = [];
        let ClientRole = (roles.find((item: any) => { return item.name == contextType.CLIENT })).hasOwnProperty('name') ?
        (roles.find((item: any) => { return item.name == contextType.CLIENT })).id : 3   
        if (Role == contextType.ADMIN) {           
          resp.y.push(await UserRepository.getCountByActiveRole(ClientRole))
          resp.y.push(await UserRepository.getCountByInActiveRole(ClientRole))
      } else {
        resp.y.push(await UserRepository.getCountByActiveRoleByBP(ClientRole,+req.meta.userId))
        resp.y.push(await UserRepository.getCountByInActiveRoleByBP(ClientRole,+req.meta.userId))
      }
      res.status(200).json({ status: 'success', data: resp });
    } catch (error: any) {
      console.log(error)
      logger.error({ userId: req.meta.userId, error: "dashboardActiveAndInactive" }, "dashboardActiveAndInactive method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };

  public async dashboardStatusCount(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "dashboardStatusCount" }, "dashboardStatusCount method called");
      let roles = await RoleRepository.getRolesForImport()
      let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
      let resp: any = {};
      if (Role == contextType.ADMIN) {
        resp = await requestRepository.getRequestStatusCounts()

      } else {
        resp = await requestRepository.getRequestBPStatusCounts(+req.meta.userId)
      }

      res.status(200).json({ status: 'success', data: resp });
    } catch (error: any) {
      console.log(error)
      logger.error({ userId: req.meta.userId, error: "dashboardStatusCount" }, "dashboardStatusCount method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };

  public async revenueChart(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "revenueChart" }, "revenueChart method called");
      let roles = await RoleRepository.getRolesForImport()
      let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
      let resp: any = {};
      if (Role == contextType.ADMIN) {
        resp = await amcRepository.getAMCChartData(req.query)
      } else {
        req.query.user =  req.meta.userId
        resp = await amcRepository.getBPAMCChartData(req.query)
      }

      res.status(200).json({ status: 'success', data: resp });
    } catch (error: any) {
      console.log(error)
      logger.error({ userId: req.meta.userId, error: "revenueChart" }, "revenueChart method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };

  public async downloadReports(req: Request, res: Response) {
    try {
      logger.info({ userId: req.meta.userId, init: "downloadReports" }, "downloadReports method called");
      try {
        let data = {}
        let roles = await RoleRepository.getRolesForImport()
        let Role = (roles.find((item: any) => { return item.id == req.meta.roleId })).hasOwnProperty('id') ?
        (roles.find((item: any) => { return item.id == req.meta.roleId })).name : 3
      if (Role == contextType.ADMIN) {
        if (req.query.type == 'AMC') {
          data = await amcRepository.getAllAMCsForDownload(req.query)
        } else if (req.query.type == 'Client Requests') {
          data = await requestRepository.getAllRequestsDownload(req.query)
        } 
      }else{
        req.query.userId = req.meta.userId
        if (req.query.type == 'AMC') {        
          data = await amcRepository.getAllAMCsBPForDownload(req.query)
        } else if (req.query.type == 'Client Requests') {
          data = await requestRepository.getAllBPRequestsDownload(req.query)
        } 
      }    
        const parser = new Parser();
        const csv = parser.parse(data);
        res.setHeader('Content-Disposition', 'attachment; filename=data.csv');
        res.setHeader('Content-Type', 'text/csv');
        res.status(200).send(csv);
      } catch (error) {
        res.status(500).send('Error generating CSV');
      }
    } catch (error: any) {     
      logger.error({ userId: req.meta.userId, error: "downloadReports" }, "downloadReports method error: " + JSON.stringify(error));
      return res.status(500).send({ message: "Internal server error" });
    }
  };


}

export default new UserService();
