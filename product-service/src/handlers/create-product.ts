import { buildResponse } from "../utils";

const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();

const scan = async () => {
  const scanResults = await dynamo
    .scan({
      TableName: process.env.PRODUCTS_TABLE_NAME,
    })
    .promise();
  return scanResults.Items;
};

const put = async (item) => {
  return dynamo
    .put({
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: item,
    })
    .promise();
};

export const handler = async (event) => {
  console.log("createProductEvent:", JSON.stringify(event));
  const item = {
    id: "10",
    title: "title-test",
    price: 25.4,
    image:
      "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg",
    rating: { count: 259, rate: 4.1 },
    category: "men's clothing",
    description: "Slim-fitting",
  };
  await put(item);
  const scan2Results = await scan();
  try {
    if (scan2Results) {
      return buildResponse(200, scan2Results);
    }
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
