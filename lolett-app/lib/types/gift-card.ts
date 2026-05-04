// Shape JSON retourné par le RPC public.redeem_gift_card_atomic.
// Cf. supabase/migrations/20260428000003_redeem_gift_card_atomic.sql.

export type RedeemFailureReason =
  | 'invalid_amount'
  | 'not_found'
  | 'expired'
  | 'insufficient'
  | 'pending'
  | 'fully_redeemed'
  | 'cancelled';

export type GiftCardStatus = 'active' | 'pending' | 'fully_redeemed' | 'cancelled';

export interface RedeemGiftCardSuccess {
  success: true;
  card_id: string;
  new_balance: number;
  new_status: GiftCardStatus;
  idempotent: boolean;
}

export interface RedeemGiftCardFailure {
  success: false;
  reason: RedeemFailureReason;
  balance?: number;
}

export type RedeemGiftCardResult = RedeemGiftCardSuccess | RedeemGiftCardFailure;
