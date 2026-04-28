import { ObjectPageClient } from "../../components/object-page-client";
import { RuntimeSummary } from "../../components/runtime-summary";
import { getExampleSummary } from "../../lib/tensormesh";

export default function ObjectPage() {
  const summary = getExampleSummary();

  return (
    <main className="stack">
      <section className="panel">
        <h1>Structured Output</h1>
        <p className="subtle">
          Generate a typed product idea from a shared schema.
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
