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
const { listObjects } = require('./src/helpers')

const BUCKET1 = get(process, 'env.BUCKET1', 'codefleet-hris-storage')
const PREFIX1 = get(process, 'env.PREFIX1', 'files-live')
const MAX_KEYS = get(process, 'env.MAX_KEYS', 2)
const BUCKET2 = get(process, 'env.BUCKET2', 'hris-gsu-ph')


    ;
(async () => {
    try {
        let counter = 0
        let objects = await listObjects(client1, new ListObjectsCommand({
            Bucket: BUCKET1,
            Prefix: PREFIX1,
            MaxKeys: MAX_KEYS
        }))
        counter += objects.length
        console.log(counter)
        while(objects.length > 0) {
            let lastObj = objects.pop()
            objects = await listObjects(client1, new ListObjectsCommand({
                Bucket: BUCKET1,
                Prefix: PREFIX1,
                MaxKeys: MAX_KEYS,
                Marker: lastObj.Key
            }))
            counter += objects.length
            console.log(counter, `last marker ${lastObj.Key}`)
        }
    } catch (err) {
        console.log(err)
    } finally {
        console.log(`Count ended.`)
    }
})()