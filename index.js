/**
 * Usage: node index.js
 */
//// Core modules
const process = require('process')

//// External modules
const { S3Client, CopyObjectCommand, ListObjectsCommand, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

//// Modules
const get = require('./src/get')
const streamToBuffer = require('./src/stream2buff')

const AWS_ACCESS_KEY_ID = get(process, 'env.AWS_ACCESS_KEY_ID', '')
const AWS_SECRET_ACCESS_KEY = get(process, 'env.AWS_SECRET_ACCESS_KEY', '')
const AWS_REGION = 'ap-southeast-1'

const AWS_ACCESS_KEY_ID2 = get(process, 'env.AWS_ACCESS_KEY_ID2', '')
const AWS_SECRET_ACCESS_KEY2 = get(process, 'env.AWS_SECRET_ACCESS_KEY2', '')
const AWS_REGION2 = 'ap-southeast-1'

const listObjects = async (client, command) => {
    let data = await client.send(command);
    let objects = get(data, 'Contents', []).filter((o) => {
        return o.Size > 0
    }).map(o => {
        o.Bucket = command.input.Bucket
        return o
    })
    return objects
}
const downloadObjects = async (client, command) => {
    let data = await client.send(command);
    let objects = get(data, 'Contents', []).filter((o) => {
        return o.Size > 0
    })
    for (let x = 0; x < objects.length; x++) {
        let object = objects[x]
        object.Bucket = command.input.Bucket
        let result = await client.send(
            new GetObjectCommand({
                Bucket: object.Bucket,
                Key: object.Key,
            })
        )
        object.Buffer = result.Body
        if (object.Buffer) {
            object.Buffer = await streamToBuffer(object.Buffer)
        }

    }
    // Return objects from ListObjectCommand with prop Bucket, Buffer added
    return objects
}
const deleteObjects = async (client, objects) => {
    let responses = []
    for (let x = 0; x < objects.length; x++) {
        let object = objects[x]
        let result = await client.send(
            new DeleteObjectCommand({
                Bucket: object.Bucket,
                Key: object.Key
            })
        )
        console.log(result)
        responses.push(result)
    }
    return responses
}
const migrate = async (objects, client, options) => {

    let results = []
    for (let x = 0; x < objects.length; x++) {
        let object = objects[x]
        await client.send(new PutObjectCommand(
            {
                Body: object.Buffer,
                Bucket: options.Bucket,
                Key: object.Key
            }
        ))
        // await client.send(new CopyObjectCommand(
        //     {
        //         Bucket: options.Bucket,
        //         Key: object.Key
        //     }
        // ))
        results.push({
            from: `${object.Bucket}/${object.Key}`,
            to: `${options.Bucket}/${object.Key}`,
        })
    }
    return results
}

    ;
(async () => {
    try {

        // const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

        const client1 = new S3Client({
            credentials: {
                accessKeyId: `${AWS_ACCESS_KEY_ID}`,
                secretAccessKey: `${AWS_SECRET_ACCESS_KEY}`
            },
            region: `${AWS_REGION}`,
        });

        const client2 = new S3Client({
            credentials: {
                accessKeyId: `${AWS_ACCESS_KEY_ID2}`,
                secretAccessKey: `${AWS_SECRET_ACCESS_KEY2}`
            },
            region: `${AWS_REGION2}`,
        });

        // let objects = await listObjects(client1, new ListObjectsCommand({
        //     Bucket: 'codefleet-hris-storage',
        //     Prefix: 'files-dev',
        //     // Marker: 'files-dev/00a006970ce1ec1715428b73b42c98f77654e1d7b8abe143415c127c035c7f41e583ed2ab102d583ad12b29fa0478c210d7c235a10c8ea005af45b117cd7fcb3.jpeg',
        //     MaxKeys: 2
        // }))

        let objects = await listObjects(client2, new ListObjectsCommand({
            Bucket: 'hris-gsu-ph',
            Prefix: 'files-dev',
            // Marker: 'files-dev/00a006970ce1ec1715428b73b42c98f77654e1d7b8abe143415c127c035c7f41e583ed2ab102d583ad12b29fa0478c210d7c235a10c8ea005af45b117cd7fcb3.jpeg',
            // MaxKeys: 2
        }))

        // let objects = await downloadObjects(client1, new ListObjectsCommand({
        //     Bucket: 'codefleet-hris-storage',
        //     Prefix: 'files-dev',
        //     // Marker: 'files-dev/00a006970ce1ec1715428b73b42c98f77654e1d7b8abe143415c127c035c7f41e583ed2ab102d583ad12b29fa0478c210d7c235a10c8ea005af45b117cd7fcb3.jpeg',
        //     MaxKeys: 2
        // }))

        console.log('objects', objects)
        // let results = await migrate(objects, client2, {
        //     Bucket: 'hris-gsu-ph',
        // })
        let results = await deleteObjects(objects, client2)
        console.log('c', results)

    } catch (err) {
        console.log(err)
    } finally {
    }
})()