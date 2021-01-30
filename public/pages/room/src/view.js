class View {
  constructor() {
    this.recordingButtonElement = document.getElementById('record');
    this.recordingEnabled = false;
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
   * @param {boolean} o.muted
   */
  renderVideo({
    userId,
    stream = null,
    url = null,
    isCurrentUserId = false,
    muted = true,
  }) {
    const video = this.createVideoElement({
      src: url,
      srcObject: stream,
      muted,
    });

    this.appendToHTMLTree({
      userId,
      videoElement: video,
      isCurrentUserId,
    });
  }

  /**
   * @param {Object} o
   * @param {string} o.userId
   * @param {HTMLVideoElement} o.videoElement
   * @param {boolean} o.isCurrentUserId
   */
  appendToHTMLTree({
    userId,
    videoElement,
    isCurrentUserId,
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
    this.recordingButtonElement.addEventListener('click', this._onRecordClick(command));
  }

  /**
   * @param {(isEnabled: boolean) => void} command
   */
  _onRecordClick(command) {
    return () => {
      this.recordingEnabled = !this.recordingEnabled;

      command(this.recordingEnabled);

      this._toogleRecordingButtonColor(this.recordingEnabled);
    };
  }

  /**
   * @param {boolean} isRecordingEnabled
   */
  _toogleRecordingButtonColor(isRecordingEnabled) {
    this.recordingButtonElement.style.color = isRecordingEnabled ? 'red' : 'white';
  }
}
