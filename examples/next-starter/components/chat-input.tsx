"use client";

import { useState } from "react";

type ChatInputProps = {
  status: string;
  onSubmit: (text: string) => void;
  stop?: () => void;
  disabled?: boolean;
};

export function ChatInput({ status, onSubmit, stop, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const inputDisabled = disabled || status !== "ready";

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
        disabled={inputDisabled}
      />
      <button className="button" type="submit" disabled={inputDisabled}>
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
