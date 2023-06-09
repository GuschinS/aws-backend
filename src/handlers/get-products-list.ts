import ProductsFunction from '../products-service';
import { buildResponse } from '../utils';

export const handler = async () => {
    try {
        const products = await ProductsFunction.getProducts();
        return buildResponse(200, products);
    }
    catch ({ error, message }) {
        return buildResponse(error || 404, { message: message || 'Unable to get products list.' });
    }
};
