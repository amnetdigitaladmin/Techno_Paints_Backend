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
export type status_Type = "Active" | "InActive";
// import bcrypt from "bcrypt-nodejs";

@Entity({ name: 'AMCs' })
export class AMC extends BaseModel {
  
    @Column({ nullable: true })
    client_name: string;

    @Column({ nullable: true })
    client_id: number;

    @Column({ nullable: true })
    amount: string;

    @Column({ nullable: true })
    bp_id: number;

    @Column({ nullable: true })
    bp_name: string;

    @Column({ nullable: true })
    start_date: string;

    @Column({ nullable: true })
    end_date: string;

    @Column({
        type: 'enum',
        enum: ['Active', 'InActive'],
        default: "Active"
    })
    status?: status_Type;

    constructor(     
        client_name: string,
        client_id: number, 
        amount: string,       
        bp_id: number,
        bp_name: string,
        start_date: string,
        end_date: string,
    ) {
        super();     
        this.client_name = client_name,
        this.client_id = client_id,
        this.amount = amount ,
        this.start_date = start_date,
        this.end_date = end_date,
        this.bp_id = bp_id,
        this.bp_name = bp_name
    }
}


