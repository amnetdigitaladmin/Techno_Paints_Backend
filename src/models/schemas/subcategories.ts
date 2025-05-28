/** *
@author
Amnet Digital
@date
2024-05-20
@Model 
Role
@usage
Userrole Information will store 
*/

import { Column, Entity } from "typeorm";
import { BaseModel } from './BaseModel';


@Entity({ name: 'subcategories' })
export class SubCategory extends BaseModel {

    @Column({ nullable: true })
    category_id: number;

    @Column({ nullable: true })
    subcategory: string;

    @Column({ nullable: true, default: false })
    is_deleted?: boolean;


    constructor(category_id: number, is_deleted: boolean, subcategory: string) {
        super();
        this.category_id = category_id
        this.subcategory = subcategory
        this.is_deleted = is_deleted
    }
}
