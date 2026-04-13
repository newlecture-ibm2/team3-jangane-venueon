UPDATE orders SET toss_order_id = 'venueon_order_' || user_id || '_' || id WHERE toss_order_id IS NULL;
