import { RuntimeSummary } from "../../components/runtime-summary";
import { ToolsPageClient } from "../../components/tools-page-client";
import { getExampleSummary } from "../../lib/tensormesh";

export default function ToolsPage() {
  const summary = getExampleSummary();

  return (
    <main className="stack">
      <section className="panel">
        <h1>Tool Calling</h1>
        <p className="subtle">
          Ask for weather and let the model call the server-side tool.
        </p>
        <RuntimeSummary
          mode={summary.mode}
          baseURL={summary.baseURL}
          model={summary.toolModel}
          userIdPresent={summary.userIdPresent}
        />
      </section>

      <ToolsPageClient defaultModelId={summary.defaults.tool} />
    </main>
  );
}
