import { Request, Response } from 'express';
 import { Irole } from '../models/schemas/role';
import RoleRepo from '../models/repositories/roles.repo';
import common from "../helpers/utils/common";
import logger from '../middlewares/logger';
import * as _ from 'lodash';

class roleService { 
    public async getAllRoles(req: Request, res:Response){
        try {
            logger.info({ userId: req.meta.userId, init: "getAllRoles" }, "Get All Roles method called");
            let rolesInfo: any = await RoleRepo.getRolesForImport();
            if (rolesInfo && rolesInfo.length > 0) {
                return res.status(200).json({ status: 'success', data: rolesInfo });
            } else {
                return res.status(200).send({ status: 'success', data: [] });
            }
        } catch (error: any) {
            logger.error({ userId: req.meta.userId, error: "getAllRoles" }, "Get All Roles method error: " + JSON.stringify(error));
            return res.status(500).send({ message: "Internal server error" });
        }
    };



//     public async getRoleById(req: Request, res:Response){
//         try {
//             logger.info({ userId: req.meta.userId, init: "getRoleById" }, "getRoleById method called"); 
//             let id: any = +req.params.id;
//            let roleInfo:any = await RoleRepo.getRoleById(id);
//             if (roleInfo) {
//                 logger.info({ userId: req.meta.userId, success: "getRoleById" }, "getRoleById method success");
//                 return res.status(200).json({ status: 'success', data: roleInfo });
//             } else {
//                 return res.status(200).json({ status: 'success', data: [] });
//             }
//         } catch (error:any) {
//             logger.error({ userId: req.meta.userId,error: "getRoleById" }, "getRoleById method error: " + JSON.stringify(error));
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     };

//     public async getRoleByNameAndUser(req: Request, res:Response){
//         try {
//             logger.info({ userId: req.meta.userId, init: "getRoleById" }, "getRoleById method called"); 
//             let roleName: any = req.params.name;
//             let userId: any = +req.params.customerId;
//            let roleInfo:any = await RoleRepo.getRoleByNameAndUser(roleName, userId);
//             if (roleInfo) {
//                 logger.info({ userId: req.meta.userId, success: "getRoleById" }, "getRoleById method success");
//                 return res.status(200).json({ status: 'success', data: roleInfo });
//             } else {
//                 return res.status(200).json({ status: 'success', data: [] });
//             }
//         } catch (error:any) {
//             logger.error({ userId: req.meta.userId,error: "getRoleById" }, "getRoleById method error: " + JSON.stringify(error));
//             return res.status(500).json({ message: "Internal server error" });
//         }
//     };
    
//     public async UpdateRole(req: Request, res: Response) {
//         try {
//             logger.info({ userId: req.meta.userId, init: "UpdateRole" }, "Update Role method called");
//             let params: any = req.body;
//             params.updated_by = req.meta.userId;
//             params.updated_at = new Date();            
//             logger.info({ userId: req.meta.userId, success: "UpdateRole" }, "Update Role method success");
//             return res.status(200).json({ status: 'success', message: 'Role Updated Successfully' });
//         } catch (error) {
//             logger.error({ userId: req.meta.userId, error: "UpdateRole" }, "Update Role method error: " + JSON.stringify(error));
//             return res.status(500).json({ status: 'failed', message: "Internal server error" });
//         }
//     }
  
//     // public async deleteRole(req: Request, res: Response) {
//     //     try {
//     //         logger.info({ userId: req.meta.userId, init: "deleteRole" }, "Delete Role method called"); 
//     //         let id: any = +req.params.id;            
//     //         let result: any = await RoleRepo.deleteRole(id);
//     //         if (result) {
//     //             logger.info({ userId: req.meta.userId, success: "deleteRole" }, "Delete Role method success");
//     //             return res.status(200).json({ status: 'success', message: 'Role deleted Successfully' });
//     //         } else {
//     //             return res.status(500).json({ status: 'failed', message: 'Failed to delete Role' });
//     //         }
//     //     } catch (error) {
//     //         logger.error({ userId: req.meta.userId, error: "deleteRole" }, "Delete Role method error: " + JSON.stringify(error));
//     //         return res.status(500).json({ status: 'failed', message: "Internal server error" });
//     //     }
//     // }

//     public async createCustomerRole(obj:any){ 
//         try {
//             logger.info({ params: obj, init: "createCustomerRole" }, "createCustomerRole method called"); 
//             let params:any = obj;            
//             let roleNameExist:Icustomer_role = await RoleRepo.getByRoleName(params.name,params.userId);
//             if(!roleNameExist){
//                 return await  RoleRepo.createCustomerRole(params)
//             } else{
//                 return roleNameExist;
//             } 
//         } catch (error) {           
//             logger.error({ params: obj, init: "createCustomerRole" }, "createCustomerRole method error: " + JSON.stringify(error));
//         }
//     };
}

export default new roleService();