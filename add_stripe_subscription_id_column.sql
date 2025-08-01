-- Add stripe_subscription_id column to existing user_subscriptions table
ALTER TABLE "public"."user_subscriptions" 
ADD COLUMN IF NOT EXISTS "stripe_subscription_id" TEXT;

-- Create index on stripe_subscription_id for faster lookups
CREATE INDEX IF NOT EXISTS "user_subscriptions_stripe_subscription_id_idx" ON "public"."user_subscriptions"("stripe_subscription_id");

-- Add status column if it doesn't exist
ALTER TABLE "public"."user_subscriptions" 
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'inactive';

-- Update existing rows to have a default status
UPDATE "public"."user_subscriptions" 
SET "status" = 'inactive' 
WHERE "status" IS NULL; 