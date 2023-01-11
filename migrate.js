/**
 * Usage: node index.js
 */

//// Core modules
const fs = require('fs')
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
const MARKER = get(process, 'env.MARKER', '')
const BUCKET2 = get(process, 'env.BUCKET2', 'hris-gsu-ph')


    ;
(async () => {
    let stream = null
    try {
        const fileName = `${Date.now()}.log`

        stream = fs.createWriteStream(fileName, { flags: 'a' })

        let counter = 0
        let objects = await downloadObjects(client1, new ListObjectsCommand({
            Bucket: BUCKET1,
            Prefix: PREFIX1,
            Marker: MARKER,
            MaxKeys: MAX_KEYS
        }))

        let results = await migrate(objects, client2, {
            Bucket: BUCKET2,
        })
        await deleteObjects(client1, objects)

        stream.write(results.join("\n"))
        counter += results.length
        console.log(`${counter} objects migrated. See ${fileName}`)
        while (objects.length > 0) {
            let lastObj = objects.pop()
            objects = await downloadObjects(client1, new ListObjectsCommand({
                Bucket: BUCKET1,
                Prefix: PREFIX1,
                MaxKeys: MAX_KEYS,
                Marker: lastObj.Key
            }))
            let results = await migrate(objects, client2, {
                Bucket: BUCKET2,
            })
            await deleteObjects(client1, objects)

            stream.write("\n" + results.join("\n"))
            counter += results.length
            console.log(`${counter} objects migrated. See ${fileName}`)
        }
        stream.end()
    } catch (err) {
        console.log(err)
    } finally {
        if (stream) {
            stream.end()
        }
    }
})()