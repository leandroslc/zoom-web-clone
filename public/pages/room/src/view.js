const HomePageURL = '/pages/home';

class View {
  constructor() {
    this.recordingButtonElement = document.getElementById('record');
    this.leaveButtonElement = document.getElementById('leave');
    this.muteOrUnmuteButtonElement = document.getElementById('muteOrUnmute');
    this.recordingEnabled = false;
    this.muteEnabled = false;
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
   * @param {(isEnabled: boolean) => void} command
   */
  configureRecordButton(command) {
    this.recordingButtonElement.addEventListener('click', () => {
      this.recordingEnabled = !this.recordingEnabled;

      command(this.recordingEnabled);

      this._toogleRecordingButtonColor(this.recordingEnabled);
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
   * @param {boolean} isRecordingEnabled
   */
  _toogleRecordingButtonColor(isRecordingEnabled) {
    this.recordingButtonElement.style.color = isRecordingEnabled ? 'red' : '';
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
}
