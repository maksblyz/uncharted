import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event;

  try {
    event = stripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as { metadata: Record<string, string> | null };
        const userId = session.metadata?.userId;

        // Update user subscription to premium
        await createServerSupabaseClient()
          .from('user_subscriptions')
          .update({ is_premium: true })
          .eq('user_id', userId);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as { customer: string };
        const customerId = subscription.customer;

        // Find user by Stripe customer ID and downgrade to free
        const { data: userSub } = await createServerSupabaseClient()
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSub) {
          await createServerSupabaseClient()
            .from('user_subscriptions')
            .update({ is_premium: false })
            .eq('user_id', userSub.user_id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as { customer: string };
        const customerId = invoice.customer;

        // Find user by Stripe customer ID and downgrade to free
        const { data: userSub } = await createServerSupabaseClient()
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userSub) {
          await createServerSupabaseClient()
            .from('user_subscriptions')
            .update({ is_premium: false })
            .eq('user_id', userSub.user_id);
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 