-- Function to safely refund Techcoins for a cancelled order
-- Usage: SELECT refund_order_techcoins(6); -- Replace 6 with the Order ID

CREATE OR REPLACE FUNCTION refund_order_techcoins(p_order_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order RECORD;
    v_user_id UUID;
    v_techcoins_used INT;
    v_new_balance INT;
BEGIN
    -- 1. Get order details
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found');
    END IF;

    -- Allow refund even if not cancelled? Or assume manual fix for any status?
    -- Better safely ensure we don't double refund.
    
    v_techcoins_used := COALESCE(v_order.techcoins_used, 0);
    v_user_id := v_order.user_id;

    IF v_techcoins_used <= 0 THEN
        RETURN jsonb_build_object('success', true, 'message', 'No techcoins to refund');
    END IF;

    -- 2. Check if already refunded (prevent double refund)
    IF EXISTS (
        SELECT 1 FROM public.techcoin_transactions 
        WHERE description = 'คืนเหรียญจากการยกเลิกคำสั่งซื้อ #' || p_order_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Already refunded');
    END IF;

    -- 3. Refund Transaction
    INSERT INTO public.techcoin_transactions (user_id, amount, type, description)
    VALUES (v_user_id, v_techcoins_used, 'earn', 'คืนเหรียญจากการยกเลิกคำสั่งซื้อ #' || p_order_id);

    -- 4. Update Profile Balance
    UPDATE public.profiles
    SET techcoin_balance = COALESCE(techcoin_balance, 0) + v_techcoins_used
    WHERE id = v_user_id;

    RETURN jsonb_build_object('success', true, 'refunded', v_techcoins_used);
END;
$$;
