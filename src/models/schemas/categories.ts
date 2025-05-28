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


@Entity({ name: 'categories' })
export class Category extends BaseModel {

    @Column({ nullable: true })
    category: string;


    @Column({ nullable: true, default: false })
    is_deleted?: boolean;


    constructor(category: string, is_deleted: boolean) {
        super();
        this.category = category
        this.is_deleted = is_deleted
    }
}
