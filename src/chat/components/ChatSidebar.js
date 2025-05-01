import React from "react";
import defaultAvatar from "../../assets/user.png";
import { useRecoilValue } from "recoil";
import { loggedInUser } from "../../atom/globalState";

const ChatSidebar = ({
  chats,
  setChats,
  activeChat,
  setActiveChat,
  onAddChatClick,
  history,
}) => {
  const currentUser = useRecoilValue(loggedInUser);

  const handleProfileNavigation = () => {
    history.push("/");
  };
  return (
    <div id="sidepanel">
      <div id="profile">
        <div className="wrap">
          <img id="profile-img" src={defaultAvatar} className="online" alt="" />
          <p>{currentUser.username}</p>
        </div>
      </div>
      <div id="contacts">
        <ul>
          {chats.map((chat, key) => (
            <li
              onClick={() => {
                setActiveChat(chat);
                if(!chat.hasNotification) return;
                chat.hasNotification = false;
                setChats((prevChats) =>
                  prevChats.map((c) => (c.id === chat.id ? chat : c))
                );
              }}
              key={key}
              className={
                activeChat && chat.id === activeChat.id
                  ? "contact active"
                  : "contact"
              }
            >
              <div className="wrap">
                <img id={chat.id} src={defaultAvatar} alt="" />
                <div className="meta">
                  <p className="name">{chat.name}</p>
                </div>
                {chat.hasNotification && (
                  <span style={{ backgroundColor: "red" }}></span>
                )}
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
  );
};

export default ChatSidebar;
