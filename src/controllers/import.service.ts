import { Request, Response } from "express";
import s3 from "./s3.service";
import { parse } from "csv-parse";
const { Parser } = require("json2csv");
import { EventEmitter } from "events";
import userService from "./User.service";
import roleService from "./role.service";
import importColumns from "../helpers/utils/import-columns";
import { Messages } from "../helpers/utils/messages";
import common from "../helpers/utils/common";
import { ImportEntity } from "../models/schemas/import";
import { ImportStatusType,ImportType,userType,contextType } from "../helpers/utils/enum";
import UserRepository from "../models/repositories/user.repo";
import RoleRepo from '../models/repositories/roles.repo';
import generator from "generate-password";
import rolesRepo from "../models/repositories/roles.repo";

export class ImportService {
  public EventEmitter: EventEmitter;

  constructor() {
    this.EventEmitter = new EventEmitter();
    this.EventEmitter.on("greet", this.importAction);
  }

  public async ImportAdmin(req: Request, res: Response) {
    try {
      //verifying file data
      await this.checkFileData(req.body.CSVString, await importColumns.admin);
      //uploading request csv to s3
      let upload: any = {};     
      let request_file_url = await s3.Importupload(
        process.env.AWS_BUCKET_IMPORTS,
        req.body.CSVString,
        (await common.newGuid()) + ".csv",
        "application/csv"
      );
      upload.status = ImportStatusType.NotStarted;
      upload.request_file_url = request_file_url;
      upload.created_by = req.meta.userId || 0;
      upload.data = req.body.CSVString;
      upload.columns = await importColumns.admin
      req.body.import_type = ImportType.admin
      upload.import_type = ImportType.admin
      // console.log('test--------->', upload)
      let result: any = await UserRepository.importSave(upload);
      upload.id = result.id;
      this.EventEmitter.emit("greet", upload, req);
      return res.status(200).json({ status: 'success'})
      // Trigger the event
            
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: error });
    }
  }

  public async ImportBusinessPartner(req: Request, res: Response) {
    try {   
      //verifying file data
      await this.checkFileData(req.body.CSVString, await importColumns.business_partner);   
      //uploading request csv to s3
      let upload: any = {};     
      let request_file_url = await s3.Importupload(
        process.env.AWS_BUCKET_IMPORTS,
        req.body.CSVString,
        (await common.newGuid()) + ".csv",
        "application/csv"
      );
      upload.status = ImportStatusType.NotStarted;
      upload.request_file_url = request_file_url;
      upload.created_by = req.meta.userId || 0;
      upload.data = req.body.CSVString;
      upload.columns = await importColumns.business_partner
      req.body.import_type = ImportType.business_partner
      upload.import_type = ImportType.business_partner
      // console.log('test--------->', upload)
      let result: any = await UserRepository.importSave(upload);
      upload.id = result.id;
      this.EventEmitter.emit("greet", upload, req);
      return res.status(200).json({ status: 'success'})
      // Trigger the event
            
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: error });
    }
  }

  public async ImportClient(req: Request, res: Response) {
    try {   
      //verifying file data
      await this.checkFileData(req.body.CSVString, await importColumns.client);   
      //uploading request csv to s3
      let upload: any = {};     
      let request_file_url = await s3.Importupload(
        process.env.AWS_BUCKET_IMPORTS,
        req.body.CSVString,
        (await common.newGuid()) + ".csv",
        "application/csv"
      );
      upload.status = ImportStatusType.NotStarted;
      upload.request_file_url = request_file_url;
      upload.created_by = req.meta.userId || 0;
      upload.data = req.body.CSVString;
      upload.columns = await importColumns.client
      req.body.import_type = ImportType.client
      upload.import_type = ImportType.client
      // console.log('test--------->', upload)
      let result: any = await UserRepository.importSave(upload);
      upload.id = result.id;
      this.EventEmitter.emit("greet", upload, req);
      return res.status(200).json({ status: 'success'})
      // Trigger the event
            
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: error });
    }
  }

  public async importAction(input: any, req: Request) {
    try {
      const parser = parse({ columns: true });
      var output: any[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const statusParams: any = {
        id: input.id,
        status: ImportStatusType.NotStarted,
        is_deleted: false,
        request_file_url:input.request_file_url,
        data:input.data,
        import_type:input.import_type,
        error: "",
      };
      // eslint-disable-next-line complexity
      await parser.on("readable", async function () {
        statusParams.status = ImportStatusType.InProgress;
        statusParams.updated_at = new Date();
        await UserRepository.importSave(statusParams);
        // await Importlog.findByIdAndUpdate(
        //   { _id: statusParams.import_id },
        //   { $set: statusParams }
        // );
        let record: any;
        let skip = false;
        while ((record = parser.read())) {
          // delete record[""];
          if (
            Object.keys(record).filter((key) => record[key].length !== 0).length
          ) {
            if (
              Object.keys(record).filter(
                (key) =>
                  record[key].toLowerCase().indexOf("list of abbreviation") > -1
              ).length ||
              skip == true
            ) {
              skip = true;
            } else {
              output.push(record);
            }
          }
        }
      });

      await parser.on("error", async function (err: any) {
        statusParams.status = ImportStatusType.Error;
        statusParams.error = err.message;
        statusParams.updated_at = new Date();
        await UserRepository.importSave(statusParams);
        // await Importlog.findByIdAndUpdate(
        //   { _id: statusParams.import_id },
        //   { $set: statusParams }
        // );
      });
      // eslint-disable-next-line complexity
      await parser.on("end", async () => {
        try {
          let failCount: number = 0;
          // console.log(output.length);
          let columnMapping: any = input.columns;
          let roles = await rolesRepo.getRolesForImport()
          let adminRole = (roles.find((item:any)=>{return item.name == contextType.ADMIN})).hasOwnProperty('id') ?  
          (roles.find((item:any)=>{return item.name == contextType.ADMIN})).id : 1   
          // let bpRole = (roles.find((item:any)=>{return item.name == contextType.BUSINESS_PARTNER})).hasOwnProperty('id') ?  
          // (roles.find((item:any)=>{return item.name == contextType.BUSINESS_PARTNER})).id : 1   
          let clientRole = (roles.find((item:any)=>{return item.name == contextType.CLIENT})).hasOwnProperty('id') ?  
          (roles.find((item:any)=>{return item.name == contextType.CLIENT})).id : 1    
          await common.asyncForEach(output, async (record: any) => {
            try {
              let response: any;
              record.created_by = req.meta.userId || 0;
              let payloadObj:any = await common.getPayload(columnMapping, record)
              if(!payloadObj.status){
                let password:any = generator.generate({ length: 10, numbers: true });
                payloadObj.password = password; 
                payloadObj.EncryptPassword = await common.stringToBinary64(password);
                if(req.body.import_type  == ImportType.admin){ 
                  payloadObj.roleId = adminRole
                  payloadObj.type = ImportType.admin
                  response = await UserRepository.ImportUser(payloadObj);
                }else if(req.body.import_type  == ImportType.business_partner){
                  //  payloadObj.roleId = bpRole
                   payloadObj.type = ImportType.business_partner
                  response = await UserRepository.ImportUser(payloadObj);
                }else{
                  payloadObj.roleId = clientRole
                  // payloadObj.Bp_role_id = bpRole
                  payloadObj.type = ImportType.client
                  response = await UserRepository.ImportUser(payloadObj);
                }
              }else{
                response = payloadObj
              } 
              delete record.created_by                  
              if (response && response.status == "error" || payloadObj.status ==  "error") {
                failCount++;
                record.status = await common.getErrorMessage(
                  response,
                  columnMapping
                );
              } else {
                record.status = "Success";
              }
            } catch (err) {
              console.log(err);
            }
          });
          // }
          console.log(
            `${output.length} User imported, ${
              output.length - failCount
            } success, ${failCount} failed`
          );

          statusParams.number_of_error = failCount;
          statusParams.number_of_records = output.length;
          statusParams.status = ImportStatusType.Completed;
          statusParams.updated_at = new Date();
          await UserRepository.importSave(statusParams);
        //   await Importlog.findByIdAndUpdate(
        //     { _id: statusParams.import_id },
        //     { $set: statusParams }
        //   );

          // convert to csv
          const fields = [];
          if (output.length) {
            for (const key in output[0]) {
              if (
                output[0].hasOwnProperty(key) &&
                !["tenant_id"].includes(key)
              ) {
                fields.push({
                  label: key,
                  value: key,
                  default: "",
                });
              }
            }
          }
          const parser = new Parser({ fields });
          const csvFile = parser.parse(output);
          const buff = new Buffer(csvFile);
          const base64data = buff.toString("base64");
          // save reponse file to s3
          const responseUrl: string = await s3.Importupload(
            process.env.AWS_BUCKET_IMPORTS,
            base64data,
            (await common.newGuid()) + ".csv",
            "application/csv"
          );
          // update job with response file URL
          statusParams.response_file_url = responseUrl;
          statusParams.updated_at = new Date();
          await UserRepository.importSave(statusParams);
        //   await Importlog.findByIdAndUpdate(
        //     { _id: statusParams.import_id },
        //     { $set: { response_file_url: responseUrl , updated_at:new Date()} }
        //   );
          return "done";
        } catch (error) {
          statusParams.status = ImportStatusType.Error;
          statusParams.error = error;
          statusParams.updated_at = new Date();
          // update job with response file URL
          await UserRepository.importSave(statusParams);
        //   await Importlog.findByIdAndUpdate(
        //     { _id: statusParams.import_id },
        //     { $set: { statusParams } }
        //   );
          throw error;
        }
      });
      const buf = Buffer.from(input.data, "base64");
      // Write data to the stream
      await parser.write(buf.toString("ascii"));

      // Close the readable stream
      await parser.end();
    } catch (err) {
      console.log(err);
    }
  }

  public async checkFileData(payload: any,importType:any) {
    const columnMapping = await importType;
    return new Promise((resolve, reject) => {
      const parser = parse({ columns: true });
      const records: any[] = [];
      parser.on("readable", async () => {
        let record: any;
        while ((record = parser.read())) {
          record = await  common.removeSpacesFromObjectKeys(record)
          // delete record[""];
          if (
            record &&
            Object.keys(record).filter((key) => record[key].length !== 0).length
          ) {
            var result: any = await this.checkPayload(columnMapping, record);
            if (result !== "Done") {
              reject(result);
            } else {
              resolve(true);
              records.push(record);
            }
          } else {
            reject(Messages.INVALID_FILE_EMPTY);
          }
        }
        reject(result ? result : reject(Messages.MISSING_COLUMNS));
      });
      parser.on("error", async function (err) {
        reject(Messages.INVALID_FILE_EMPTY_DATA);
      });
      parser.on("end", async () => {});
      const buf = Buffer.from(payload, "base64");
      // Write data to the stream
      parser.write(buf.toString("ascii"));
      // Close the readable stream
      parser.end();
    });
  }

  public async checkPayload(columnMapping: any, record: any) {
    const rec = { ...record };
    delete rec[""];
    for (const col of columnMapping) {
      if (rec[col.display_name] === undefined && col.is_optional === false) {
        // return 'Mandatory columns are missing in uploaded file. Please upload valid file';
        return (
          col.display_name +
          " are missing in uploaded file. Please upload valid file"
        );
      }
      delete rec[col.display_name];
    }
    if (Object.keys(rec).length === 0) return "Done";
    return Messages.INVALID_FILE_IMPORT;
  }

  public async getImports(req: Request, res: Response) {
    const ImportData = await UserRepository.get(req);
    // console.log('---------->', ImportData)
    if (ImportData && ImportData[0].length > 0) {
      await common.asyncForEach(ImportData[0], async (item: any, index: any) => {
        item.created_by = await UserRepository.getById(+item.created_by);
        item.updated_by = await UserRepository.getById(+item.updated_by);
        let request_file_url_filePath: any =
          item && item.request_file_url
            ? item.request_file_url.split("/").pop()
            : "NA";
        let reqUrl = await s3.getSignedUrlMethod(
          "getObject",
          process.env.AWS_BUCKET_IMPORTS!,
          request_file_url_filePath,
          604800
        );
        item.request_file_url = reqUrl;
        let response_file_url_filePath: any =
          item && item.response_file_url
            ? item.response_file_url.split("/").pop()
            : "NA";
        let resUrl = await s3.getSignedUrlMethod(
          "getObject",
          process.env.AWS_BUCKET_IMPORTS!,
          response_file_url_filePath,
          604800
        );
        item.response_file_url = resUrl;
      });
      return await res.status(200).json({
        status: "success",
        data: { ImportData: ImportData[0], total_count: ImportData[1] },
      });
    } else {
      return await res
        .status(200)
        .json({ status: "success", data: { ImportData: [], total_count: 0 }, });
    }
  } 
}

export default new ImportService();
