
const process = require('process')
const get = require('./get')
const { S3Client } = require("@aws-sdk/client-s3");

const AWS_ACCESS_KEY_ID = get(process, 'env.AWS_ACCESS_KEY_ID', '')
const AWS_SECRET_ACCESS_KEY = get(process, 'env.AWS_SECRET_ACCESS_KEY', '')
const AWS_REGION = 'ap-southeast-1'

const AWS_ACCESS_KEY_ID2 = get(process, 'env.AWS_ACCESS_KEY_ID2', '')
const AWS_SECRET_ACCESS_KEY2 = get(process, 'env.AWS_SECRET_ACCESS_KEY2', '')
const AWS_REGION2 = 'ap-southeast-1';

module.exports = {
    client1: new S3Client({
        credentials: {
            accessKeyId: `${AWS_ACCESS_KEY_ID}`,
            secretAccessKey: `${AWS_SECRET_ACCESS_KEY}`
        },
        region: `${AWS_REGION}`,
    }),
    client2: new S3Client({
        credentials: {
            accessKeyId: `${AWS_ACCESS_KEY_ID2}`,
            secretAccessKey: `${AWS_SECRET_ACCESS_KEY2}`
        },
        region: `${AWS_REGION2}`,
    }),
}