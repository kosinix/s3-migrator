//// Core modules

//// External modules
const { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

//// Modules
const get = require('./get')
const streamToBuffer = require('./stream2buff')

module.exports = {
    listObjects: async (client, command) => {
        let data = await client.send(command);
        let objects = get(data, 'Contents', []).filter((o) => {
            return o.Size > 0
        }).map(o => {
            o.Bucket = command.input.Bucket
            return o
        })
        return objects
    },
    downloadObjects: async (client, command) => {
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
    },
    deleteObjects: async (client, objects) => {
        let responses = []
        for (let x = 0; x < objects.length; x++) {
            let object = objects[x]
            let result =await client.send(
                new DeleteObjectCommand({
                    Bucket: object.Bucket,
                    Key: object.Key
                })
            )
            responses.push({
                deleted: `${object.Bucket}/${object.Key}`,
                result: result,
            })
        }
        return responses
    },
    migrate: async (objects, client, options) => {
    
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
}