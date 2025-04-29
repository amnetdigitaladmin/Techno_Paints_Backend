import nodemailer from 'nodemailer';
const fs = require('fs');
const randomstring = require('randomstring');
// import tenantRepository from '../models/repositories/tenant.repo';
import UserRepository from '../models/repositories/user.repo';
// import { Iotp, Otp } from '../models/schemas/otps';
import common from '../helpers/utils/common';
import mongoose from 'mongoose'
import logger from '../middlewares/logger';
import moment from 'moment';
class EmailService {
    public transporter;

    constructor(){
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.FROM_MAIL,
                pass: process.env.FROM_MAIL_PASSWORD,
            },
        });

    }

    public async sendLinkToCustomer(req: any, res: any) {
        try {           
            // Setup email data
            const mailOptions = {
                from: process.env.FROM_MAIL,
                to: `${req.email}`,
                subject: `Feedback and Questions on Your Recent Interaction`,
                html: `<html>
            <body style="font-family:'Verdana'; font-size: 16px; color: #333;">
            <p>Dear <strong>${req.full_name}</strong>,</p>
            <p>I hope this message finds you well!</p>
            <p>I wanted to take a moment to thank you for your recent interaction with our Sales Representative [<strong>${req.salesrep_full_name}</strong>]. We value your feedback as it helps us improve our services and ensure that we are meeting your expectations.</p>   
        <p>To gather your thoughts, we have created a brief survey. Your input is incredibly important to us, and we would greatly appreciate it if you could take a few minutes to share your feedback or ask any questions you may have.</p>
        <p>Please click on the following link to access the survey: <strong><a href=${req.url}>Click Here</a></strong></p>
        <p>OTP: <strong>${req.OTP}</strong></p>
        <p>Thank you for your time and support. If you have any immediate questions or concerns, please feel free to reach out to me directly.</p>
        <p>Warm Regards,</p>
        <p>Levata Sales IQ</p>
        </body>
        </html>`,
                headers: {
                    'Content-type': 'text/html'
                }
            };

            // Send the email
            await this.transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    return res.status(500).json({ status: 'failed', message: 'failed to send link to Customer' });
                } else {
                    return res.status(200).json({ status: 'Success', message: 'Send link to Customer Successfully' });
                }
            });
        } catch (error: any) {
            console.log(error)
        }

    };

    public async sendInvitation(req: any) {
        try {           
            // Setup email data
            const mailOptions = {
                from: process.env.FROM_MAIL,
                to: `${req.email}`,
                subject: `Welcome to Levata Sales IQ`,
                html: `<html>
            <body style="font-family:'Verdana'; font-size: 16px; color: #333;">
            <p>Dear <strong>${req.full_name}</strong>,</p>
            <p>I hope this message finds you well!</p>
            <p>Thank you for registering with Levata Sales IQ! We're excited to have you on board.</p>   
            <p>To get started, here are your login credentials:</p>
            <p>Email: <strong style="text-decoration: none; color: inherit;">${req.email}</strong></p>
            <p>Password: <strong>${req.userPassword}</strong></p>
            <p>URL:<a href = ${process.env.FRONTEND_URL}/login><i> Click here to Continue ..</i></a></p><br/>
            <p>Warm Regards,</p>
        <p>Levata Sales IQ</p>
        </body>
        </html>`,
                headers: {
                    'Content-type': 'text/html'
                }
            };

            // Send the email
            await this.transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    return 'failed to send link to Customer';
                } else {
                    return 'Success' ;
                }
            });
        } catch (error: any) {
            console.log(error)
        }

    };

    public async forgotPasswordOTPEmail(req: any, res: any) {
        try {
            let params: any = req.body;
            let userExist: any = await UserRepository.getUserByemail(params.email);
            if (userExist && (userExist.is_deleted || !userExist.is_active)) {
                return res.status(404).send({ message: "User doesn't exists or User Inactive unable to send OTP" });
            }
            if (userExist && userExist.email) {
                // Generate a random OTP
                const otp = randomstring.generate({
                    length: 6,
                    charset: 'numeric'
                });

                // Setup email data
                const mailOptions = {
                    from: process.env.FROM_MAIL,
                    to: `${userExist.email}`,
                    subject: 'Your One-Time Password (OTP) :: Forgot Password',
                    html: `<html>
        <body style="font-family:'Verdana'; font-size: 16px; color: #333;">
        <p>Dear <strong>${userExist.full_name}</strong>,</p>	
            <p>We Received a Request Related to Forgot Password. Please use the following OTP to gain Access to your Account</p>
            <p>OTP: <strong>${otp}</strong></p>
            <p>Best Regards,</p>
            <p>Levata Sales IQ</p>
        </body>
        </html>`,
                    headers: {
                        'Content-type': 'text/html'
                    }
                };

                // Send the email
                await this.transporter.sendMail(mailOptions, async (error: any, info: any) => {
                    if (error) {
                        return res.status(500).json({ status: 'failed', message: 'failed to send OTP' });
                    } else {
                        let newObj: any = {};
                        newObj.send_to = userExist.email;
                        newObj.otp = otp;
                        newObj.user_id = userExist.id;
                        newObj.created_by = userExist.id;
                        await UserRepository.saveOTP(newObj)
                        return res.status(200).json({ status: 'Success', message: 'OTP Sent Successfully' });
                    }
                });
            } else {
                return res.status(404).send({ message: "User doesn't exists unable to send OTP" });
            }
        } catch (error: any) {
            console.log(error)
        }
    };

    public async resendOTP(req: any, res: any) {
        try {
            let params: any = req.body;
            let userExist: any = await UserRepository.getUserByemail(params.email);
            if (userExist && userExist.email) { 
                // Generate a random OTP
                const otp = randomstring.generate({
                    length: 6,
                    charset: 'numeric'
                });

                // Setup email data
                const mailOptions = {
                    from: process.env.FROM_MAIL,
                    to: `${userExist.email}`,
                    subject: 'Your One-Time Password (OTP) :: Forgot Password',
                    html: `<html>
        <body style="font-family:'Verdana'; font-size: 16px; color: #333;">
        <p>Dear <strong>${userExist.full_name}</strong>,</p>	
            <p>We Received a Request Related to Forgot Password. Please use the following OTP to gain Access to your Account</p>
            <p>OTP: <strong>${otp}</strong></p>
            <p>Best Regards,</p>
            <p>Levata Sales IQ</p>
        </body>
        </html>`,
                    headers: {
                        'Content-type': 'text/html'
                    }
                };

                // Send the email
                await this.transporter.sendMail(mailOptions, async (error: any, info: any) => {
                    if (error) {
                        return res.status(500).json({ status: 'failed', message: 'failed to send OTP' });
                    } else {
                        let newObj: any = {};
                        newObj.send_to = userExist.email;
                        newObj.otp = otp;
                        newObj.user_id = userExist.id;
                        newObj.created_by = userExist.id;
                        await UserRepository.saveOTP(newObj)
                         return res.status(200).json({ status: 'Success', message: 'OTP Sent Successfully' });
                    }
                });
            } else {
                return res.status(404).send({ message: "User doesn't exists" });
            }
        } catch (error: any) {
            console.log(error)
        }
    };

    public async passwordUpdateInvitation(req: any, res: any) {
        try {
            let pass: any = await  common.bynary64ToString(req.encrypt_password);      

            // Setup email data
            const mailOptions = {
                from: process.env.FROM_MAIL,
                to: `${req.email}`,
                subject: 'Your Password has been Updated',
                html: `<html>
            <body style="font-family:'Verdana'; font-size: 16px; color: #333;">
            <p>Dear <strong>${req.full_name}</strong>,</p>	   
            <p>Your password has been successfully updated.</p>
            <p>To get started, here are your latest login credentials:</p>
            <p>Email: <strong style="text-decoration: none; color: inherit;">${req.email}</strong></p>
            <p>New Password: <strong>${pass}</strong></p>
            <p>URL:<a href = ${process.env.FRONTEND_URL}/login><i> Click here to Continue ..</i></a></p>
            <p>Regards,</p>
            <p>Levata Sales IQ</p>
            </body>
            </html>`,
                headers: {
                    'Content-type': 'text/html'
                }
            };

            // Send the email
            await this.transporter.sendMail(mailOptions, (error: any, info: any) => {
                if (error) {
                    return res.status(500).json({ status: 'failed', message: 'failed to send Password Updation Invitation' });
                } else {
                    return res.status(200).json({ status: 'Success', message: 'Password Updation Invitation Sent Successfully' });
                }
            });
        } catch (error: any) {
            console.log(error)
        }
    };



}

export default new EmailService();