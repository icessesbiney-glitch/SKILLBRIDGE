import { supabase } from './supabaseClient';

interface CheckoutParams {
  courseId: string;
  price: number;
  title: string;
}

export async function triggerDodoCheckout({ courseId, price, title }: CheckoutParams) {
  try {
    // 1. Fetch the logged-in student's information securely
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in or create a SkillBridge account to enroll in this module.');
      window.location.href = '/auth';
      return;
    }

    // 2. Initialize the Dodo Checkout instance using your verified live public parameters
    // We bind the user's encrypted ID into the session metadata so our webhook logs credit them accurately
    const dodoPayload = {
      product_id: courseId, 
      total_amount: Math.round(price * 100), // Convert standard GHS currency into raw transaction components
      currency: 'GHS',
      metadata: {
        user_id: user.id,
        course_title: title
      },
      customer: {
        email: user.email
      },
      return_url: `${window.location.origin}/dashboard?checkout=success`
    };

    console.log('Initializing secure SkillBridge transaction context...', dodoPayload);
    
    // Redirect the browser window right into the secure checkout link terminal
    // Replace the URL parameter below with your live Dodo merchant frontend endpoint
    window.location.href = `https://dodopayments.com{courseId}&user_id=${user.id}`;

  } catch (err) {
    console.error('Dodo Payments execution terminal crash context:', err);
    alert('Failed to establish connection with the Dodo payment gateway. Please try again.');
  }
}
