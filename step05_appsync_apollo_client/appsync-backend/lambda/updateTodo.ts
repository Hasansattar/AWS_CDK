import * as AWS from 'aws-sdk';
//const AWS = require('aws-sdk');
// Initialize DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

// Define type for update parameters
type Params = {
    TableName: string,
    Key: { [key: string]: any },
    ExpressionAttributeValues: { [key: string]: any },
    ExpressionAttributeNames: { [key: string]: string },
    UpdateExpression: string,
    ReturnValues: string
}

async function updateTodo(todo: any): Promise<any | null> {
    // Check if TODOS_TABLE is defined
    if (!process.env.TODOS_TABLE) {
        throw new Error('TODOS_TABLE environment variable is not defined');
    }

    // Initialize update parameters
    let params: Params = {
        TableName: process.env.TODOS_TABLE,
        Key: {
            id: todo.id
        },
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        UpdateExpression: "",
        ReturnValues: "UPDATED_NEW"
    };

    let prefix = "set ";
    let attributes = Object.keys(todo);

    // Construct UpdateExpression, ExpressionAttributeValues, and ExpressionAttributeNames
    for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        if (attribute !== "id") {
            params.UpdateExpression += `${prefix}#${attribute} = :${attribute}`;
            params.ExpressionAttributeValues[`:${attribute}`] = todo[attribute];
            params.ExpressionAttributeNames[`#${attribute}`] = attribute;
            prefix = ", ";
        }
    }

    try {
        // Update item in DynamoDB table
        await docClient.update(params).promise();
        return todo;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }
}

export default updateTodo;
