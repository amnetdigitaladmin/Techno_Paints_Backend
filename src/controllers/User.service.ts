import { Request, Response } from "express";
// import UserRepository from "../models/repositories/user.repo";
import generator from "generate-password";
import common from "../helpers/utils/common";
import logger from '../middlewares/logger';
import { Messages } from "../helpers/utils/messages";
import moment from "moment";
import bcrypt from "bcrypt-nodejs";
import UserRepository from '../models/repositories/user.repo';
import RoleRepository from '../models/repositories/roles.repo';
import UserSessionsRepository  from '../models/repositories/userSessions.repo';
import EmailService from './notification.service';
import jwt from 'jsonwebtoken';
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
      let userPassword =password;
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
      }else{
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
      let roleInfo:any = await RoleRepository.getRoleByName('Business Partner');
      let roleId:any = roleInfo.id ? roleInfo.id : 0;
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
          return res.status(200).json({ status: 'success',message: "Client assaignment Success" });
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

}

export default new UserService();
