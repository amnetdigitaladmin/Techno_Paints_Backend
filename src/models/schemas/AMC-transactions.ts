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
import { BaseModel } from './BaseModel';

@Entity({ name: 'AMC_transactions' })
export class AMCTransactions extends BaseModel {

    @Column({ nullable: true })
    amc_id: number;
  
    @Column({ nullable: true })
    request_id: number;

    @Column({ nullable: true })
    client_id: number;

    @Column({ nullable: true })
    requested_area_in_sqft: string;

    @Column({ nullable: true })
    utilized_percentage: number;

    @Column({ nullable: true })
    year: string;

    constructor(  
        amc_id: number,   
        request_id: number,
        client_id: number, 
        requested_area_in_sqft: string,
        utilized_percentage: number,
        year: string
    ) {
        super();     
        this.amc_id = amc_id,
        this.request_id = request_id,
        this.client_id = client_id,
        this.requested_area_in_sqft = requested_area_in_sqft,
        this.utilized_percentage = utilized_percentage,
        this.year = year
    }
}


