import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as AWS from "aws-sdk";
import { buildResponse } from "../utils";

const PRODUCTS_TABLE_NAME = "products";
const STOCKS_TABLE_NAME = "stocks";
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("getProductsListEvent:", JSON.stringify(event));
  try {
    const scanParams = {
      TableName: PRODUCTS_TABLE_NAME,
    };
    const firstTableData = await db.scan(scanParams).promise();
    const firstTableItems = firstTableData.Items;
    const secondTableItems = [];

    for (const item of firstTableItems) {
      const id = item.id;
      const queryParams = {
        TableName: STOCKS_TABLE_NAME,
        KeyConditionExpression: "product_id = :id",
        ExpressionAttributeValues: {
          ":id": id,
        },
      };

      const secondTableData = await db.query(queryParams).promise();
      const secondTableItemsData = secondTableData.Items;

      if (secondTableItemsData) {
        const count = secondTableItemsData[0].count;
        const updatedItem = { ...item, count };
        secondTableItems.push(updatedItem);
      }
    }
    return buildResponse(200, secondTableItems);
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
