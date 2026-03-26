const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  // 1. Handle CORS Preflight (The browser's "handshake")
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // 2. Extract Data
    const { amount, currency, bookingId, role } = await req.json();

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const credentials = btoa(`${keyId}:${keySecret}`);

    // 3. Call Razorpay API
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount * 100, // Razorpay expects paise
        currency: currency || "INR",
        receipt: `booking_${bookingId}_${role}`,
        notes: { bookingId, role }
      })
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.error?.description || "Razorpay order failed");
    }

    // 4. Return Success with CORS headers
    return new Response(JSON.stringify({ order }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    // 5. Return Error with CORS headers
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400 // Better to use 400 for logic errors
    });
  }
});