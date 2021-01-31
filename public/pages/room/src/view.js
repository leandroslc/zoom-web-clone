const HomePageURL = '/pages/home';

class View {
  constructor() {
    this.recordingButtonElement = document.getElementById('record');
    this.leaveButtonElement = document.getElementById('leave');
    this.muteOrUnmuteButtonElement = document.getElementById('muteOrUnmute');
    this.playOrStopVideoButtonElement = document.getElementById('playOrStop');
    this.chatButtonElement = document.getElementById('chat');
    this.chatContainerElement = document.getElementById('chat_container');
    this.chatFormElement = document.getElementById('chat_form');
    this.chatInputElement = document.getElementById('chat_input');
    this.chatMessagesElement = document.getElementById('chat_messages');

    this.recordingEnabled = false;
    this.muteEnabled = false;
    this.videoEnabled = true;
    this.chatEnabled = true;
  }

  /**
   * @param {Object} o
   * @param {boolean} o.muted
   * @param {string} o.src
   * @param {MediaProvider} o.srcObject
   */
  createVideoElement({ muted = true, src, srcObject }) {
    const video = document.createElement('video');
    video.muted = muted;
    video.src = src;
    video.srcObject = srcObject;

    if (src) {
      video.controls = true;
      video.loop = true;
      video.addEventListener('canplaythrough', video.play());
    }

    if (srcObject) {
      video.addEventListener('loadedmetadata', () => video.play());
    }

    return video;
  }

  /**
   * @param {Object} o
   * @param {string} o.userId
   * @param {MediaProvider} o.stream
   * @param {string} o.url
   * @param {boolean} o.isCurrentUserId
   * @param {boolean} o.isRecording
   */
  renderVideo({
    userId,
    stream = null,
    url = null,
    isCurrentUserId = false,
    isRecording = false,
  }) {
    const video = this.createVideoElement({
      src: url,
      srcObject: stream,
      muted: isCurrentUserId,
    });

    this.appendToHTMLTree({
      userId,
      videoElement: video,
      isCurrentUserId,
      isRecording,
    });
  }

  /**
   * @param {Object} o
   * @param {string} o.userId
   * @param {HTMLVideoElement} o.videoElement
   * @param {boolean} o.isCurrentUserId
   * @param {boolean} o.isRecording
   */
  appendToHTMLTree({
    userId,
    videoElement,
    isCurrentUserId,
    isRecording,
  }) {
    const wrapperElement = document.createElement('div');
    wrapperElement.id = userId;
    wrapperElement.classList.add('wrapper');
    wrapperElement.append(videoElement);

    const userIdElement = document.createElement('div');
    userIdElement.innerHTML = isCurrentUserId ? '' : userId;
    wrapperElement.append(userIdElement);

    const videoGridElement = document.getElementById('video-grid');
    videoGridElement.append(wrapperElement);

    if (isRecording) {
      wrapperElement.classList.add('rec');
      userIdElement.innerHTML = '<span class="rec">rec</span> ' + userIdElement.innerHTML;
    }
  }

  /**
   * @param {number} count
   */
  setParticipants(count) {
    const participantsElement = document.getElementById('participants');
    const currentUser = 1;

    participantsElement.innerHTML = count + currentUser;
  }

  /**
   * @param {string} id
   */
  removeVideoElement(id) {
    const videoElement = document.getElementById(id);

    videoElement.remove();
  }

