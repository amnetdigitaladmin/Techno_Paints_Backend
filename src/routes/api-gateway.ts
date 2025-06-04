import { Router, Request, Response } from 'express';
import userService from '../controllers/User.service';
import roleService from '../controllers/role.service';
import AuthService from '../controllers/auth.service';
import ImportService from '../controllers/import.service';
import notificationService from '../controllers/notification.service';
import requestService from '../controllers/request.service';
import AMCService from '../controllers/AMC.service';
import categoryService from '../controllers/services.service';
// import S3Service from '../controllers/s3.service';
// import notificationService from '../controllers/notification.service';
import vefiryToken from  '../middlewares/auth';
import schema  from '../helpers/utils/validate-schemas';
// import ValidateRoute from  '../middlewares/routeValidator'
import { ValidateJoi } from '../middlewares/joi-validator';
// import roleService from '../controllers/role.service';
// import schemaRules from '../helpers/utils/validate-schemas';
// import passport from '../middlewares/passport'


export class APIGATEWAY {
    public router: Router;
    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        // // this.router.post("/validate-route",  (req: Request, res: Response) => {
        // //     AuthService.VerifyServiceAuth(req, res);
        // });

        // this.router.get("/login/sso/:name/:service", passport.authenticate('multiSaml', {
        //     successRedirect: '/',
        //     failureRedirect: '/login/sso/:name',
        //     // session: false, // Disable session creation
        // }));

        // this.router.get("/login/sso2", passport.authenticate('samlProvider2', {
        //     session: false, // Disable session creation
        // }));

        // this.router.post('/sso/redirect/:name/:service', passport
        //     .authenticate('multiSaml', { failureRedirect: '/login/sso1', failureFlash: true }), (req, res) => {
        //         AuthService.ssoLogin(req, res)
        //     },)

        this.router.post("/login", (req: Request, res: Response) => {
            AuthService.Login(req, res);
        });

        this.router.post("/logout", vefiryToken, (req: Request, res: Response) => {
            AuthService.Logout(req, res);
        });

        this.router.put("/forgot-password", (req: Request, res: Response) => {
            AuthService.forgotPassword(req, res);
        });

        this.router.post("/import/admin",vefiryToken, (req: Request, res: Response) => {
            ImportService.ImportAdmin(req, res);
        });

        this.router.post("/import/business-partner",vefiryToken, (req: Request, res: Response) => {
            ImportService.ImportBusinessPartner(req, res);
        });

        this.router.post("/import/client",vefiryToken, (req: Request, res: Response) => {
            ImportService.ImportClient(req, res);
        });

        this.router.get("/import/logs", (req: Request, res: Response) => {
            ImportService.getImports(req, res);
        });

        this.router.post("/user", vefiryToken, ValidateJoi(schema.userSchema), (req: Request, res: Response) => {
            userService.AddUser(req, res);
        });

        this.router.get("/users", vefiryToken, (req: Request, res: Response) => {
            userService.getAllUsers(req, res);
        });

        this.router.put("/user/:id", vefiryToken, ValidateJoi(schema.userUpdateSchema), (req: Request, res: Response) => {
            userService.updateUser(req, res);
        });

        this.router.get("/user/:id", vefiryToken, (req: Request, res: Response) => {
            userService.getUserById(req, res);
        });

        this.router.delete("/user/:id", vefiryToken, (req: Request, res: Response) => {
            userService.deleteUserById(req, res);
        });

        this.router.get("/clients/:id", vefiryToken, (req: Request, res: Response) => {
            userService.getBPAllClients(req, res);
        });

        this.router.get("/business/partners", vefiryToken, (req: Request, res: Response) => {
            userService.getAllBusinessPartners(req, res);
        });

        this.router.put("/assign-client/:bpid",ValidateJoi(schema.assignClientSchema),vefiryToken, (req: Request, res: Response) => {
            userService.Assignclients(req, res);
        });
   
        // // dont use
        this.router.get("/role",vefiryToken,(req: Request, res: Response) => {
            roleService.getAllRoles(req, res);
        });

        this.router.put("/forgot/password/otp/mail", ValidateJoi(schema.forgotPasswordOTPSchema), (req: Request, res: Response) => {
            notificationService.forgotPasswordOTPEmail(req, res);
        });

        this.router.put("/resend/otp", ValidateJoi(schema.forgotPasswordOTPSchema), (req: Request, res: Response) => {
            notificationService.resendOTP(req, res);
        });

        this.router.post("/request", vefiryToken, ValidateJoi(schema.requestSchema), (req: Request, res: Response) => {
            requestService.AddRequest(req, res);
        });

        this.router.get("/requests", vefiryToken, (req: Request, res: Response) => {
            requestService.getAllRequests(req, res);
        });

        this.router.get("/client/requests", vefiryToken, (req: Request, res: Response) => {
            requestService.getAllClientRequests(req, res);
        });

