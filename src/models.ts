import { JsonSchemaType } from "aws-cdk-lib/aws-apigateway";

export interface IProduct {
    id: string,
    name: string,
    description: string,
    features: string,
    price: string,
    keywords: string,
    url: string,
    category: string,
    subcategory: string
}

export type GetProductsByIdEvent = {
    pathParameters: {
        productId: string
    }
};

const PRODUCT_PROPERTIES = {
    id: { type: JsonSchemaType.STRING },
    name: { type: JsonSchemaType.STRING },
    description: { type: JsonSchemaType.STRING },
    features: { type: JsonSchemaType.STRING },
    price: { type: JsonSchemaType.STRING },
    keywords: { type: JsonSchemaType.STRING },
    url: { type: JsonSchemaType.STRING },
    category: { type: JsonSchemaType.STRING },
    subcategory: { type: JsonSchemaType.STRING }
};

export const ProductSchema = {
    type: JsonSchemaType.OBJECT,
    properties: PRODUCT_PROPERTIES
};

export const ProductListSchema = {
    type: JsonSchemaType.ARRAY,
    items: ProductSchema
};

export const ErrorSchema = {
    type: JsonSchemaType.OBJECT,
    properties: {
        message: {
            type: JsonSchemaType.STRING
        }
    }
};
