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


@Entity({ name: 'Worflows' })
export class Workflow extends BaseModel {

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    content: string;

    @Column({ nullable: true })
    status: string;

    @Column({ nullable: true })
    order: number;

    @Column({ nullable: true })
    requestId: number;

    @Column({ nullable: true, default: false })
    is_deleted?: boolean;


    constructor(title: string, content: string, status: string, order: number, requestId: number, is_deleted: boolean) {
        super();
        this.title = title
        this.content = content
        this.status = status
        this.order = order
        this.requestId = requestId
        this.is_deleted = is_deleted
    }
}
