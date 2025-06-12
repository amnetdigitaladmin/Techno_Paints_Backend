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

import { Column, Entity ,ManyToOne,JoinColumn } from "typeorm";
import { Category } from './categories';
import { SubCategory } from './subcategories';
import { BaseModel } from './BaseModel';
export type status_Type = "Active" | "InActive";
// import bcrypt from "bcrypt-nodejs";

@Entity({ name: 'AMCs' })
export class AMC extends BaseModel {

    @Column({ nullable: true })
    amc_name: string;
  
    @Column({ nullable: true })
    client_name: string;

    @Column({ nullable: true })
    client_id: number;

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

    @Column({ nullable: true })
    total_area_in_sqft: string;

    @Column({ nullable: true })
    requested_area_in_sqft: string;

    @Column({ nullable: true })
    remaining_area_in_sqft: string;

//    relationships
    @ManyToOne(() => Category)
    @JoinColumn({ name: 'category_id' })
    category_id: Category;

    @ManyToOne(() => SubCategory)
    @JoinColumn({ name: 'sub_category_id' })
    sub_category_id: SubCategory;

    @Column({ nullable: true })
    utilisation_per_year: number;

    @Column({ nullable: true })
    utilized_percentage: number;

    @Column({ nullable: true })
    remaining_utilize_percentage: number;

    @Column({ nullable: true })
    carry_forwarded_percentage: number;

    constructor(  
        amc_name: string,   
        client_name: string,
        client_id: number, 
        start_date: string,
        end_date: string,
        total_area_in_sqft: string,
        requested_area_in_sqft: string,
        remaining_area_in_sqft: string,
        category_id: Category,
        sub_category_id: SubCategory,
        utilisation_per_year: number,
        utilized_percentage: number,
        remaining_utilize_percentage: number,
        carry_forwarded_percentage: number,
    ) {
        super();     
        this.amc_name = amc_name,
        this.client_name = client_name,
        this.client_id = client_id,
        this.start_date = start_date,
        this.end_date = end_date,
        this.total_area_in_sqft = total_area_in_sqft,
        this.requested_area_in_sqft = requested_area_in_sqft,
        this.remaining_area_in_sqft = remaining_area_in_sqft,
        this.category_id = category_id,
        this.sub_category_id = sub_category_id,
        this.utilisation_per_year = utilisation_per_year,
        this.utilized_percentage = utilized_percentage,
        this.remaining_utilize_percentage = remaining_utilize_percentage,
        this.carry_forwarded_percentage = carry_forwarded_percentage
    }
}


