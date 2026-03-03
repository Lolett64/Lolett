// Barrel — re-exports all user adapters for backward compatibility
export { getProfile, updateProfile } from './user/profile';
export { getAddresses, createAddress, updateAddress, deleteAddress } from './user/addresses';
export { getUserReviews, deleteReview, getFavorites, addFavorite, removeFavorite, getLoyaltyRewards } from './user/social';
export { getUserOrders, getOrderById } from './user/orders';
