import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { buildResponse } from '../utils';
import * as AWS from 'aws-sdk';

const TABLE_NAME = process.env.TABLE_NAME || '';

const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const params = {
        TableName: TABLE_NAME
    };

    try {
        const response = await db.scan(params).promise();
        return buildResponse(200, response.Items)
    } catch (dbError) {
        return buildResponse(500, dbError)
    }
};
