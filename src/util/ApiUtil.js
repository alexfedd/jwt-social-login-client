const ROOT_URL = "http://78.24.223.206:8082";

const request = (options) => {
  const headers = new Headers();

  if (options.setContentType !== false) {
    headers.append("Content-Type", "application/json");
  }

  if (localStorage.getItem("accessToken")) {
    headers.append(
      "Authorization",
      "Bearer " + localStorage.getItem("accessToken")
    );
  }

  const defaults = { headers: headers };
  options = Object.assign({}, defaults, options);

  return fetch(options.url, options).then((response) => {
    console.log(response);
    return response?.json().then((json) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    }).catch((error) => {
      console.error("Error parsing JSON response:", error);
    })
  }
  );
};

export function login(loginRequest) {
  return request({
    url: ROOT_URL + "/auth/sign-in",
    method: "POST",
    body: JSON.stringify(loginRequest),
  });
}

export function signup(signupRequest) {
  return request({
    url: ROOT_URL + "/auth/sign-up",
    method: "POST",
    body: JSON.stringify(signupRequest),
  });
}

export function getCurrentUser() {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/auth/who-am-i",
    method: "POST",
  });
}

export function createPrivateChat(chatInfo) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/api/chat-rooms/private",
    method: "POST",
    body: JSON.stringify(chatInfo)
  });
}

export function createGroupChat(chatInfo) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/api/chat-rooms/group",
    method: "POST",
    body: JSON.stringify(chatInfo)
  });
}

export function getUsers() {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/api/users",
    method: "GET",
  });
}

export function getUserChats() {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/api/chat-rooms/my",
    method: "GET",
  });
}

export function findChatMessages(chatRoomId) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + `/api/chat-messages/${chatRoomId}?sort=timestamp,asc`,
    method: "GET",
  });
}

export function findChatMessage(id) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/messages/" + id,
    method: "GET",
  });
}

export function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request({
    method: "POST",
    url: ROOT_URL + "/api/files/upload",
    setContentType: false,
    body: formData,
  });
}

export function getFile(fileName) {

  return request({
    url: ROOT_URL + "/api/files/" + fileName,
  });
}
