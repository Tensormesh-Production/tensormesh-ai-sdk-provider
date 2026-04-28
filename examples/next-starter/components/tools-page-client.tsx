"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UseChatToolsMessage } from "../app/api/tools/route";
import { ChatInput } from "./chat-input";

export function ToolsPageClient() {
  const { messages, sendMessage, status, stop, error } = useChat<UseChatToolsMessage>({
    transport: new DefaultChatTransport({ api: "/api/tools" }),
  });

  return (
    <section className="panel messages">
      <div className="panel-toolbar">
        <span className="status-badge">{status}</span>
      </div>

      {messages.length === 0 ? (
        <div className="empty-state">
          Ask about the weather in a city to confirm the tool route works.
        </div>
      ) : null}

      {messages.map((message) => (
        <article key={message.id} className="message">
          <div className="message-role">{message.role}</div>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <div key={index} className="message-body">
                    {part.text}
                  </div>
                );

              case "step-start":
                return <hr key={index} />;

              case "tool-weather":
                switch (part.state) {
                  case "input-available":
                    return (
                      <div key={index} className="tool-box">
                        Looking up weather for {part.input.city}...
                      </div>
                    );
                  case "output-available":
                    return (
                      <div key={index} className="tool-box">
                        {part.output.city}: {part.output.condition},{" "}
                        {part.output.temperatureC}
                        °C
                      </div>
                    );
                  case "output-error":
                    return (
                      <div key={index} className="tool-box">
                        {part.errorText}
                      </div>
                    );
                  default:
                    return null;
                }

              default:
                return null;
            }
          })}
        </article>
      ))}

      {error ? (
        <div className="alert">
          <div className="message-role">error</div>
          <div className="message-body">{error.message}</div>
        </div>
      ) : null}

      <ChatInput
        status={status}
        onSubmit={(text) => sendMessage({ text })}
        stop={stop}
      />
    </section>
  );
}
