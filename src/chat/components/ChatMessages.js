import React, { useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import { Image } from "../Image";
import { deleteChatMessage, editChatMessage } from "../../util/ApiUtil";
import { Button, Input, Modal } from "antd";
import FileLink from "./FileLink";

const isImage = (url) => {
  return url.match(/\.(jpeg|jpg|gif|png|webp|bmp|svg)$/i);
};

const ChatMessages = ({ messages, currentUser, setMessages }) => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editMessageContent, setEditMessageContent] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null); // Track the active message for showing actions

  const handleDeleteMessage = (messageId) => {
    deleteChatMessage(messageId)
      .then(() => {
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.content.filter(
            (msg) => msg.id !== messageId
          );
          return { ...prevMessages, content: updatedMessages };
        });
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
      });
  };

  const handleEditMessage = (messageId, content) => {
    setEditingMessageId(messageId);
    setEditMessageContent(content);
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = () => {
    editChatMessage(editingMessageId, editMessageContent)
      .then((updatedMessage) => {
        setMessages((prevMessages) => {
          const updatedMessages = prevMessages.content.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          );
          return { ...prevMessages, content: updatedMessages };
        });
        setIsEditModalVisible(false);
        setEditingMessageId(null);
        setEditMessageContent("");
      })
      .catch((error) => {
        console.error("Error editing message:", error);
      });
  };

  return (
    <>
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
              onContextMenu={(e) => {
                e.preventDefault();
                setActiveMessageId(
                  activeMessageId === msg.id ? null : msg.id // Toggle visibility on right-click
                );
              }}
            >
              {msg.fileUrl && (
                isImage(msg.fileUrl) ? (
                  <Image file={msg.fileUrl} />
                ) : (
                  <FileLink file={msg.fileUrl} />
                )
              )}
              <p>{msg.content}</p>
              {msg.sender?.id === currentUser.id && activeMessageId === msg.id && (
                <div className="message-actions">
                  <Button
                    type="link"
                    onClick={() => handleEditMessage(msg.id, msg.content)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="link"
                    danger
                    onClick={() => handleDeleteMessage(msg.id)}
                  >
                    Delete
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </ScrollToBottom>

      <Modal
        title="Edit Message"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
      >
        <Input.TextArea
          value={editMessageContent}
          onChange={(e) => setEditMessageContent(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
};

export default ChatMessages;