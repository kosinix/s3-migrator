/**
 * Usage: node delete.js
 */

//// Core modules

//// External modules
const { S3Client, CopyObjectCommand, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

//// Modules
const { client1, client2 } = require('./src/clients')
const { listObjects, deleteObjects } = require('./src/helpers')

    ;
(async () => {
    try {
        let objects = await listObjects(client2, new ListObjectsCommand({
            Bucket: 'hris-gsu-ph',
            Prefix: 'files-dev',
            // Marker: 'files-dev/00a006970ce1ec1715428b73b42c98f77654e1d7b8abe143415c127c035c7f41e583ed2ab102d583ad12b29fa0478c210d7c235a10c8ea005af45b117cd7fcb3.jpeg',
            // MaxKeys: 2
        }))
        // console.log('objects:', objects)
        let results = await deleteObjects(client2, objects)
        console.log('deleted:', results)

    } catch (err) {
        console.log(err)
    }
})()