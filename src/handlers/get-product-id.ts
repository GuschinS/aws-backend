import { GetProductsByIdEvent } from '../models';
import ProductsFunction from '../products-service';
import { buildResponse } from '../utils';

export const handler = async (event: GetProductsByIdEvent) => {
    try {
        const { productId } = event.pathParameters;
        const product = await ProductsFunction.getProductById(productId);
        return buildResponse(200, product);
    }
    catch ({ error, message }) {
        return buildResponse(error, { message });
    }
};
