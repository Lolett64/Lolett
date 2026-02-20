-- Allow authenticated users to read their own orders
CREATE POLICY "Users read own orders" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow authenticated users to read items of their own orders
CREATE POLICY "Users read own order_items" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );
