import { ChatPageClient } from "../../components/chat-page-client";
import { RuntimeSummary } from "../../components/runtime-summary";
import { getExampleSummary } from "../../lib/tensormesh";

export default function ChatPage() {
  const summary = getExampleSummary();

  return (
    <main className="stack">
      <section className="panel">
        <h1>Streaming Chat</h1>
        <p className="subtle">
          Stream chat responses from the configured Tensormesh model.
        </p>
        <RuntimeSummary
          mode={summary.mode}
          baseURL={summary.baseURL}
          model={summary.chatModel}
          userIdPresent={summary.userIdPresent}
        />
      </section>

      <ChatPageClient defaultModelId={summary.defaults.chat} />
    </main>
  );
}
