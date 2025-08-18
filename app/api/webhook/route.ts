// app/api/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/webhook-client";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  console.log("🔥 WEBHOOK CALLED!", new Date().toISOString());
  
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("✅ Webhook verified, event type:", event.type);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("💳 Checkout session completed");
      console.log("📋 Session details:");
      console.log("  - Mode:", session.mode);
      console.log("  - Customer:", session.customer);
      console.log("  - Metadata:", JSON.stringify(session.metadata, null, 2));

      if (session.mode === "payment") {
        console.log("🎯 Processing LIFETIME payment");
        
        // Check if user already has ANY active subscription (not just lifetime)
        const { data: existingSubscriptions, error: checkError } = await supabaseAdmin
          .from("subscriptions")
          .select("*")
          .eq("ifc_user_id", session.metadata?.ifc_user_id)
          .eq("status", "active");

        if (checkError) {
          console.error("Failed to check for existing subscriptions:", checkError);
          break;
        }

        // Check specifically for existing lifetime
        const hasLifetime = existingSubscriptions.some(sub => sub.plan === "lifetime");

        if (hasLifetime) {
          console.log("⚠️ User already has an active lifetime subscription, skipping insert");
          break;
        }

        console.log(`🔍 Found ${existingSubscriptions.length} existing active subscriptions`);
        
        const insertData = {
          stripe_customer_id: session.customer as string || null,
          stripe_subscription_id: null,
          plan: "lifetime",
          status: "active",
          ifc_user_id: session.metadata?.ifc_user_id,
          current_period_end: null,
          cancel_at: null,
        };
        
        console.log("📝 About to insert:", JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabaseAdmin
          .from("subscriptions")
          .insert(insertData);

        if (error) {
          console.error("❌ FAILED to insert lifetime subscription:");
          console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
          console.log("✅ SUCCESS! Lifetime subscription inserted:");
          console.log("Inserted data:", JSON.stringify(data, null, 2));
          
          // Deactivate old premium subscription
          const { error: deactivateError } = await supabaseAdmin
            .from("subscriptions")
            .update({ status: "inactive" })
            .eq("ifc_user_id", session.metadata?.ifc_user_id)
            .eq("plan", "premium")
            .eq("status", "active");
          
          if (deactivateError) {
            console.error("❌ Failed to deactivate old premium subscription:", deactivateError);
          } else {
            console.log("🔄 Successfully deactivated old premium subscription");
          }

          // Schedule duplicate cleanup after a short delay
          setTimeout(async () => {
            try {
              console.log("🧹 Running duplicate cleanup check...");
              
              // Find all active subscriptions for this user
              const { data: userSubscriptions, error: fetchError } = await supabaseAdmin
                .from("subscriptions")
                .select("*")
                .eq("ifc_user_id", session.metadata?.ifc_user_id)
                .eq("status", "active")
                .order("created_at", { ascending: false }); // Newest first

              if (fetchError) {
                console.error("❌ Error fetching subscriptions for cleanup:", fetchError);
                return;
              }

              if (!userSubscriptions || userSubscriptions.length <= 1) {
                console.log("✅ No duplicates found, cleanup not needed");
                return;
              }

              // Group by plan type
              const lifetimeSubscriptions = userSubscriptions.filter(sub => sub.plan === "lifetime");
              const premiumSubscriptions = userSubscriptions.filter(sub => sub.plan === "premium");

              console.log(`🔍 Found ${lifetimeSubscriptions.length} lifetime and ${premiumSubscriptions.length} premium subscriptions`);

              // Handle lifetime duplicates
              if (lifetimeSubscriptions.length > 1) {
                console.log("🚨 Multiple lifetime subscriptions detected, removing duplicates...");
                
                // Keep the newest one, mark others as inactive
                const toKeep = lifetimeSubscriptions[0]; // Newest (first due to order)
                const toRemove = lifetimeSubscriptions.slice(1); // All others

                for (const duplicate of toRemove) {
                  const { error: deleteError } = await supabaseAdmin
                    .from("subscriptions")
                    .update({ status: "inactive" })
                    .eq("id", duplicate.id);

                  if (deleteError) {
                    console.error(`❌ Failed to deactivate duplicate lifetime subscription ${duplicate.id}:`, deleteError);
                  } else {
                    console.log(`✅ Deactivated duplicate lifetime subscription ${duplicate.id}`);
                  }
                }

                console.log(`🧹 Cleanup complete: Kept ${toKeep.id}, removed ${toRemove.length} duplicates`);
              }

              // Handle premium duplicates (in case of premium subscriptions)
              if (premiumSubscriptions.length > 1) {
                console.log("🚨 Multiple premium subscriptions detected, removing duplicates...");
                
                const toKeep = premiumSubscriptions[0];
                const toRemove = premiumSubscriptions.slice(1);

                for (const duplicate of toRemove) {
                  const { error: deleteError } = await supabaseAdmin
                    .from("subscriptions")
                    .update({ status: "inactive" })
                    .eq("id", duplicate.id);

                  if (deleteError) {
                    console.error(`❌ Failed to deactivate duplicate premium subscription ${duplicate.id}:`, deleteError);
                  } else {
                    console.log(`✅ Deactivated duplicate premium subscription ${duplicate.id}`);
                  }
                }
              }

            } catch (cleanupError) {
              console.error("❌ Error during duplicate cleanup:", cleanupError);
            }
          }, 3000); // Wait 3 seconds before running cleanup
        }
      } else if (session.mode === "subscription") {
        console.log("🔄 Processing SUBSCRIPTION payment");
        console.log("Creating subscription record from checkout session (metadata available here)");
        
        const insertData = {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string, // Get from checkout session
          plan: "premium",
          status: "active", // Assume active since payment completed
          ifc_user_id: session.metadata?.ifc_user_id,
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
          cancel_at: null,
        };
        
        console.log("📝 About to insert premium subscription from checkout:", JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabaseAdmin
          .from("subscriptions")
          .insert(insertData);

        if (error) {
          console.error("❌ FAILED to insert premium subscription from checkout:");
          console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
          console.log("✅ SUCCESS! Premium subscription inserted from checkout:");
          console.log("Inserted data:", JSON.stringify(data, null, 2));
        }
      }
      break;

    // Subscription Created
    case "customer.subscription.created":
      const subCreated = event.data.object as Stripe.Subscription;
      
      console.log("🔍 SUBSCRIPTION CREATED - DEBUG INFO:");
      console.log("  - Subscription ID:", subCreated.id);
      console.log("  - Customer ID:", subCreated.customer);
      console.log("  - Metadata:", JSON.stringify(subCreated.metadata, null, 2));
      console.log("  - ifc_user_id value:", subCreated.metadata?.ifc_user_id);
      console.log("  - typeof ifc_user_id:", typeof subCreated.metadata?.ifc_user_id);

      // Check if user already has a subscription
      if (!subCreated.metadata?.ifc_user_id || subCreated.metadata.ifc_user_id === 'undefined') {
        console.error("❌ CRITICAL: Invalid or missing ifc_user_id in subscription metadata!");
        console.log("🔄 Attempting to get metadata from recent checkout session...");
        // We'll need to look up the checkout session or handle this differently
        break;
      }

      // Check if user already has a subscription
      const { data: existingSubs, error } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("ifc_user_id", subCreated.metadata?.ifc_user_id)
        .eq("status", "active");

      if (error) {
        console.error("Failed to check for existing subscription:", error);
        break;
      }

      if (existingSubs.length > 0) {
        // Cancel the new duplicate subscription
        try {
          await stripe.subscriptions.cancel(subCreated.id);
          console.log(`Cancelled duplicate subscription: ${subCreated.id}`);
        } catch (err) {
          console.error("Failed to cancel duplicate subscription:", err);
        }
      } else {
        // Insert the new subscription into database
        console.log("🔄 Inserting new premium subscription into database");
        
        const subscriptionItem = subCreated.items.data[0];
        const currentPeriodEnd = subscriptionItem?.current_period_end ?? 0;
        
        const insertData = {
          stripe_customer_id: subCreated.customer as string,
          stripe_subscription_id: subCreated.id,
          plan: "premium",
          status: subCreated.status,
          ifc_user_id: subCreated.metadata?.ifc_user_id,
          current_period_end: new Date(currentPeriodEnd * 1000),
          cancel_at: null,
        };
        
        console.log("📝 About to insert premium subscription:", JSON.stringify(insertData, null, 2));
        
        const { data, error } = await supabaseAdmin
          .from("subscriptions")
          .insert(insertData);

        if (error) {
          console.error("❌ FAILED to insert premium subscription:");
          console.error("Error details:", JSON.stringify(error, null, 2));
        } else {
          console.log("✅ SUCCESS! Premium subscription inserted:");
          console.log("Inserted data:", JSON.stringify(data, null, 2));
        }
      }

      break;

    // Subscription Updated
    case "customer.subscription.updated":
      const subUpdated = event.data.object as Stripe.Subscription;
      
      console.log("🔄 SUBSCRIPTION UPDATED:");
      console.log("  - Subscription ID:", subUpdated.id);
      console.log("  - Status:", subUpdated.status);
      console.log("  - Current period end:", subUpdated.items.data[0].current_period_end);

      const subscriptionItem = subUpdated.items.data[0] as Stripe.SubscriptionItem;
      const currentPeriodEnd = subscriptionItem?.current_period_end ?? 0;
      
      console.log("  - Calculated period end:", currentPeriodEnd);
      console.log("  - As date:", new Date(currentPeriodEnd * 1000));

      // Extract cancel_at if user cancels subscription
      const cancelAt = subUpdated.cancel_at
        ? new Date(subUpdated.cancel_at * 1000)
        : null;

      const { data: updatedSubscriptionData, error: updatedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: subUpdated.status,
            current_period_end: new Date(currentPeriodEnd * 1000),
            cancel_at: cancelAt,
          })
          .eq("stripe_subscription_id", subUpdated.id);

      if (updatedSubscriptionError) {
        console.error("Error updating subscription:", updatedSubscriptionError);
      } else {
        console.log("Subscription updated:", updatedSubscriptionData);
      }
      break;

    // Subscription Deleted
    case "customer.subscription.deleted":
      const subDeleted = event.data.object as Stripe.Subscription;
      // console.log('Subscription deleted:', subDeleted);

      const { data: deletedSubscriptionData, error: deletedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "inactive" })
          .eq("stripe_subscription_id", subDeleted.id);

      if (deletedSubscriptionError) {
        console.error("Error deleting subscription:", deletedSubscriptionError);
      } else {
        console.log("Subscription deleted:", deletedSubscriptionData);
      }

      break;

    // Invoice Paid
    case "invoice.paid":
      const invoicePaid = event.data.object as Stripe.Invoice;
      // console.log('Invoice paid:', invoicePaid);
      break;

    // Invoice Payment Failed
    case "invoice.payment_failed":
      const invoiceFailed = event.data.object as Stripe.Invoice;

      if (
        !invoiceFailed.lines.data.length ||
        !invoiceFailed.lines.data[0].subscription
      ) {
        console.warn(
          "Invoice does not contain valid subscription info:",
          invoiceFailed.id
        );
        break;
      }

      const invoiceSubscriptionItem = invoiceFailed.lines.data[0]
        .subscription as string;

      // console.log('Invoice failed:', invoiceFailed);

      const { data: failedSubscriptionData, error: failedSubscriptionError } =
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", invoiceSubscriptionItem);

      if (failedSubscriptionError) {
        console.error(
          "Error updating failed subscription:",
          failedSubscriptionError
        );
      } else {
        console.log(
          "Marked subscription as past_due:",
          invoiceSubscriptionItem
        );
      }
      break;

    // Payment Intent Succeeded
    case "payment_intent.succeeded":
      const intentSucceeded = event.data.object as Stripe.PaymentIntent;
      // console.log('Payment succeeded:', intentSucceeded);
      break;

    // Payment Intent Failed
    case "payment_intent.payment_failed":
      const intentFailed = event.data.object as Stripe.PaymentIntent;
      // console.log('Payment failed:', intentFailed);
      break;

    default:
      console.warn(`Unhandled event type: ${event.type}`);
  }

  // Randomly trigger cleanup (1% chance per webhook call)
  if (Math.random() < 0.01) {
    console.log("🎲 Randomly triggering subscription cleanup...");
    setTimeout(async () => {
      try {
        console.log("🧹 Starting automated cleanup...");
        
        // Delete inactive subscriptions older than 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data, error } = await supabaseAdmin
          .from("subscriptions")
          .delete()
          .eq("status", "inactive")
          .lt("created_at", thirtyDaysAgo.toISOString());
        
        if (error) {
          console.error("Automated cleanup failed:", error);
        } else {
          console.log(`Cleanup complete: Removed old inactive subscriptions`);
        }
        
      } catch (cleanupError) {
        console.error("Automated cleanup error:", cleanupError);
      }
    }, 5000); // Wait 5 seconds after webhook completes
  }

  return new NextResponse("Event received", { status: 200 });
}
