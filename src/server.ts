import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import database from './config/db';
import { APIGATEWAY } from './routes/api-gateway';
import { Server } from 'socket.io';
import http from 'http';
import UserService from '../src/controllers/User.service' 

// import Schedulars from './controllers/schedular.service';
// import passport from './middlewares/passport'
import dotenv from 'dotenv';
var cors = require('cors')
var session = require('express-session')

dotenv.config();
let timeOutEnv: any = process.env.TIME_OUT!
let timeOut: any = timeOutEnv ? +timeOutEnv : 60000

class Application {

    app: express.Application;
    server: http.Server;
    io: Server;
    constructor() {
        this.app = express();
        this.settings();
        this.middlewares();
        this.routes();
        // Create server and initialize socket.io
        this.server = http.createServer(this.app);
        this.io = new Server(this.server,{
            cors: {
                origin: '*', // Allow all origins
                methods: ['GET', 'POST'], // Allowed methods
                allowedHeaders: ['Content-Type'], // Allowed headers
                credentials: true // Allow credentials (if needed)
            }});
    }

    settings() {
        this.app.set('port', process.env.PORT || 3002);
        this.app.set('views', path.join(__dirname, 'views'));
        this.app.use(bodyParser.json({ limit: '50mb' }));
        this.app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
        this.app.use(cookieParser());

    }

    middlewares() {
        this.app.use(morgan('dev'));
        this.app.all('/*', function (req:Request, res:Response, next:NextFunction) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Content-Type, jwt, Access-Control-Allow-Headers, Authorization, X-Requested-With, x-access-token');
            res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');            
            next();
        });
        // Error handling
        this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
            res.status(error.statusCode || 500).send({ error: error.message || 'Server Error' })
        });      

        this.app.use(cors());
        this.app.use(function (req: Request, res: Response, next: NextFunction) {
            res.setTimeout(timeOut, function () {
                res.status(504).send({ error: 'Gateway Timeout' })
            });
            next();
        });
        // Session middleware
        this.app.use(session({
            secret: 'your_session_secret',
            resave: false,
            saveUninitialized: true
        }));

    }

    routes() {
        this.app.use('/v1', new APIGATEWAY().router);
        // this.app.use(passport.initialize())
        // this.app.use(passport.session());
    }
    clients = new Map();
    start() {
        // this.io.on('connection', async (socket) => {
        //     console.log('socket connected', socket.id)             
     
        //     // Define socket events here
        //     socket.on('disconnect', () => {               
        //         console.log(`Client disconnected`);
        //     });
        // });
        this.server.listen(this.app.get('port'), () => {
            console.log(`Server is Running Port %d`, this.app.get('port'));
        })
    }
    connectDB() {
        database;
    }

    initialiseSchedular() {
        // Schedulars.runSchedulars()
    }
}

const app = new Application();
// app.initialiseSchedular();
app.connectDB();
app.start();
app.settings();
app.middlewares();
app.routes();