        this.router.put("/request/:id", vefiryToken, ValidateJoi(schema.requestUpdateSchema), (req: Request, res: Response) => {
            requestService.updateRequest(req, res);
        });

        this.router.get("/request/:id", vefiryToken, (req: Request, res: Response) => {
            requestService.getRequestById(req, res);
        });

        this.router.delete("/request/:id", vefiryToken, (req: Request, res: Response) => {
            requestService.deleteRequestById(req, res);
        });

        this.router.put("/status/update/:id", vefiryToken, ValidateJoi(schema.acceptRejectSchema), (req: Request, res: Response) => {
            requestService.requestStatusUpdate(req, res);
        });

        this.router.put("/workflow/update/:id", vefiryToken, ValidateJoi(schema.workflowSchema), (req: Request, res: Response) => {
            requestService.workflowStatusUpdate(req, res);
        });

        this.router.put("/client/feedback/:id", vefiryToken, ValidateJoi(schema.feedbackSchema), (req: Request, res: Response) => {
            requestService.feedbackUpdate(req, res);
        });

        this.router.get("/workflows/:id", vefiryToken, (req: Request, res: Response) => {
            requestService.workflowListing(req, res);
        });

          this.router.get("/client/AMCs", vefiryToken, (req: Request, res: Response) => {
            AMCService.getAllClientAMCs(req, res);
        });

        this.router.get("/client/AMCs/listing", vefiryToken, (req: Request, res: Response) => {
            AMCService.getAllClientAMCsListing(req, res);
        });

        this.router.post("/AMC", vefiryToken, ValidateJoi(schema.AMCSchema), (req: Request, res: Response) => {
            AMCService.createAMC(req, res);
        });

        this.router.get("/AMCs", vefiryToken, (req: Request, res: Response) => {
            AMCService.getAllAMCs(req, res);
        });

        this.router.get("/bp/AMCs", vefiryToken, (req: Request, res: Response) => {
            AMCService.getAllBPAMCs(req, res);
        });

        this.router.put("/AMC/:id", vefiryToken, ValidateJoi(schema.AMCUpdateSchema), (req: Request, res: Response) => {
            AMCService.updateAMC(req, res);
        });

        this.router.get("/AMC/:id", vefiryToken, (req: Request, res: Response) => {
            AMCService.getAMCById(req, res);
        });

        this.router.delete("/AMC/:id", vefiryToken, (req: Request, res: Response) => {
            AMCService.deleteAMCById(req, res);
        });

        this.router.get("/dashboardkpi", vefiryToken, (req: Request, res: Response) => {
            userService.dashboardKpis(req, res);
        });

        this.router.get("/active-inactive", vefiryToken, (req: Request, res: Response) => {
            userService.dashboardActiveAndInactive(req, res);
        });

        this.router.get("/status-count", vefiryToken, (req: Request, res: Response) => {
            userService.dashboardStatusCount(req, res);
        });

        this.router.get('/revenue-chart', vefiryToken, (req: Request, res: Response) => {
            userService.revenueChart(req, res);
        });

        this.router.get("/download", vefiryToken, (req: Request, res: Response) => {
            userService.downloadReports(req, res);
        });

        this.router.get("/notifications", vefiryToken, (req: Request, res: Response) => {
            notificationService.getMessages(req, res);
        });

        this.router.put("/notification", vefiryToken, (req: Request, res: Response) => {
            notificationService.updateMessageStatus(req, res);
        });

        this.router.delete("/notification", vefiryToken, (req: Request, res: Response) => {
            notificationService.deleteMessage(req, res);
        });


        this.router.post("/category", vefiryToken, ValidateJoi(schema.categorySchema), (req: Request, res: Response) => {
            categoryService.createCategory(req, res);
        });

        this.router.post("/subcategory", vefiryToken, ValidateJoi(schema.subCategorySchema), (req: Request, res: Response) => {
            categoryService.createSubCategory(req, res);
        });

        this.router.put("/subcategory", vefiryToken, ValidateJoi(schema.updateSubCategorySchema), (req: Request, res: Response) => {
            categoryService.updateSubCategory(req, res);
        });

        this.router.get("/categories", vefiryToken, (req: Request, res: Response) => {
            categoryService.getAllCategories(req, res);
        });

        this.router.get("/subcategories/:id", vefiryToken, (req: Request, res: Response) => {
            categoryService.getAllSubCategoriesByCategoryId(req, res);
        });

          this.router.get("/categories/listing", vefiryToken, (req: Request, res: Response) => {
            categoryService.getAllCategoriesListing(req, res);
        });

         this.router.delete("/category/:id", vefiryToken, (req: Request, res: Response) => {
            categoryService.deleteCategoryByCategoryId(req, res);
        });

        this.router.put("/category/:id", vefiryToken, ValidateJoi(schema.categorySchema), (req: Request, res: Response) => {
            categoryService.updateCategoryByCategoryId(req, res);
        });

    }
}