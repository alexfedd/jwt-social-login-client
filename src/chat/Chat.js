import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, message, Modal } from "antd";
import {
  getUsers,
  findChatMessages,
  getUserChats,
  createPrivateChat,
  createGroupChat,
} from "../util/ApiUtil";
import { useRecoilValue } from "recoil";
import { loggedInUser } from "../atom/globalState";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css";
import defaultAvatar from "./../assets/user.png";

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
  useEffect(() => {
    if (localStorage.getItem("accessToken") === null) {
      props.history.push("/login");
    }
    connect();
    loadContacts();
  }, []);

  useEffect(() => {
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
  const connect = () => {
    const Stomp = require("stompjs");
    var SockJS = require("sockjs-client");
    SockJS = new SockJS("http://78.24.223.206:8082/ws");
    stompClient = Stomp.over(SockJS);
    stompClient.connect(
      { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      async function (frame) {
        console.log("Connected to WebSocket");

        // Подписываемся на уведомления для текущего пользователя
        stompClient.subscribe(
          `/user/${currentUser.username}/queue/notifications`,
          onMessageReceived
        );
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
    const notification = JSON.parse(msg.body);
    // const active = JSON.parse(sessionStorage.getItem("recoil-persist"))
    //   .chatActiveContact;
    console.log(notification);
    // if (active.id === notification.senderId) {
    //   findChatMessage(notification.id).then((message) => {
    //     const newMessages = JSON.parse(sessionStorage.getItem("recoil-persist"))
    //       .chatMessages;
    //     newMessages.push(message);
    //     setMessages(newMessages);
    //   });
    // } else {
    //   message.info("Received a new message from " + notification.senderName);
    // }
    loadContacts();
  };
  const onActiveChatChange = (chat) => {
    if (currentChatSubscription) {
      currentChatSubscription.unsubscribe();
    }
    setActiveChat(chat);
  };
  const sendMessage = (msg) => {
    if (msg.trim() !== "") {
      const message = {
        chatId: activeChat.id,
        content: msg,
        sender: currentUser.username,
      };
      stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(message));
      message.sender = currentUser;
      const newMessages = [...messages.content];
      newMessages.push(message);
      setMessages({ ...messages, content: newMessages });
    }
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

  const handleProfileNavigation = () => {
    props.history.push("/");
  };

  const onAddChatClick = () => {
    getUsers().then((users) => {
      setAllUsers(users);
      setSelectedUserIds([]); // reset any prior
      setChatName("");
      setIsModalVisible(true);
    });
  };

  // 2) handle checkbox selections
  const onUserSelect = (checkedValues) => {
    setSelectedUserIds(checkedValues);
  };

  // 3) create chat depending on count
  const onCreateChat = () => {
    if (selectedUserIds.length === 0) {
      message.warning("Select at least one user");
      return;
    }

    let chatNameToUse = chatName.trim();

    if (selectedUserIds.length === 1) {
      // Use the selected user's name as the chat name for private chats
      const selectedUser = allUsers.find(user => user.id === selectedUserIds[0]);
      chatNameToUse = selectedUser ? selectedUser.username : chatNameToUse;
    } else if (chatNameToUse === "") {
      message.warning("Please enter a chat name");
      return;
    }

    const promise =
      selectedUserIds.length === 1
        ? createPrivateChat({ name: chatNameToUse, user_id: selectedUserIds[0] })
        : createGroupChat({ name: chatNameToUse, member_ids: selectedUserIds });

    promise
      .then(() => {
        message.success("Chat created");
        setIsModalVisible(false);
        loadContacts(); // refresh the sidebar
      })
      .catch((err) => {
        console.error(err);
        message.error("Could not create chat");
      });
  };

  return (
    <div id="frame">
      <div id="sidepanel">
        <div id="profile">
          <div className="wrap">
            <img
              id="profile-img"
              src={defaultAvatar}
              className="online"
              alt=""
            />
            <p>{currentUser.username}</p>
            <div id="status-options">
              <ul>
                <li id="status-online" className="active">
                  <span className="status-circle"></span> <p>Online</p>
                </li>
                <li id="status-away">
                  <span className="status-circle"></span> <p>Away</p>
                </li>
                <li id="status-busy">
                  <span className="status-circle"></span> <p>Busy</p>
                </li>
                <li id="status-offline">
                  <span className="status-circle"></span> <p>Offline</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div id="search" />
        <div id="contacts">
          <ul>
            {chats.map((chat, key) => (
              <li
                onClick={() => onActiveChatChange(chat)}
                key={key}
                className={
                  activeChat && chat.id === activeChat.id
                    ? "contact active"
                    : "contact"
                }
              >
                <div className="wrap">
                  <span className="contact-status online"></span>
                  <img id={chat.id} src={defaultAvatar} alt="" />
                  <div className="meta">
                    <p className="name">{chat.name}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div id="bottom-bar">
          <button onClick={handleProfileNavigation} id="addcontact">
            <i className="fa fa-user fa-fw" aria-hidden="true"></i>{" "}
            <span>Profile</span>
          </button>
          <button onClick={onAddChatClick} id="settings">
            <i className="fa fa-cog fa-fw" aria-hidden="true"></i>{" "}
            <span>Add chat</span>
          </button>
        </div>
      </div>
      <div className="content">
        <div className="contact-profile">
          <img src={activeChat && defaultAvatar} alt="" />
          <p>{activeChat && activeChat.name}</p>
        </div>
        <ScrollToBottom className="messages">
          <ul>
            {messages.content?.map((msg, key) => (
              <li
                key={key}
                className={
                  msg.sender?.id !== currentUser.id ? "replies" : "sent"
                }
              >
                <p>{msg.content}</p>
                {console.log(msg)}
              </li>
            ))}
          </ul>
        </ScrollToBottom>
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
                  setText("");
                }
              }}
            />

            <Button
              icon={<i className="fa fa-paper-plane" aria-hidden="true"></i>}
              onClick={() => {
                sendMessage(text);
                setText("");
              }}
            />
          </div>
        </div>
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
          onChange={onUserSelect}
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
