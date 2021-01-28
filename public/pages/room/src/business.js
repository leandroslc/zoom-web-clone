/// <reference path="media.js" />
/// <reference path="view.js" />
/// <reference path="socket-builder.js" />

/**
 * @typedef {Object} BusinessDependencies
 * @property {string} room
 * @property {Media} media
 * @property {View} view
 * @property {SocketBuilder} socketBuilder
 */

class Business {
  /**
   * @param {BusinessDependencies} o
   */
  constructor({ room, media, view, socketBuilder }) {
    this.room = room;
    this.media = media;
    this.view = view;
    this.socketBuilder = socketBuilder;

    this.socket = socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.socket.emit('join-room', this.room, 'test001');

    this.currentStream = {};
  }

  /**
   * @param {BusinessDependencies} dependencies
   */
  static async create(dependencies) {
    const business = new Business(dependencies);

    await business._initialize();

    return business;
  }

  async _initialize() {
    this.currentStream = await this.media.getCamera();
    this.addVideoSream('test01');
  }

  /**
   * @param {string} userId
   * @param {MediaProvider} stream
   */
  addVideoSream(userId, stream = this.currentStream) {
    this.view.renderVideo({
      userId,
      stream,
      isCurrentUserId: false,
    });
  }

  onUserConnected = function() {
    return userId => {
      console.log('User connected', userId);
    }
  }

  onUserDisconnected = function() {
    return userId => {
      console.log('User disconnected', userId);
    }
  }
}
