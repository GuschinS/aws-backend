import { PRODUCTS } from './products';

export default  {
    getProductById: (id: string) => {
        const product = PRODUCTS.find((item) => item.id === id);
        return product ? Promise.resolve(product) : Promise.reject({ error: 404, message: 'Product not found' });
    },
    getProducts: () => Promise.resolve(PRODUCTS)
}
