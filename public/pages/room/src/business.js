/// <reference path="media.js" />
/// <reference path="view.js" />
/// <reference path="socket-builder.js" />
/// <reference path="peer-builder.js" />

/**
 * @typedef {Object} BusinessDependencies
 * @property {string} room
 * @property {Media} media
 * @property {View} view
 * @property {SocketBuilder} socketBuilder
 * @property {PeerBuilder} peerBuilder
 */

class Business {
  /**
   * @param {BusinessDependencies} o
   */
  constructor({
    room,
    media,
    view,
    socketBuilder,
    peerBuilder,
  }) {
    this.room = room;
    this.media = media;
    this.view = view;
    this.socketBuilder = socketBuilder;
    this.peerBuilder = peerBuilder;

    this.currentStream = {};
    this.currentPeer = {};
    this.socket = {};

    this.peers = new Map();
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

    this.socket = this.socketBuilder
      .setOnUserConnected(this.onUserConnected())
      .setOnUserDisconnected(this.onUserDisconnected())
      .build();

    this.currentPeer = await this.peerBuilder
      .setOnError(this.onPeerError())
      .setOnConnectionOpened(this.onPeerConnectionOpened())
      .setOnCallReceived(this.onPeerCallReceived())
      .setOnPeerStreamReceived(this.onPeerStreamReceived())
      .build();

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

      this.currentPeer.call(userId, this.currentStream);
    };
  }

  onUserDisconnected = function() {
    return userId => {
      console.log('User disconnected', userId);
    };
  }

  onPeerError = function () {
    return error => {
      console.error('Peer error', error);
    };
  }

  onPeerConnectionOpened = function () {
    return peer => {
      const id = peer.id;

      console.log('Peer', peer);

      this.socket.emit('join-room', this.room, id);
    };
  }

  onPeerCallReceived = function () {
    return call => {
      console.log('Call received', call);

      call.answer(this.currentStream);
    };
  }

  onPeerStreamReceived = function () {
    return (call, stream) => {
      const callerId = call.peer;

      this.addVideoSream(callerId, stream);

      this.peers.set(callerId, { call });

      this.view.setParticipants(this.peers.size);
    };
  }
}
