import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { buildResponse } from "../utils";
// import { GetProductsByIdEvent } from "../models";
// import ProductsService from "../products-service";
// const TABLE_NAME = process.env.TABLE_NAME;
// const PRIMARY_KEY = process.env.PRIMARY_KEY;
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const requestedItemId = event.pathParameters?.product;
  console.log("event.pathParameters", event.pathParameters?.product);
  if (!requestedItemId) {
    return buildResponse(400, `Error: You are missing the path parameter id`);
  }
  const params = {
    TableName: "products",
    Key: {
      id: requestedItemId,
    },
  };
  try {
    const response = await db.get(params).promise();
    if (response.Item) {
      return buildResponse(200, response.Item);
    } else {
      return buildResponse(404, "Product not found");
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
