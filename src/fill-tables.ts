import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { PRODUCTS, STOCKS } from "./products";

const REGION = "eu-west-1"; // Update with your desired AWS region

const client = new DynamoDBClient({ region: REGION });

async function fillTables() {
  try {
    for (const product of PRODUCTS) {
      const params = {
        TableName: "products",
        Item: marshall(product),
      };
      await client.send(new PutItemCommand(params));
    }

    for (const stock of STOCKS) {
      const params = {
        TableName: "stocks",
        Item: marshall(stock),
      };
      await client.send(new PutItemCommand(params));
    }

    console.log("Data has been successfully inserted into DynamoDB tables.");
  } catch (error) {
    console.error("Error inserting data into DynamoDB tables:", error);
  }
}

fillTables();
