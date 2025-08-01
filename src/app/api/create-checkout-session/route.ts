import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if all required environment variables are present
    if (!process.env.STRIPE_PRICE_ID || !process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Server configuration error', 
        details: 'Missing required environment variables' 
      }, { status: 500 });
    }
    
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user from Supabase
    let supabaseClient;
    try {
      supabaseClient = createServerSupabaseClient();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Database connection error', 
        details: 'Failed to connect to database' 
      }, { status: 500 });
    }
    
    const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
    
    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    if (!user.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize Stripe client early
    let stripeClient;
    try {
      stripeClient = stripe();
    } catch (error) {
      return NextResponse.json({ 
        error: 'Payment system error', 
        details: 'Failed to initialize payment system' 
      }, { status: 500 });
    }

    // Create or get Stripe customer
    let customerId: string;
    
    // Check if user already has a Stripe customer ID
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    // If table doesn't exist, just create the Stripe customer without storing it
    if (subscriptionError && subscriptionError.code === 'PGRST116') {
      const customer = await stripeClient.customers.create({
        email: user.user.email!,
        metadata: {
          supabase_user_id: userId,
        },
      });
      customerId = customer.id;
    } else if (subscriptionError) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    } else if (subscription?.stripe_customer_id) {
      customerId = subscription.stripe_customer_id;
    } else {
      // Create new Stripe customer
      const customer = await stripeClient.customers.create({
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
      }
    }

    // Check if STRIPE_PRICE_ID is configured
    if (!process.env.STRIPE_PRICE_ID) {
      return NextResponse.json({ error: 'Stripe price ID not configured' }, { status: 500 });
    }

    // Create checkout session
    const session = await stripeClient.checkout.sessions.create({
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isStripeError = errorMessage.includes('Stripe') || errorMessage.includes('stripe');
    const isSupabaseError = errorMessage.includes('Supabase') || errorMessage.includes('supabase');
    
    let userMessage = 'Internal server error';
    if (isStripeError) {
      userMessage = 'Payment system error';
    } else if (isSupabaseError) {
      userMessage = 'Database error';
    }
    
    return NextResponse.json(
      { 
        error: userMessage, 
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 