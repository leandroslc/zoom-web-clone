/// <reference path="../lib/socket.io/socket.io.min.js" />

class SocketBuilder {
  /**
   * @param {Object} o
   * @param {string} o.socketUrl
   */
  constructor({ socketUrl }) {
    this.socketUrl = socketUrl;

    this.onUserConnected = () => {};
    this.onUserDisconnected = () => {};
    this.onChatMessageReceived = () => {};
  }

  /**
   * @param {(userId: string) => void} fn
   */
  setOnUserConnected(fn) {
    this.onUserConnected = fn;

    return this;
  }

  /**
   * @param {(userId: string) => void} fn
   */
  setOnUserDisconnected(fn) {
    this.onUserDisconnected = fn;

    return this;
  }

  /**
   * @param {(message: string, userId: string) => void} fn
   */
  setOnChatMessageReceived(fn) {
    this.onChatMessageReceived = fn;

    return this;
  }

  build() {
    const socket = io.connect(this.socketUrl, {
      withCredentials: false,
    });

    socket.on('user-connected', this.onUserConnected);
    socket.on('user-disconnected', this.onUserDisconnected);
    socket.on('chat-message-received', this.onChatMessageReceived);

    return socket;
  }
}
