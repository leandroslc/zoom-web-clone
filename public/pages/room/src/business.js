/// <reference path="media.js" />
/// <reference path="dowloader.js" />
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
   * @type {Map<string, Object>}
   */
  peers;

  /**
   * @type {Map<string, Recorder>}
   */
  userRecordings;

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
    this.userRecordings = new Map();

    this.recordingEnabled = false;
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
    this.view.configureRecordButton(this.onRecordToggle.bind(this));
    this.view.configureLeaveButton(this.onRoomLeave.bind(this));

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
      .setOnCallError(this.onPeerCallError())
      .setOnCallClose(this.onPeerCallClose())
      .build();

    this.addVideoSream(this.currentPeer.id);
  }

  /**
   * @param {string} userId
   * @param {MediaProvider} stream
   */
  addVideoSream(userId, stream = this.currentStream) {
    const recorder = new Recorder(userId, stream);

    this.userRecordings.set(recorder.id, recorder);

    if (this.recordingEnabled) {
      recorder.startRecording();
    }

    this.view.renderVideo({
      userId,
      stream,
      isCurrentUserId: false,
    });
  }

  onUserConnected() {
    return userId => {
      console.log('User connected', userId);

      this.currentPeer.call(userId, this.currentStream);
    };
  }

  onUserDisconnected() {
    return userId => {
      console.log('User disconnected', userId);

      if (this.peers.has(userId)) {
        this.peers.get(userId).call.close();
        this.peers.delete(userId);
      }

      this.view.setParticipants(this.peers.size);
      this.view.removeVideoElement(userId);
      this.stopAllRecordings(userId);
    };
  }

  onPeerError() {
    return error => {
      console.error('Peer error', error);
    };
  }

  onPeerConnectionOpened() {
    return peer => {
      const id = peer.id;

      console.log('Peer', peer);

      this.socket.emit('join-room', this.room, id);
    };
  }

  onPeerCallReceived() {
    return call => {
      console.log('Call received', call);

      call.answer(this.currentStream);
    };
  }

  onPeerStreamReceived() {
    return (call, stream) => {
      const callerId = call.peer;

      this.addVideoSream(callerId, stream);

      this.peers.set(callerId, { call });

      this.view.setParticipants(this.peers.size);
    };
  }

  onPeerCallError() {
    return (call, error) => {
      console.error('Call error', error);

      this.view.removeVideoElement(call.peer);
    };
  }

  onPeerCallClose() {
    return (call) => {
      console.log('Call closed', call.peer);
    };
  }

  /**
   * @param {boolean} isRecordingEnabled
   */
  onRecordToggle(isRecordingEnabled) {
    this.recordingEnabled = isRecordingEnabled;

    console.log('Recording', isRecordingEnabled ? 'enabled' : 'disabled');

    for (const [id, recorder] of this.userRecordings) {
      if (this.recordingEnabled) {
        recorder.startRecording();
      } else {
        this.stopAllRecordings(id);
      }
    }
  }

  async onRoomLeave() {
    const downloader = new Downloader();

    this.userRecordings.forEach((recorder) => {
      recorder
        .getFilesForDownload()
        .forEach(({ filename, blob }) => {
          downloader.addFile({
            blob,
            filename,
            directory: recorder.id,
          });
        });
    });

    await downloader.download();
  }

  /**
   * @param {string} userOrRecordingId
   */
  stopAllRecordings(userOrRecordingId) {
    for (const [id, recorder] of this.userRecordings) {
      const isCurrentUser = id.includes(userOrRecordingId);

      if (!isCurrentUser) {
        continue;
      }

      if (!recorder.recordingActive) {
        continue;
      }

      recorder.stopRecording()
        .then(() => this.playRecordings(id));
    }
  }

  /**
   * @param {string} recordingId
   */
  playRecordings(recordingId) {
    const userRecording = this.userRecordings.get(recordingId);
    const videoURLs = userRecording.getAllVideoURLs();

    videoURLs.forEach(url => {
      this.view.renderVideo({
        url,
        userId: recordingId,
      });
    });
  }
}
