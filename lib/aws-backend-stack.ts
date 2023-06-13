import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigw from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { ErrorSchema, ProductListSchema, ProductSchema } from "../src/models";
import { CORS_PREFLIGHT_SETTINGS } from "../src/utils";
import * as iam from "aws-cdk-lib/aws-iam";

export class NodejsAwsShopApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const readPolicyStatement = new iam.PolicyStatement({
      actions: ["dynamodb:Query", "dynamodb:Scan", "dynamodb:GetItem"],
      resources: [
        "arn:aws:dynamodb:eu-west-1:103631645651:table/products",
        "arn:aws:dynamodb:eu-west-1:103631645651:table/stocks",
      ],
    });

    const writePolicyStatement = new iam.PolicyStatement({
      actions: [
        "dynamodb:Scan",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchWriteItem",
      ],
      resources: [
        "arn:aws:dynamodb:eu-west-1:103631645651:table/products",
        "arn:aws:dynamodb:eu-west-1:103631645651:table/stocks",
      ],
    });

    const COMMON_LAMBDA_PROPS: Partial<NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(300),
      environment: {
        PRODUCTS_TABLE_NAME: "products",
        STOCKS_TABLE_NAME: "stocks",
        REGION: "eu-west-1",
      },
    };

    const getProductsList = new NodejsFunction(this, "GetProductsListHandler", {
      functionName: "getProductsList",
      entry: "./src/handlers/get-products-list.ts",
      ...COMMON_LAMBDA_PROPS,
    });
    getProductsList.addToRolePolicy(readPolicyStatement);

    const getProductsById = new NodejsFunction(this, "GetProductsByIdHandler", {
      functionName: "getProductId",
      entry: "./src/handlers/get-product-id.ts",
      ...COMMON_LAMBDA_PROPS,
    });
    getProductsById.addToRolePolicy(readPolicyStatement);

    const createProduct = new NodejsFunction(this, "CreateProductHandler", {
      functionName: "createProduct",
      entry: "./src/handlers/create-product.ts",
      ...COMMON_LAMBDA_PROPS,
    });
    createProduct.addToRolePolicy(writePolicyStatement);

    const api = new apigw.RestApi(this, "products-api", {
      restApiName: "Products Service",
      description: "This service server products.",
    });

    const productModel = api.addModel("ProductModel", {
      modelName: "ProductModel",
      schema: ProductSchema,
    });

    const productListModel = api.addModel("ProductListModel", {
      modelName: "ProductListModel",
      schema: ProductListSchema,
    });

    const productRequestModel = api.addModel("ProductBaseModel", {
      modelName: "ProductBaseModel",
      schema: ProductSchema,
    });

    const errorModel = api.addModel("ErrorModel", {
      modelName: "ErrorModel",
      schema: ErrorSchema,
    });

    const getProductsIntegration = new apigw.LambdaIntegration(getProductsList);
    const getProductsByIdIntegration = new apigw.LambdaIntegration(
      getProductsById
    );
    const createProductIntegration = new apigw.LambdaIntegration(createProduct);

    const productsApi = api.root.addResource("products");
    const productIdApi = productsApi.addResource("{productId}");

    productsApi.addCorsPreflight(CORS_PREFLIGHT_SETTINGS);
    productIdApi.addCorsPreflight(CORS_PREFLIGHT_SETTINGS);

    productsApi.addMethod("GET", getProductsIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": productListModel,
          },
        },
        {
          statusCode: "404",
          responseModels: {
            "application/json": errorModel,
          },
        },
      ],
    });

    const createProductsRequestValidator = api.addRequestValidator(
      "CreateProductRequestValidator",
      {
        validateRequestParameters: false,
        validateRequestBody: true,
      }
    );

    productsApi.addMethod("POST", createProductIntegration, {
      requestModels: {
        "application/json": productRequestModel,
      },
      requestValidator: createProductsRequestValidator,
      methodResponses: [
        {
          statusCode: "200",
        },
        {
          statusCode: "404",
          responseModels: {
            "application/json": errorModel,
          },
        },
      ],
    });

    productIdApi.addMethod("GET", getProductsByIdIntegration, {
      methodResponses: [
        {
          statusCode: "200",
          responseModels: {
            "application/json": productModel,
          },
        },
        {
          statusCode: "404",
          responseModels: {
            "application/json": errorModel,
          },
        },
      ],
    });
  }
}
