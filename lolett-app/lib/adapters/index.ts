export * from './types';

// Toggle via USE_MOCK_DATA in .env.local
// Set to "false" when Supabase has real data
const useMock = process.env.USE_MOCK_DATA !== 'false';

if (useMock) {
  console.warn('[adapters] Using MOCK data — set USE_MOCK_DATA=false to use Supabase');
}

export const {
  productRepository,
  lookRepository,
  categoryRepository,
  orderRepository,
} = useMock
  ? require('./mock')
  : require('./supabase');
