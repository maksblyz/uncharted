import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('Environment variables check:', {
      hasStripePriceId: !!process.env.STRIPE_PRICE_ID,
      hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasStripePublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await createServerSupabaseClient().auth.admin.getUserById(userId);
    
    if (userError || !user.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create or get Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: subscription, error: subscriptionError } = await createServerSupabaseClient()
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    // If table doesn't exist, just create the Stripe customer without storing it
    if (subscriptionError && subscriptionError.code === 'PGRST116') {
      console.warn('user_subscriptions table does not exist, creating Stripe customer without storage');
      const customer = await stripe().customers.create({
        email: user.user.email!,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    } else if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } else if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripe().customers.create({
        email: user.user.email!,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;

      // Try to insert or update user subscription with Stripe customer ID
      const { error: upsertError } = await createServerSupabaseClient()
        .from('user_subscriptions')
        .upsert({ 
          user_id: userId, 
          stripe_customer_id: customerId,
          status: 'active'
        }, { 
          onConflict: 'user_id' 
        });

      if (upsertError) {
        console.warn('Could not store subscription in database, but continuing with Stripe checkout:', upsertError);
      }
    }

    // Check if STRIPE_PRICE_ID is configured
    if (!process.env.STRIPE_PRICE_ID) {
      console.error('STRIPE_PRICE_ID environment variable is not set');
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 });
    }

    // Create checkout session
    const session = await stripe().checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${request.headers.get('origin')}/upload?success=true`,
      cancel_url: `${request.headers.get('origin')}/upload?canceled=true`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 