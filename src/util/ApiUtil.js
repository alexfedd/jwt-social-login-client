const ROOT_URL = "http://78.24.223.206:8082";

const request = async (options) => {
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

  return fetch(options.url, options)
    .then((response) => {
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        return response.text().then((text) => {
          console.error("Server error:", text);
          return Promise.reject(text);
        });
      }

      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .catch((error) => {
      console.error("Request failed:", error);
      return Promise.reject(error);
    });
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
    body: JSON.stringify(chatInfo),
  });
}

export function createGroupChat(chatInfo) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: ROOT_URL + "/api/chat-rooms/group",
    method: "POST",
    body: JSON.stringify(chatInfo),
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

export async function findChatMessages(chatRoomId) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }
  try {
    const numberOfMessages = (
      await request({
        url: ROOT_URL + `/api/chat-messages/${chatRoomId}`,
        method: "GET",
      })
    )?.totalElements;
    if (numberOfMessages === 0) {
      return { content: [] };
    }
    const response = await request({
      url:
        ROOT_URL +
        `/api/chat-messages/${chatRoomId}?sort=timestamp,asc&size=${numberOfMessages}`,
      method: "GET",
    });
    return response;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return { content: [] }; // Return an empty array in case of error
  }
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

export function getFile(fileName) {
  return request({
    url: ROOT_URL + "/api/files/" + fileName,
  })
    .then((response) => response)
    .catch((error) => {
      console.error("Error fetching file:", error);
      return {url: ''}; // Return null or handle the error as needed
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
export async function uploadFile2(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://78.24.223.206:8082/api/files/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // Добавляем токен в заголовки
      },
      body: formData, // Передаем FormData в body
    });

    if (!response.ok) {
      throw new Error(`Error uploading file: ${response.statusText}`);
    }

    const fileUrl = await response.text(); // Получаем URL загруженного файла
    return fileUrl;
  } catch (error) {
    console.error("Ошибка загрузки файла:", error.message);
    return null;
  }
}

export function deleteChatMessage(chatMessageId) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: `${ROOT_URL}/api/chat-messages/${chatMessageId}`,
    method: "DELETE",
  });
}

export function editChatMessage(chatMessageId, newContent) {
  if (!localStorage.getItem("accessToken")) {
    return Promise.reject("No access token set.");
  }

  return request({
    url: `${ROOT_URL}/api/chat-messages/${chatMessageId}`,
    method: "PUT",
    body: JSON.stringify({ content: newContent }),
  });
}
