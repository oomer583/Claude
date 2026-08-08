import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
      <p className="text-muted-foreground text-sm">Legal</p>
      <h1 className="mt-1 font-semibold text-3xl tracking-tight">Terms</h1>
      <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
        <section>
          <h2 className="font-medium text-base text-foreground">Service use</h2>
          <p className="mt-2">
            Use the service only for lawful purposes and do not attempt to
            bypass access controls, quotas, security boundaries, or isolated
            execution limits.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">
            Generated output
          </h2>
          <p className="mt-2">
            AI-generated text, code, files, research, and other output can be
            incomplete or incorrect. Users remain responsible for reviewing
            output before relying on it or sharing it externally.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">
            Connected services
          </h2>
          <p className="mt-2">
            Features that use model providers, workspace services, connectors,
            or external tools are also subject to the rules and availability of
            those services.
          </p>
        </section>
        <section>
          <h2 className="font-medium text-base text-foreground">
            Plans and limits
          </h2>
          <p className="mt-2">
            Product plans can enforce server-side usage limits. A payment
            provider is not currently connected, so paid billing terms must be
            added before accepting public payments.
          </p>
        </section>
      </div>
      <div className="mt-10 flex gap-4 text-sm">
        <Link className="underline underline-offset-4" href="/privacy">
          Privacy
        </Link>
        <Link className="underline underline-offset-4" href="/settings">
          Settings
        </Link>
      </div>
    </main>
  );
}
