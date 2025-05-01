import React from "react";
import { Button } from "antd";

const ChatInput = ({ text, setText, sendMessage, handleFileChange }) => {
  return (
    <div className="message-input">
      <div className="wrap">
        <input
          name="user_input"
          size="large"
          placeholder="Write your message..."
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyPress={(event) => {
            if (event.key === "Enter") {
              sendMessage(text);
            }
          }}
        />
        <input
          type="file"
          onChange={handleFileChange}
          style={{ marginLeft: "10px" }}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <i className="fa fa-paperclip" aria-hidden="true"></i>
        </label>
        <Button
          icon={<i className="fa fa-paper-plane" aria-hidden="true"></i>}
          onClick={() => sendMessage(text)}
        />
      </div>
    </div>
  );
};

export default ChatInput;