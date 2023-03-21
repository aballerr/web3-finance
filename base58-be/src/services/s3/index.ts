// @ts-nocheck
import AWS from "aws-sdk";
const BUCKET_NAME = process.env.IMAGES_BUCKET;
const s3 = new AWS.S3({});

/**
 * @description Uploads an image to S3
 * @param imageName Image name
 * @param base64Image Image body converted to base 64
 * @param type Image type
 * @return string S3 image URL or error accordingly
 */

const { devmode } = process.env;
const Bucket = devmode ? "getbase58development" : "getbase58prod";

export const uploadFile = (buffer, name, type) => {
  const params = {
    Body: buffer,
    Bucket,
    ContentType: type,
    Key: `${name}`,
  };
  return s3.upload(params).promise();
};

// { Bucket: "BUCKET_NAME", Key: "KEY" };
export const deleteFile = (file) => {
  const params = {
    Bucket: file.bucket,
    Key: file.key,
  };
  return s3.deleteObject(params).promise();
};

export const getPresignedUrl = (file) => {
  const params = {
    Bucket: file.bucket,
    Key: file.key,
    Expires: 36000,
  };

  return s3.getSignedUrl("getObject", params);
};
