import React from 'react'

const PrivacyPolicyPage = () => {
    return (
        <main className="w-full min-h-screen flex justify-center">
          <div className="w-full max-w-[1000px] p-4 dark:text-light text-gray flex flex-col gap-4 py-12">
            <header>
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-400">Last updated: 08/10/2025</p>
            </header>
    
            <p className="tracking-tight text-lg font-medium">
            This Privacy Policy explains how IFlytics (“we,” “our,” “us”) collects, uses, and protects your information when you use our website and services (“Service”).
            </p>
    
            <hr className="my-4 dark:bg-light bg-gray" />
    
            <section className="flex flex-col gap-8">
              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  1. Information We Collect
                </h2>

                <p>When you create an account, we collect the following information:</p>
                <ul className="list-disc list-inside">
                  <li>
                  Email address
                  </li>
                  <li>
                  Password (securely stored by Supabase; we do not store your plain-text password)
                  </li>
                  <li>
                  Infinite Flight user information (such as your Infinite Flight user ID and public profile data)
                  </li>
                  <li>
                  Payment details (processed by Stripe; we do not store full payment information)
                  </li>
                </ul>
              </div>
    
              {/* How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">2. How We Use Your Information
                </h2>
    
                <p>We use your information to:</p>
                <ul className="list-disc list-inside">
                  <li>
                  Create and manage your account
                  </li>
                  <li>
                  Process your subscriptions and payments
                  </li>
                  <li>
                  Provide and improve our services
                  </li>
                  <li>
                  Display your Infinite Flight statistics and history
                  </li>
                  <li>
                  Communicate with you about your account and updates to the Serv
                  </li>
                </ul>
              </div>
    
              {/* Data Storage and Security */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  3. Data Storage and Security
                </h2>
    
                <ul className="list-disc list-inside">
                  <li>
                  Your account data is stored securely by <b>Supabase</b>, our authentication and database provider.
                  </li>
                  <li>
                  Supabase encrypts passwords and uses industry-standard security measures.
                  </li>
                  <li>
                  Payments are handled by <b>Stripe</b>, which securely processes your payment details.
                  </li>
                  <li>We do not share or sell your personal data to third parties.</li>
                </ul>
              </div>
    
            {/* Third-Party Services */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  4. Third-Party Services
                </h2>
    
                <p>We use the following third-party services:</p>
                <ul className="list-disc list-inside">
                  <li>
                  Supabase (authentication and database) — subject to the Supabase <a href="https://supabase.com/privacy" className="text-blue-500">Privacy Policy</a>.
                  </li>
                  <li>
                  Infinite Flight API (flight data) — subject to the Infinite Flight <a href="https://infiniteflight.com/legal/terms" className="text-blue-500">Terms of Service</a>.
                  </li>
                  <li>
                  Stripe (payment processing) — subject to the Stripe <a href="https://stripe.com/legal/ssa" className="text-blue-500">Privacy Policy</a>.
                  </li>
                </ul>
              </div>
              
              {/* Data and Retention */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  5. Data and Retention
                </h2>
    
                <p>We retain your account data for as long as your account is active. You may request deletion at any time by contacting us.</p>
              </div>
    
              { /* Your Rights */}
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  6. Your Rights
                </h2>
    
                <p>You have the right to:</p>
                <ul className="list-disc list-inside">
                  <li>
                  Request a copy of your personal data
                  </li>
                  <li>Update your account information</li>
                  <li>Request deletion of your account</li>
                </ul>
              </div>
    
              {/* Changes to This Policy */}  
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  7. Changes to This Policy
                </h2>
    
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>
              </div>
              
              { /* Contact Us */ }
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">
                  8. Contact Us
                </h2>
    
                <p>For any questions about this Privacy Policy, please contact us via our official Discord server: <a href="https://discord.gg/ZswK5eRm" className="text-blue-500 font-medium">IFlytics Official Discord</a></p>
              </div>
    
            </section>
          </div>
        </main>
      );
}

export default PrivacyPolicyPage