"use client";

import { useState } from "react";

type ChatInputProps = {
  status: string;
  onSubmit: (text: string) => void;
  stop?: () => void;
};

export function ChatInput({ status, onSubmit, stop }: ChatInputProps) {
  const [text, setText] = useState("");

  return (
    <form
      className="chat-input-row"
      onSubmit={(event) => {
        event.preventDefault();

        if (text.trim() === "") {
          return;
        }

        onSubmit(text);
        setText("");
      }}
    >
      <input
        className="chat-input"
        placeholder="Say something..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={status !== "ready"}
      />
      <button className="button" type="submit" disabled={status !== "ready"}>
        Send
      </button>
      {stop && (status === "submitted" || status === "streaming") ? (
        <button className="button button-secondary" type="button" onClick={stop}>
          Stop
        </button>
      ) : null}
    </form>
  );
}
