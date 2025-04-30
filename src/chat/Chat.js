import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, message, Modal } from "antd";
import { getUsers, findChatMessages, getUserChats, createPrivateChat, createGroupChat, uploadFile } from "../util/ApiUtil";
import { useRecoilValue } from "recoil";
import { loggedInUser } from "../atom/globalState";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css";
import defaultAvatar from "./../assets/user.png";
import ChatSidebar from "./components/ChatSidebar";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";

var stompClient = null;
const Chat = (props) => {
  const currentUser = useRecoilValue(loggedInUser);
  const [text, setText] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(undefined);
  const [currentChatSubscription, setCurrentChatSubscription] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [chatName, setChatName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken") === null) {
      props.history.push("/login");
    }
    connect();
    loadContacts();
  }, []);

  useEffect(() => {
    setMessages({});
    if (activeChat === undefined) return;
    findChatMessages(activeChat.id).then((msgs) => {
      return setMessages(msgs);
    });
    if (stompClient.connected) {
      const chatSubscription = stompClient.subscribe(
        `/topic/chat/${activeChat.id}`,
        onMessageReceived
      );
      setCurrentChatSubscription(chatSubscription);
    }
    loadContacts();
  }, [activeChat]);
  useEffect(() => {
    if (isConnected) {
      const chatSubscription = stompClient.subscribe(
        `/topic/chat/${activeChat.id}`,
        onMessageReceived
      );
      setCurrentChatSubscription(chatSubscription);
    }
  }, [isConnected]);
  const onActiveChatChange = (chat) => {
    if (chat.id === activeChat.id) return;
    if (currentChatSubscription) {
      currentChatSubscription.unsubscribe();
    }
    setActiveChat(chat);
  };
  const connect = () => {
    const Stomp = require("stompjs");
    var SockJS = require("sockjs-client");
    SockJS = new SockJS("http://78.24.223.206:8082/ws");
    stompClient = Stomp.over(SockJS);
    stompClient.connect(
      { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      async function (frame) {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      }
    );
    stompClient.onerror = function (error) {
      console.log("WebSocket Error:", error);
    };
    stompClient.debug = function (str) {
      console.log(str);
    };
    stompClient.onclose = function () {
      console.log("Connection closed");
    };
  };

  const onMessageReceived = (msg) => {
    const message = JSON.parse(msg.body);
    if (!message || (!message.content && !message.fileUrl)) {
      console.warn("Received an empty or invalid message:", message);
      return;
    }

    setMessages((prevMessages) => {
      const newMessages = [...(prevMessages.content || [])];
      newMessages.push({ sender: message.sender, content: message.content, fileUrl: message.fileUrl });
      return { ...prevMessages, content: newMessages };
    });
  };

  const sendMessage = async (msg) => {
    if (msg.trim() === "" && !file) {
      message.warning("Cannot send an empty message");
      return;
    }

    let fileUrl = null;

    if (file) {
      try {
        const response = await uploadFile(file);
        fileUrl = response;
      } catch (error) {
        console.error("Error uploading file:", error);
        message.error("Failed to upload file");
        return;
      }
    }

    const messageData = {
      chatId: activeChat.id,
      content: msg,
      sender: currentUser.username,
      ...(fileUrl && { fileUrl }),
    };

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(messageData));
    setText("");
    setFile(null);
  };

  const loadContacts = () => {
    const promise = getUserChats();

    promise.then((promises) =>
      Promise.all(promises).then((chats) => {
        setChats(chats);
        if (activeChat === undefined && chats.length > 0) {
          setActiveChat(chats[0]);
        }
      })
    );
  };

  const onAddChatClick = () => {
    getUsers().then((users) => {
      setAllUsers(users);
      setSelectedUserIds([]);
      setChatName("");
      setIsModalVisible(true);
    });
  };

  const onCreateChat = () => {
    if (selectedUserIds.length === 0) {
      message.warning("Select at least one user");
      return;
    }

    let chatNameToUse = chatName.trim();

    if (selectedUserIds.length === 1) {
      const selectedUser = allUsers.find(
        (user) => user.id === selectedUserIds[0]
      );
      chatNameToUse = selectedUser ? selectedUser.username : chatNameToUse;
    } else if (chatNameToUse === "") {
      message.warning("Please enter a chat name");
      return;
    }

    const promise =
      selectedUserIds.length === 1
        ? createPrivateChat({
            name: chatNameToUse,
            user_id: selectedUserIds[0],
          })
        : createGroupChat({ name: chatNameToUse, member_ids: selectedUserIds });

    promise
      .then(() => {
        message.success("Chat created");
        setIsModalVisible(false);
        loadContacts();
      })
      .catch((err) => {
        console.error(err);
        message.error("Could not create chat");
      });
  };

  return (
    <div id="frame">
      <ChatSidebar
        chats={chats}
        activeChat={activeChat}
        setActiveChat={onActiveChatChange}
        onAddChatClick={onAddChatClick}
        history={props.history}
      />
      <div className="content">
        <div className="contact-profile">
          <img src={activeChat && defaultAvatar} alt="" />
          <p>{activeChat && activeChat.name}</p>
        </div>
        <ChatMessages messages={messages} currentUser={currentUser} />
        <ChatInput
          text={text}
          setText={setText}
          sendMessage={sendMessage}
          handleFileChange={(event) => {
            if (event.target.files.length > 0) {
              setFile(event.target.files[0]);
            }
          }}
        />
      </div>
      <Modal
        title="Select users to chat with"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={onCreateChat}
        okText="Create chat"
      >
        <Input
          placeholder="Enter chat name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Checkbox.Group
          style={{ width: "100%" }}
          value={selectedUserIds}
          onChange={(checkedValues) => setSelectedUserIds(checkedValues)}
        >
          {allUsers.map((u) => (
            <Checkbox
              key={u.id}
              value={u.id}
              style={{ display: "block", margin: "8px 0" }}
            >
              {u.username}
            </Checkbox>
          ))}
        </Checkbox.Group>
      </Modal>
    </div>
  );
};

export default Chat;
