import React from "react";

const TermsOfUsePage = () => {
  return (
    <main className="w-full min-h-screen flex justify-center">
      <div className="w-full max-w-[1000px] p-4 dark:text-light text-gray flex flex-col gap-4 py-12">
        <header>
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
            Terms Of Use
          </h1>
          <p className="text-sm text-gray-400">Last updated: 08/10/2025</p>
        </header>

        <p className="tracking-tight text-lg font-medium">
          Welcome to IFlytics (“we,” “our,” “us”). These Terms of Service
          (“Terms”) govern your access to and use of IFlytics, including any
          related websites, services, and applications (collectively, the
          “Service”). By using the Service, you agree to these Terms. If you do
          not agree, do not use IFlytics.
        </p>

        <hr className="my-4 dark:bg-light bg-gray" />

        <section className="flex flex-col gap-8">
          {/* Eligibility */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              1. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use IFlytics. If you are
              under the age of majority in your jurisdiction, you must have
              permission from a parent or legal guardian.
            </p>
          </div>

          {/* Accounts */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">2. Accounts</h2>

            <ul className="list-disc list-inside">
              <li>
                You are responsible for maintaining the confidentiality of your
                account and password.
              </li>
              <li>
                You agree to provide accurate and complete information when
                creating an account.
              </li>
              <li>
                You are responsible for all activity that occurs under your
                account.
              </li>
            </ul>
          </div>

          {/* Subscriptions & Payments */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              3. Subscriptions & Payments
            </h2>

            <ul className="list-disc list-inside">
              <li>
                IFlytics offers free and paid subscription plans, including
                lifetime access options.
              </li>
              <li>
                Payments are processed securely by <b>Stripe</b>. We do not
                store your full payment details.
              </li>
              <li>
                Your Use of Stripe is subject to Stripe's{" "}
                <a
                  href="https://stripe.com/legal/ssa"
                  target="_blank"
                  className="text-blue-500"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="https://stripe.com/privacy"
                  target="_blank"
                  className="text-blue-500"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                Subscriptions renew automatically unless canceled before the
                renewal date.
              </li>
              <li>
                Lifetime access is a one-time purchase that grants continued
                access to paid features for the life of the Service, subject to
                these Terms.
              </li>
              <li>Refunds are issued only where required by law</li>
            </ul>
          </div>

        {/* Acceptable Use */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              4. Acceptable Use
            </h2>

            <p>You agree not to:</p>
            <ul className="list-disc list-inside">
              <li>
                Use the Service for unlawful, harmful, or abusive purposes.
              </li>
              <li>
                Attempt to disrupt, overload, or interfere with our servers or
                networks.
              </li>
              <li>
                Misuse data obtained from the Infinite Flight API, including
                storing flight data beyond the API’s terms.
              </li>
              <li>
                Use the Service in a way that could damage, disable, or impair
                it.
              </li>
            </ul>
          </div>
          
          {/* Data and Privacy */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              5. Data and Privacy
            </h2>

            <p>Your privacy is important to us. Please refer to our <a href="/legal/privacy" className="text-blue-500">Privacy Policy</a> for details on how we collect, use, and protect your information.</p>
          </div>

          { /* Intellectual Property */}
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              6. Intellectual Property
            </h2>

            <ul className="list-disc list-inside">
              <li>
              All IFlytics branding, design, and original content are our property.
              </li>
              <li>Infinite Flight and its related trademarks are owned by Infinite Flight LLC. We are not affiliated with or endorsed by Infinite Flight.</li>
            </ul>
          </div>

          {/* Service Availability and Changes */}  
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              7. Service Availability and Changes
            </h2>

            <p>We may update, modify, or discontinue any part of the Service at any time without notice. We do not guarantee uninterrupted or error-free operation.</p>
          </div>
          
          { /* Disclaimer of Warranties */ }
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              8. Disclaimer of Warranties
            </h2>

            <p>The Service is provided “as is” and “as available.” We disclaim all warranties, express or implied, to the fullest extent permitted by law</p>
          </div>

          { /* Limitation of Liability */ }
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              9. Limitation of Liability
            </h2>

            <p>To the fullest extent permitted by law, we are not liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.  </p>
          </div>

          { /* Governing Law */ }
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              10. Governing Law
            </h2>

            <p>These Terms are governed by the laws of the State of New Jersey, United States, without regard to conflict of law principles.</p>
          </div>

          { /* Changes to Terms */ }
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              11. Changes to these Terms
            </h2>
            
            <p>We may revise these Terms from time to time. If we make material changes, we will provide notice (such as via Discord or posting on our website). Continued use of the Service after changes take effect constitutes acceptance of the new Terms.</p>
          </div>

          { /* Contact Us */ }
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              12. Contact Us
            </h2>

            <p>For any questions about these Terms, please contact us via our official Discord server: <a href="https://discord.gg/ZswK5eRm" className="text-blue-500 font-medium">IFlytics Official Discord</a></p>
          </div>
          
        </section>
      </div>
    </main>
  );
};

export default TermsOfUsePage;
