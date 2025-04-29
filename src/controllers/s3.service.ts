import AWS, { AWSError } from 'aws-sdk';
import { Request, Response } from 'express';
import common from '../helpers/utils/common';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

 class S3Service {
   public async upload(req: Request, res: Response): Promise<any> {
     try {
       let fileName:any = await common.removeSpace(req.body.file_name.replace(/[^\w\s.]/g, ""))//.trim()//.replace(" ",""); 
       const binaryData = Buffer.from(req.body.base64_string, "base64");
       const putRequest: AWS.S3.Types.PutObjectRequest = {
         Bucket: process.env.AWS_IMAGE_UPLOADS
           ? process.env.AWS_IMAGE_UPLOADS
           : "cp-s3-image-uploads",
         Key: fileName,
         Body: binaryData,
         ContentType: req.body.content_type,
         ACL: "private", //'public-read',
       };
       let uplodedData: any = await s3
         .upload(putRequest)
         .promise()
         .catch((err) => {
           console.log(err);
         });
       if (uplodedData && uplodedData.Location) {
        let data:any ={}
        data['location']=uplodedData.Location;
        data['Signed_url']=await this.getSignedUrlMethod(
          "getObject",
          process.env.AWS_IMAGE_UPLOADS!,
          uplodedData.Location.split("/").pop(),
          604800
        );;
         res
           .status(200)
           .json({ status: "success", data: data});
       } else {
         res
           .status(400)
           .json({ status: "error", message: "Failed to upload data" });
       }
     } catch (err) {
       res
         .status(400)
         .json({ status: "error", message: "Failed to upload data" });
     }
   }

   public async Importupload(bucket_name:any, file_data:any,file_name:any,content_type:any){
    try {
       const binaryData = Buffer.from(file_data, "base64");
      const putRequest: AWS.S3.Types.PutObjectRequest = {
        Bucket: bucket_name,          
        Key: await common.removeSpace(file_name.replace(/[^\w\s.]/g, "")),
        Body: binaryData,
        ContentType: content_type,
        ACL: "private", //'public-read',
      };
      let uplodedData: any = await s3
        .upload(putRequest)
        .promise()
        .catch((err) => {
          console.log(err);
        });
      if (uplodedData && uplodedData.Location) {
       return uplodedData.Location
      } else {
        return "Failed to upload data"
      }
    } catch (err) {
      console.log(err)
      return{ status: "error", message: "Failed to upload data"};
    }
  }

   public async uploadPdf(req: any, res: Response): Promise<any> {
    try {
      let fileName = await common.removeSpace(req.file_name.replace(/[^\w\s.]/g, ""));  
      const binaryData = Buffer.from(req.file_data, 'utf-8');
      const putRequest: AWS.S3.Types.PutObjectRequest = {
        Bucket: req.bucket_name,
        Key: fileName,
        Body: binaryData,
        ContentType: req.content_type,
        ContentDisposition: 'attachment',
        ACL: "private", //'public-read',
      };
      let uplodedData: any = await s3
        .upload(putRequest)
        .promise()
        .catch((err) => {
          console.log(err);
        });
      if (uplodedData && uplodedData.Location) {
        return uplodedData.Location;
      }
    } catch (err) {
      console.log('s3------>', err)
      res
        .status(400)
        .json({ status: "error", message: "Failed to upload data" });
    }
  }

   public async getSignedUrlMethod(actionType: string, bucketName: string, key: string, expires: number): Promise<string> {
     return await s3.getSignedUrlPromise(actionType, {
       Bucket: bucketName,
       Key: key,
       Expires: expires,
     });
   }
 }

export default new S3Service();
