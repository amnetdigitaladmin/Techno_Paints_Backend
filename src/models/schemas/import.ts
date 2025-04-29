
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseModel}  from './BaseModel';
import { ImportStatusType, ImportType, ReportColumnDataType } from '../../helpers/utils/enum';

@Entity({ name: 'imports' })
export class ImportEntity extends BaseModel {
	@Column({ nullable: true })
	request_file_url?: string;

	@Column({ nullable: true })
	response_file_url?: string;

	@Column({ nullable: true })
	number_of_attempts: number;

	@Column({ nullable: true, default: 0 })
	number_of_error: number;

	@Column({ nullable: true, default: 0 })
	number_of_records: number;

	@Column({ nullable: true })
	import_type: number;

	@Column({
		type: 'enum',
		enum: ImportStatusType,
	})
	status?: ImportStatusType.NotStarted;


    @Column({ nullable: true })
	data: string;

	@Column({ nullable: true, default:false })
	is_deleted: boolean;


	constructor(import_type:number) {
		super();
		this.number_of_attempts = 0;
		this.number_of_error = 0;
		this.number_of_records = 0;
		this.data = '';
		this.is_deleted = false;
		this.import_type = import_type;
	}
}
