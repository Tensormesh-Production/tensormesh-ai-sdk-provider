import { RuntimeSummary } from "../../components/runtime-summary";
import { ToolsPageClient } from "../../components/tools-page-client";
import { getIntegrationSummary } from "../../lib/tensormesh";

export default function ToolsPage() {
  const summary = getIntegrationSummary();

  return (
    <main className="stack">
      <section className="panel">
        <h1>Tool Calling</h1>
        <p className="subtle">
          This page uses a server-side weather tool. On the current validated
          deployment, Devstral is the intended baseline model for this route.
        </p>
        <RuntimeSummary
          mode={summary.mode}
          baseURL={summary.baseURL}
          model={summary.toolModel}
          userIdPresent={summary.userIdPresent}
        />
      </section>

      <ToolsPageClient />
    </main>
  );
}
