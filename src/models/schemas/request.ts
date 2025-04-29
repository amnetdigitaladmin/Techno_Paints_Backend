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
export type status_Type = "Pending" | "Accepted" | "Rejected";
// import bcrypt from "bcrypt-nodejs";

@Entity({ name: 'requests' })
export class Request extends BaseModel {
  
    @Column({ nullable: true })
    client_name: string;

    @Column({ nullable: true })
    client_id: number;

    @Column({ nullable: true })
    material_type: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    quantity: string;

    @Column({ nullable: true })
    bp_id: number;

    @Column({ nullable: true })
    bp_name: string;

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

    constructor(     
        client_name: string,
        client_id: number, 
        material_type: string,       
        description: string,
        quantity: string,
        bp_id: number,
        bp_name: string,
        required_date: string,
        comments: string,
    ) {
        super();     
        this.client_name = client_name,
        this.client_id = client_id,
        this.material_type = material_type ,
        this.description = description,
        this.quantity = quantity,
        this.bp_id = bp_id,
        this.bp_name = bp_name,
        this.required_date = required_date,
        this.comments = comments
    }
}


