import { DataSource } from "typeorm";
import dotenv from 'dotenv';
import { User } from '../models/schemas/user';
import { userSessions } from '../models/schemas/user-sessions';
import { ImportEntity } from '../models/schemas/import';
// import { superAdmin } from '../models/schemas/superAdmin';
import { Role } from '../models/schemas/role';
import { Request } from '../models/schemas/request';
import { AMC } from '../models/schemas/AMC';
import { Notifications } from '../models/schemas/notifications';
dotenv.config();
 

    let AppDataSource: any;
    let retries: number = 5;
    while (retries) {
        try {
            AppDataSource = new DataSource({
                type: "postgres",
                host: process.env.TYPEORM_HOST,
                port: parseInt(process.env.TYPEORM_PORT!),
                username: process.env.TYPEORM_USERNAME,
                password: process.env.TYPEORM_PASSWORD,
                database: process.env.TYPEORM_DATABASE,
                synchronize: true,
                logging: false,
                entities: [User, userSessions, ImportEntity,Role, Request,Notifications,AMC]
            });
            AppDataSource.initialize()
                .then(() => {
                    console.log("Database Connection Established");
                })
                .catch((error: any) => console.log(error));
            retries = 0;
        } catch (error) {
            console.log('Postgres trying to reconnect : ', retries, 'Error :', error);
            retries -= 1;
            AppDataSource = undefined;
            new Promise(res => setTimeout(res, 500));
        }
    }
   
 
export default AppDataSource;