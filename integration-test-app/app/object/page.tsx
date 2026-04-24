import { ObjectPageClient } from "../../components/object-page-client";
import { RuntimeSummary } from "../../components/runtime-summary";
import { getIntegrationSummary } from "../../lib/tensormesh";

export default function ObjectPage() {
  const summary = getIntegrationSummary();

  return (
    <main className="stack">
      <section className="panel">
        <h1>Structured Output</h1>
        <p className="subtle">
          This page exercises <code>Output.object(...)</code> through a real
          Next.js route.
        </p>
        <RuntimeSummary
          mode={summary.mode}
          baseURL={summary.baseURL}
          model={summary.structuredModel}
          userIdPresent={summary.userIdPresent}
        />
      </section>

      <ObjectPageClient />
    </main>
  );
}
