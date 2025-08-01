-- Create user_subscriptions table for Stripe integration
CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "upload_count" INTEGER NOT NULL DEFAULT 0,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "status" TEXT DEFAULT 'inactive',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Create unique index on user_id
CREATE UNIQUE INDEX IF NOT EXISTS "user_subscriptions_user_id_key" ON "public"."user_subscriptions"("user_id");

-- Create index on stripe_customer_id for faster lookups
CREATE INDEX IF NOT EXISTS "user_subscriptions_stripe_customer_id_idx" ON "public"."user_subscriptions"("stripe_customer_id");

-- Create index on stripe_subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS "user_subscriptions_stripe_subscription_id_idx" ON "public"."user_subscriptions"("stripe_subscription_id");

-- Add RLS (Row Level Security) policies
ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own subscription
CREATE POLICY "Users can view own subscription" ON "public"."user_subscriptions"
    FOR SELECT USING (auth.uid()::text = user_id);

-- Policy to allow users to update their own subscription
CREATE POLICY "Users can update own subscription" ON "public"."user_subscriptions"
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy to allow users to insert their own subscription
CREATE POLICY "Users can insert own subscription" ON "public"."user_subscriptions"
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy to allow service role to manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage all subscriptions" ON "public"."user_subscriptions"
    FOR ALL USING (auth.role() = 'service_role'); 