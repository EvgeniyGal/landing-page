import type { Metadata } from "next";
import type { ReactNode } from "react";
import { LAZYEYE_GYM, onDeviceDataRows } from "@/app/data/lazyeye-gym-privacy";
import { getSiteUrl } from "@/lib/seo";

const path = "/lazyeye-gym/privacy";
const title = `Privacy Policy for ${LAZYEYE_GYM.appName}`;
const description = `Privacy Policy for ${LAZYEYE_GYM.appName} (${LAZYEYE_GYM.packageName}). Explains on-device storage, Google Play Billing, permissions, and contact details.`;

export const metadata: Metadata = {
  title: { absolute: `${title} | ${LAZYEYE_GYM.developerName}` },
  description,
  robots: { index: true, follow: true },
  alternates: {
    canonical: new URL(path, getSiteUrl()).toString(),
  },
  openGraph: {
    title,
    description,
    url: new URL(path, getSiteUrl()).toString(),
    type: "website",
    siteName: LAZYEYE_GYM.developerName,
  },
};

function Section({
  id,
  title: sectionTitle,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <h2 className="font-display text-xl font-semibold tracking-[-0.02em] md:text-2xl">{sectionTitle}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--muted)] md:text-base">{children}</div>
    </section>
  );
}

export default function LazyEyeGymPrivacyPage() {
  const { appName, packageName, developerName, contactEmail, websiteUrl, lastUpdated } = LAZYEYE_GYM;

  return (
    <main className="min-h-dvh bg-background px-4 py-12 md:px-6 md:py-16">
      <article className="mx-auto w-full max-w-3xl">
        <header className="border-b border-[var(--hairline)] pb-8">
          <p className="label-mono text-[var(--muted)]">{appName}</p>
          <h1 className="font-display mt-3 text-3xl font-semibold tracking-[-0.02em] md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-[var(--muted)]">Last updated: {lastUpdated}</p>
          <dl className="mt-6 space-y-2 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            <div>
              <dt className="inline font-medium text-foreground">Developer / Publisher: </dt>
              <dd className="inline">
                {developerName} (&ldquo;I&rdquo;, &ldquo;me&rdquo;, &ldquo;the developer&rdquo;)
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">App: </dt>
              <dd className="inline">
                {appName} (Android package <code className="font-mono text-[0.9em]">{packageName}</code>)
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Contact: </dt>
              <dd className="inline">
                <a className="underline underline-offset-2 hover:text-foreground" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>
              </dd>
            </div>
            <div>
              <dt className="inline font-medium text-foreground">Website: </dt>
              <dd className="inline">
                <a
                  className="underline underline-offset-2 hover:text-foreground"
                  href={websiteUrl}
                  rel="noopener noreferrer"
                >
                  {websiteUrl}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm leading-relaxed text-[var(--muted)] md:text-base">
            This Privacy Policy explains how {appName} (&ldquo;the App&rdquo;) handles information. By using the App,
            you agree to this policy.
          </p>
        </header>

        <div className="mt-10 space-y-10">
          <Section id="summary" title="1. Summary">
            <p>{appName} is a free, ad-free dichoptic training app.</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Training settings and play history are stored on your device.</li>
              <li>I do not operate an account system for the App.</li>
              <li>I do not sell your personal data.</li>
              <li>
                Optional tips are processed by Google Play Billing, not by a custom payment server of mine.
              </li>
            </ul>
          </Section>

          <Section id="who" title="2. Who this policy applies to">
            <p>
              This policy applies to users of the {appName} mobile application distributed via Google Play (and any
              other store where I publish the same App).
            </p>
          </Section>

          <Section id="on-device" title="3. Information the App stores on your device">
            <p>The App stores data locally on your device, for example:</p>
            <div className="overflow-x-auto border border-[var(--hairline)]">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead className="bg-[var(--surface-low)]">
                  <tr>
                    <th className="border-b border-[var(--hairline)] px-3 py-2 font-medium text-foreground">Type</th>
                    <th className="border-b border-[var(--hairline)] px-3 py-2 font-medium text-foreground">
                      Examples
                    </th>
                    <th className="border-b border-[var(--hairline)] px-3 py-2 font-medium text-foreground">
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {onDeviceDataRows.map((row) => (
                    <tr key={row.type}>
                      <td className="border-b border-[var(--hairline)] px-3 py-3 align-top font-medium text-foreground">
                        {row.type}
                      </td>
                      <td className="border-b border-[var(--hairline)] px-3 py-3 align-top">{row.examples}</td>
                      <td className="border-b border-[var(--hairline)] px-3 py-3 align-top">{row.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              This information stays on your device unless you back up, sync, or transfer the device through your own
              OS/cloud tools (see section 5).
            </p>
            <p>
              <strong className="font-medium text-foreground">Display name:</strong> If you set a name in the App, it is
              stored only locally for greeting/UI. It is not used to create an online profile with me.
            </p>
          </Section>

          <Section id="servers" title="4. Information I collect on my own servers">
            <p>
              I do not run a {appName} backend that collects your training data, preferences, or display name for my own
              analytics or marketing databases.
            </p>
            <p>I do not intentionally collect:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Name, email, or phone for an App account (there is no App login)</li>
              <li>Precise location for App features</li>
              <li>Contacts, photos, or files for App features</li>
              <li>Advertising IDs for ads (the App has no ads)</li>
            </ul>
          </Section>

          <Section id="third-parties" title="5. Third parties and device / platform services">
            <p>
              Depending on how you install and use the App, the following parties may process data under their privacy
              policies:
            </p>
            <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground md:text-lg">
              Google Play / Google LLC
            </h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                App download, updates, crash/ANR and other Play Console diagnostics that Google may provide to
                developers
              </li>
              <li>Optional in-app tips (consumable purchases such as support tips) via Google Play Billing</li>
              <li>License/purchase verification related to those purchases</li>
            </ul>
            <p>
              I receive purchase-related information that Google makes available to developers (for example that a tip
              product was purchased), not your full payment card details. Payment data is handled by Google.
            </p>
            <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground md:text-lg">
              Device operating system (Google Android / device manufacturer)
            </h3>
            <ul className="list-disc space-y-2 pl-5">
              <li>Local storage, backups, notifications permission, and similar system features</li>
            </ul>
            <h3 className="font-display text-base font-semibold tracking-[-0.02em] text-foreground md:text-lg">
              Optional local notifications
            </h3>
            <p>
              If you enable reminders, the App schedules local notifications on your device. Reminder content is
              generated on-device; I do not send you push messages from my own notification server.
            </p>
            <p>Links:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <a
                  className="underline underline-offset-2 hover:text-foreground"
                  href={LAZYEYE_GYM.googlePrivacyUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Google Privacy Policy
                </a>
              </li>
              <li>
                <a
                  className="underline underline-offset-2 hover:text-foreground"
                  href={LAZYEYE_GYM.googlePlayTermsUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Google Play Terms
                </a>
              </li>
            </ul>
          </Section>

          <Section id="permissions" title="6. Permissions">
            <p>
              The App may request permissions needed for its features (for example notifications for reminders, and
              audio-related permissions used by the App&apos;s sound features). Permissions are used only to provide
              those features. You can revoke permissions in system settings; some features may then stop working.
            </p>
          </Section>

          <Section id="children" title="7. Children&apos;s privacy">
            <p>
              The App is a general-audience training tool. It is not directed at children under 13 (or the equivalent
              minimum age in your country). I do not knowingly collect personal information from children through a
              developer-operated backend. If you believe a child has provided personal information to me directly (e.g.
              by email), contact me and I will delete it from my inbox/records where applicable.
            </p>
          </Section>

          <Section id="medical" title="8. Health / medical disclaimer (not a data practice, but important)">
            <p>
              {appName} is a casual training tool, not a certified medical device. It does not provide diagnosis or
              treatment. Consult a qualified eye-care professional for medical advice. The App does not transmit clinical
              health records to my servers.
            </p>
          </Section>

          <Section id="sharing" title="9. Data sharing and selling">
            <ul className="list-disc space-y-2 pl-5">
              <li>I do not sell your personal information.</li>
              <li>I do not share on-device App data with advertisers.</li>
              <li>
                Sharing occurs only as described above (mainly Google as the store and billing provider) or if required
                by law.
              </li>
            </ul>
          </Section>

          <Section id="retention" title="10. Data retention and deletion">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="font-medium text-foreground">On-device data:</strong> Remains until you clear App
                storage, uninstall the App, or otherwise delete it via your device. Uninstalling typically removes local
                App data (subject to your device&apos;s backup behaviour).
              </li>
              <li>
                <strong className="font-medium text-foreground">Emails you send me:</strong> I keep them only as long as
                needed to respond and for ordinary business records.
              </li>
              <li>
                <strong className="font-medium text-foreground">Purchase records:</strong> Retained by Google according
                to Google&apos;s policies; I may retain limited purchase/support records Google provides.
              </li>
            </ul>
          </Section>

          <Section id="security" title="11. Security">
            <p>
              I design the App so sensitive training preferences and history stay on your device. No method of electronic
              storage is 100% secure. Protect your device with a lock screen and keep your system updated.
            </p>
          </Section>

          <Section id="international" title="12. International users">
            <p>
              I may be located in a different country than you. Platform providers (such as Google) may process data in
              various countries. By using the App through Google Play, you also use Google&apos;s services under their
              terms and privacy policy.
            </p>
          </Section>

          <Section id="rights" title="13. Your choices and rights">
            <p>
              Depending on your region (e.g. GDPR/UK GDPR, CCPA/CPRA, and similar laws), you may have rights to access,
              correct, delete, or restrict certain personal data, or to object to certain processing.
            </p>
            <p>Because most App data is only on your device, the practical way to delete it is:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Clear {appName} storage in Android settings, or</li>
              <li>Uninstall the App</li>
            </ul>
            <p>
              For requests about information you sent me by email, or purchase-related questions, contact{" "}
              <a className="underline underline-offset-2 hover:text-foreground" href={`mailto:${contactEmail}`}>
                {contactEmail}
              </a>
              . I will respond within a reasonable time. For Google account / Play purchase data, you may also need to
              use Google&apos;s tools and support.
            </p>
          </Section>

          <Section id="changes" title="14. Changes to this policy">
            <p>
              I may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date will change.
              Continued use of the App after changes means you accept the updated policy. Material changes may also be
              noted on the App&apos;s store listing or website when appropriate.
            </p>
          </Section>

          <Section id="contact" title="15. Contact">
            <p>Questions about this Privacy Policy or {appName} privacy practices:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Email:{" "}
                <a className="underline underline-offset-2 hover:text-foreground" href={`mailto:${contactEmail}`}>
                  {contactEmail}
                </a>
              </li>
              <li>
                Web:{" "}
                <a
                  className="underline underline-offset-2 hover:text-foreground"
                  href={websiteUrl}
                  rel="noopener noreferrer"
                >
                  {websiteUrl}
                </a>
              </li>
            </ul>
          </Section>
        </div>
      </article>
    </main>
  );
}
