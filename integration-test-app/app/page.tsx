import { RuntimeSummary } from "../components/runtime-summary";
import { getIntegrationSummary } from "../lib/tensormesh";

export default function HomePage() {
  const summary = getIntegrationSummary();

  return (
    <main className="stack">
      <section className="hero">
        <h1>Tensormesh AI SDK Starter</h1>
        <p className="subtle">
          A compact Next.js starter for building chat, structured output, and
          tool-calling workflows on Tensormesh with the Vercel AI SDK.
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
          <h2>Chat</h2>
          <p>
            Stream model responses through a Next.js App Router API route.
          </p>
          <a href="/chat">Open chat</a>
        </article>
        <article className="feature-card">
          <h2>Structured Output</h2>
          <p>
            Generate typed objects from a shared Zod schema.
          </p>
          <a href="/object">Open structured output</a>
        </article>
        <article className="feature-card">
          <h2>Tool Calling</h2>
          <p>
            Run a server-side tool loop with a simple weather tool.
          </p>
          <a href="/tools">Open tool calling</a>
        </article>
      </section>
    </main>
  );
}
