import React from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { Image } from "../Image";

const ChatMessages = ({ messages, currentUser }) => {
  return (
    <ScrollToBottom className="messages">
      <ul>
        {messages.content?.map((msg, key) => (
          <li
            key={key}
            className={
              msg.sender?.id === currentUser.id ||
              msg.sender === currentUser.username
                ? "sent"
                : "replies"
            }
          >
            {msg.fileUrl && <Image file={msg.fileUrl} />}
            <p>{msg.content}</p>
          </li>
        ))}
      </ul>
    </ScrollToBottom>
  );
};

export default ChatMessages;