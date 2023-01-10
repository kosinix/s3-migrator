/**
 * Usage: node index.js
 */

//// Core modules
const process = require('process')

//// External modules
const { S3Client, CopyObjectCommand, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

//// Modules
const get = require('./src/get')
const { client1, client2 } = require('./src/clients')
const { migrate, downloadObjects, deleteObjects } = require('./src/helpers')

const BUCKET1 = get(process, 'env.BUCKET1', 'codefleet-hris-storage')
const PREFIX1 = get(process, 'env.PREFIX1', 'files-live')
const MAX_KEYS = get(process, 'env.MAX_KEYS', 2)
const BUCKET2 = get(process, 'env.BUCKET2', 'hris-gsu-ph')


    ;
(async () => {
    try {

        let objects = await downloadObjects(client1, new ListObjectsCommand({
            Bucket: BUCKET1,
            Prefix: PREFIX1,
            MaxKeys: MAX_KEYS
        }))
        // console.log('objects:', objects)
        let results = await migrate(objects, client2, {
            Bucket: BUCKET2,
        })
        console.log('migrated:', results)

        results = await deleteObjects(client1, objects)
        console.log('results:', results)

    } catch (err) {
        console.log(err)
    } finally {
    }
})()