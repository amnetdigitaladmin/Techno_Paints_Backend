import { Column, Entity } from "typeorm";
import { BaseModel } from './BaseModel';

export interface Iotp extends Document {   
    otp: String;
    user_id: number;       
}

@Entity({ name: 'otps' })
export class Otps extends BaseModel {
    @Column({ nullable: true })
    user_id: number;

    @Column({ nullable: true })
    send_to: String;

    @Column({ nullable: true })
    otp: String;

    constructor(user_id: number, otp: String, send_to:string) {
        super();
        this.user_id = user_id;
        this.otp = otp;
        this.send_to = send_to
    }
}