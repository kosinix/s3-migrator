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
        }).map(o => {
            o.Bucket = command.input.Bucket
            return o
        })
        let promises = []
        for (let x = 0; x < objects.length; x++) {
            let object = objects[x]
            object.Bucket = command.input.Bucket
            let result = client.send(
                new GetObjectCommand({
                    Bucket: object.Bucket,
                    Key: object.Key,
                })
            )
            promises.push(result)
        }
        let results = await Promise.all(promises)

        for (let x = 0; x < results.length; x++) {
            let result = results[x]
            objects[x].Buffer = result.Body
            if (objects[x].Buffer) {
                objects[x].Buffer = await streamToBuffer(objects[x].Buffer)
            }
        }

        // Return objects from ListObjectCommand with prop Bucket, Buffer added
        return objects
    },
    deleteObjects: async (client, objects) => {
        let responses = []
        let promises = []
        for (let x = 0; x < objects.length; x++) {
            let object = objects[x]
            let result = client.send(
                new DeleteObjectCommand({
                    Bucket: object.Bucket,
                    Key: object.Key
                })
            )
            promises.push(result)

        }
        let results = await Promise.all(promises)
        for (let x = 0; x < results.length; x++) {
            let object = objects[x]
            responses.push({
                deleted: `${object.Bucket}/${object.Key}`,
                result: results[x],
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
            results.push(`${object.Bucket}/${object.Key} => ${options.Bucket}/${object.Key}`)
        }
        return results
    },
    toChunks: (array, chunkSize) => {
        let chunks = []
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize))
        }
        return chunks
    }
}