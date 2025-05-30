/** *
@author
Amnet Digital
@date
2024-05-20
@Model 
Role
@usage
Roles Information will store 
*/

import { Column, Entity ,BeforeInsert,BeforeUpdate } from "typeorm";
import { BaseModel } from './BaseModel';
import { float } from "aws-sdk/clients/cloudfront";
export type status_Type = "Pending" | "Accepted" | "Rejected";
// import bcrypt from "bcrypt-nodejs";

@Entity({ name: 'requests' })
export class Request extends BaseModel {  
    
    @Column({ nullable: true })
    client_id: number;

    @Column({ nullable: true })
    amc_id: number;  

    @Column({ nullable: true })
    requestAreaInsqft: string;

    @Column({ nullable: true })
    approved_by: number;

    @Column({ nullable: true })
    approved_at: string;

    @Column({ nullable: true })
    required_date: string;

    @Column({ nullable: true })
    comments: string;

    @Column({
		type: 'enum',
		enum: ['Pending', 'Accepted', 'Rejected'],
        default: "Pending"
	})
	status?: status_Type;

    @Column({ nullable: true })
    client_comments: string;

    @Column({ nullable: true })
    client_rating: float;

     @Column({ nullable: true })
    completed_on: string;


    constructor(  
        client_id: number, 
        amc_id:number,
        requestAreaInsqft:string,
        approved_by:number,
        approved_at:string,
        required_date: string,
        comments: string,
        client_comments:string,
        client_rating:float,
        completed_on:string
    ) {
        super(); 
        this.client_id = client_id,
        this.amc_id = amc_id,
        this.requestAreaInsqft = requestAreaInsqft,
        this.approved_by = approved_by,
        this.approved_at = approved_at,
        this.required_date = required_date,
        this.comments = comments,
        this.client_comments = client_comments,
        this.client_rating = client_rating,
        this.completed_on = completed_on
    }
}


