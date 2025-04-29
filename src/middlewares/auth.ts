import  express, { Request, Response, NextFunction }  from 'express';
// import UserSessionRepository  from '../models/repositories/user-sessions.repo';

import jwt from 'jsonwebtoken';
import { jwtDecode } from "jwt-decode";
import UserSessionsRepository  from '../models/repositories/userSessions.repo';

const Router = express.Router();
// Define a custom interface for the request object
  declare global {
    namespace Express {
        interface Request {
            meta:{
                userId:string              
            };
        }
    }
}
Router.use(async (req:Request, res:Response, next:NextFunction) => {
    const token:any =  req.headers['jwt'];
    try {
        if(token)    {
            let verifiedUser:any = await jwt.verify(token, process.env.JWT_SECRET_KEY!);
            if(verifiedUser){
                req.meta = verifiedUser
                // req.params = verifiedUser;
                let verfiySession:any = await UserSessionsRepository.isSessionActive(verifiedUser.userId);
                if(!verfiySession){
                   return res.status(401).json({ message: 'Session Expired please login again' });                   
                }
            }else{
                let decoded:any = jwtDecode(token);
                //if token not verfied. make Inactive, users active session
                let sessionDetails:any = await UserSessionsRepository.isSessionActive(decoded.userId);
                sessionDetails.id = +sessionDetails.id;
                sessionDetails.updated_by = '';
                sessionDetails.is_active = false;
                await UserSessionsRepository.save(sessionDetails);
                res.status(401).json({ message: 'Session Expired please login again' });
                next();
            }           
        }else {
            return res.status(401).json({ message: 'Token must be sent!' });         
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Invalid Token' });        
    }
})

export default Router;