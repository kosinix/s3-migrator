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

const MaxKeys = get(process, 'env.MaxKeys', 2)

    ;
(async () => {
    try {

        let objects = await downloadObjects(client1, new ListObjectsCommand({
            Bucket: 'codefleet-hris-storage',
            Prefix: 'files-dev',
            MaxKeys: MaxKeys
        }))
        // console.log('objects:', objects)
        let results = await migrate(objects, client2, {
            Bucket: 'hris-gsu-ph',
        })
        console.log('migrated:', results)

        results = await deleteObjects(client1, objects)
        console.log('results:', results)

    } catch (err) {
        console.log(err)
    } finally {
    }
})()