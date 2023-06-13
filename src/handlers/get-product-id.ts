import * as AWS from "aws-sdk";
import { buildResponse } from "../utils";

const dynamo = new AWS.DynamoDB.DocumentClient();
const queryProducts = async (id) => {
  return await dynamo
    .query({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      KeyConditionExpression: "id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();
};
const queryStocks = async (id) => {
  return await dynamo
    .query({
      TableName: process.env.STOCKS_TABLE_NAME,
      KeyConditionExpression: "product_id = :id",
      ExpressionAttributeValues: { ":id": id },
    })
    .promise();
};
export const handler = async (event) => {
  const requestedItemId = event.pathParameters.productId;
  if (!requestedItemId) {
    return buildResponse(400, `Error: You are missing the path parameter id`);
  }
  const queryResults = await queryProducts(requestedItemId);
  const queryResultsStocks = await queryStocks(requestedItemId);
  console.log(queryResultsStocks);
  try {
    if (queryResults.Items && queryResultsStocks.Items) {
      queryResults.Items[0].count = queryResultsStocks.Items[0].count;

      return buildResponse(200, queryResults.Items);
    } else {
      return buildResponse(404, "Product not found");
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
