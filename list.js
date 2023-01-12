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
const { listObjects } = require('./src/helpers')

const BUCKET1 = get(process, 'env.BUCKET1', 'codefleet-hris-storage')
const PREFIX1 = get(process, 'env.PREFIX1', 'files-live')
const MAX_KEYS = get(process, 'env.MAX_KEYS', 2)
const BUCKET2 = get(process, 'env.BUCKET2', 'hris-gsu-ph')


    ;
(async () => {
    let stream = null

    try {
        const fileName = `${Date.now()}-list.log`

        stream = fs.createWriteStream(fileName, { flags: 'a' })

        let counter = 0
        let objects = await listObjects(client1, new ListObjectsCommand({
            Bucket: BUCKET1,
            Prefix: PREFIX1,
            MaxKeys: MAX_KEYS
        }))
        counter += objects.length
        console.log(counter)
        let keys = objects.map((key)=>{
            return key.Key
        })
        // console.log(keys)
        stream.write(keys.join("\n"))

        while(objects.length > 0) {
            let lastObj = objects.pop()
            objects = await listObjects(client1, new ListObjectsCommand({
                Bucket: BUCKET1,
                Prefix: PREFIX1,
                MaxKeys: MAX_KEYS,
                Marker: lastObj.Key
            }))
            counter += objects.length
            console.log(counter, `MARKER=${lastObj.Key}`)
            let keys = objects.map((key)=>{
                return key.Key
            })
            stream.write("\n" + keys.join("\n"))
        }

        stream.end()

    } catch (err) {
        console.log(err)
    } finally {
        if (stream) {
            stream.end()
        }
        console.log(`Count ended.`)
    }
})()