import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
      <p className="text-muted-foreground text-sm">Legal</p>
      <h1 className="mt-1 font-semibold text-3xl tracking-tight">Privacy</h1>
      <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="font-medium text-base text-foreground">Data we store</h2>
          <p className="mt-2">
            The service stores account information and product data needed to
            provide persistent chats, projects, documents, preferences, plan
            entitlements, and related workspace features.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">AI processing</h2>
          <p className="mt-2">
            Requests may be processed by configured model and workspace
            services. Server-side credentials are not exposed to the browser.
            Incognito chats are designed to avoid product chat persistence and
            persistent memory/project context.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">Your controls</h2>
          <p className="mt-2">
            Signed-in users can export their product data and request permanent
            account deletion from Settings. Account deletion also revokes the
            linked workspace service credential before local account data is
            removed.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">Operations</h2>
          <p className="mt-2">
            Operational logs, backups, and infrastructure may have separate
            retention windows required for security and reliability. Production
            deployment policy should define those windows before public launch.
          </p>
        </section>
      </div>
      <div className="mt-10 flex gap-4 text-sm">
        <Link className="underline underline-offset-4" href="/terms">
          Terms
        </Link>
        <Link className="underline underline-offset-4" href="/settings">
          Settings
        </Link>
      </div>
    </main>
  );
}
