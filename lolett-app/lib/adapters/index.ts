import type {
  ProductRepository,
  LookRepository,
  CategoryRepository,
  OrderRepository,
} from './types';

export * from './types';

type Adapters = {
  productRepository: ProductRepository;
  lookRepository: LookRepository;
  categoryRepository: CategoryRepository;
  orderRepository: OrderRepository;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const adapters: Adapters = require('./supabase');

export const { productRepository, lookRepository, categoryRepository, orderRepository } = adapters;