  /**
   * @param {Object} o
   * @param {string} o.message
   * @param {string} o.userId
   * @param {boolean} o.isCurrentUserId
   */
  addChatMessage({
    message,
    userId,
    isCurrentUserId = false,
  }) {
    const messageElement = document.createElement('li');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<h1>${isCurrentUserId ? 'You' : userId}</h1><span>${message}</span>`;

    if (isCurrentUserId) {
      messageElement.classList.add('from-current-user');
    }

    this.chatMessagesElement.appendChild(messageElement);
    this.chatMessagesElement.parentElement.scrollTo(
      0, this.chatMessagesElement.parentElement.scrollHeight);
  }

  /**
   * @param {(isEnabled: boolean) => void} command
   */
  configureRecordButton(command) {
    this._toogleRecordingButton(this.recordingEnabled);

    this.recordingButtonElement.addEventListener('click', () => {
      this.recordingEnabled = !this.recordingEnabled;

      command(this.recordingEnabled);

      this._toogleRecordingButton(this.recordingEnabled);
    });
  }

  /**
   * @param {() => Promise<void>} command
   */
  configureLeaveButton(command) {
    this.leaveButtonElement.addEventListener('click', async () => {
      await command();

      window.location = HomePageURL;
    });
  }

  /**
   * @param {(isMuted: boolean) => void} command
   */
  configureMuteOrUnmuteButton(command) {
    this._toggleMuteOrUnmuteButton(this.muteEnabled);

    this.muteOrUnmuteButtonElement.addEventListener('click', () => {
      this.muteEnabled = !this.muteEnabled;

      command(this.muteEnabled);

      this._toggleMuteOrUnmuteButton(this.muteEnabled);
    });
  }

  /**
   * @param {(isVideoEnabled: boolean) => void} command
   */
  configurePlayOrStopVideoButton(command) {
    this._togglePlayOrStopVideoButton(this.videoEnabled);

    this.playOrStopVideoButtonElement.addEventListener('click', () => {
      this.videoEnabled = !this.videoEnabled;

      command(this.videoEnabled);

      this._togglePlayOrStopVideoButton(this.videoEnabled);
    });
  }

  /**
   * @param {(message: string) => void} command
   */
  configureChatForm(command) {
    this.chatFormElement.addEventListener('submit', (event) => {
      event.preventDefault();

      const normalizedMessage = this.chatInputElement.value
        ? this.chatInputElement.value
            .trim()
            .replace('<', '&lt;')
            .replace('>', '&gt;')
        : '';

      this.chatInputElement.value = '';

      command(normalizedMessage);
    });
  }

  configureChatButton() {
    this._toggleChatButton(this.chatEnabled);

    this.chatButtonElement.addEventListener('click', () => {
      this.chatEnabled = !this.chatEnabled;

      this.chatContainerElement.style.display = this.chatEnabled ? '' : 'none';

      this._toggleChatButton(this.chatEnabled);
    });
  }

  /**
   * @param {boolean} isRecordingEnabled
   */
  _toogleRecordingButton(isRecordingEnabled) {
    const stopInfo = this.recordingButtonElement.querySelector('.stop');
    const startInfo = this.recordingButtonElement.querySelector('.start');

    stopInfo.style.display = isRecordingEnabled ? '' : 'none';
    startInfo.style.display = isRecordingEnabled ? 'none' : '';
  }

  /**
   * @param {boolean} isMuted
   */
  _toggleMuteOrUnmuteButton(isMuted) {
    const muteInfo = this.muteOrUnmuteButtonElement.querySelector('.mute');
    const unmuteInfo = this.muteOrUnmuteButtonElement.querySelector('.unmute');

    muteInfo.style.display = isMuted ? 'none' : '';
    unmuteInfo.style.display = isMuted ? '' : 'none';
  }

  /**
   * @param {boolean} isVideoEnabled
   */
  _togglePlayOrStopVideoButton(isVideoEnabled) {
    const stopInfo = this.playOrStopVideoButtonElement.querySelector('.stop');
    const playInfo = this.playOrStopVideoButtonElement.querySelector('.play');

    stopInfo.style.display = isVideoEnabled ? 'none' : '';
    playInfo.style.display = isVideoEnabled ? '' : 'none';
  }

  /**
   * @param {boolean} isChatEnabled
   */
  _toggleChatButton(isChatEnabled) {
    const openInfo = this.chatButtonElement.querySelector('.open');
    const closedInfo = this.chatButtonElement.querySelector('.closed');

    openInfo.style.display = isChatEnabled ? 'none' : '';
    closedInfo.style.display = isChatEnabled ? '' : 'none';
  }
}
