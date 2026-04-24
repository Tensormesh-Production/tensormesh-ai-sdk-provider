import { RuntimeSummary } from "../components/runtime-summary";
import { getIntegrationSummary } from "../lib/tensormesh";

export default function HomePage() {
  const summary = getIntegrationSummary();

  return (
    <main className="stack">
      <section className="hero">
        <h1>Tensormesh AI SDK Integration App</h1>
        <p className="subtle">
          This app is the integration-test companion for{" "}
          <code>@tensormesh/ai-sdk-provider</code>. It mirrors the AI SDK
          reference app shape: streaming chat, structured output, and tool
          calling through Next.js App Router routes.
        </p>
        <RuntimeSummary
          mode={summary.mode}
          baseURL={summary.baseURL}
          model={summary.chatModel}
          userIdPresent={summary.userIdPresent}
        />
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <h2>Streaming Chat</h2>
          <p>
            Uses <code>useChat</code> on the client and <code>streamText()</code>{" "}
            on the server.
          </p>
          <a href="/chat">Open chat</a>
        </article>
        <article className="feature-card">
          <h2>Structured Output</h2>
          <p>
            Uses <code>experimental_useObject</code> with{" "}
            <code>Output.object(...)</code>.
          </p>
          <a href="/object">Open structured output</a>
        </article>
        <article className="feature-card">
          <h2>Tool Calling</h2>
          <p>
            Uses <code>useChat</code> with a server-side weather tool and
            multi-step generation.
          </p>
          <a href="/tools">Open tool calling</a>
        </article>
      </section>
    </main>
  );
}
