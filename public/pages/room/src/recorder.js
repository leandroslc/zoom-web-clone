const CommonRecorderVideoTypes = {
  'video/webm': '.webm',
};

const CommonRecorderCodecs = [
  'codecs=vp9,opus',
  'codecs=vp8,opus',
  '',
];

const CommonMediaRecorderContentTypes = Object.entries(CommonRecorderVideoTypes)
  .map(([type, extension]) => CommonRecorderCodecs
    .map(codec => {
      return {
        type: `${type}${codec ? ';' + codec : ''}`,
        extension,
      };
    }))
  .reduce((accumulator, current) => accumulator.concat(current), []);

class Recorder {
  /**
   *
   * @param {string} userName
   * @param {MediaProvider} stream
   */
  constructor(userName, stream) {
    this.userName = userName;
    this.stream = stream;

    this.id = `${userName}-${Date.now()}`;
    this.supportedMediaRecorderType = this._getSupportedMediaRecorderType();

    this.mediaRecorder = {};
    this.recordedBlobs = [];
    this.completeRecordings = [];
    this.recordingActive = false;

    this.resolveOnClose = null;
  }

  _getSupportedMediaRecorderType() {
    const supportMediaRecorderType = CommonMediaRecorderContentTypes
      .find(({ type }) => MediaRecorder.isTypeSupported(type));

    if (!supportMediaRecorderType) {
      throw new Error(`None of the following codecs are supported: "${
        CommonMediaRecorderContentTypes.join(', ')
      }"`);
    }

    return supportMediaRecorderType;
  }

  _getMediaRecorderOptions() {
    return {
      mimeType: this.supportedMediaRecorderType.type,
    };
  }

  startRecording() {
    const options = this._getMediaRecorderOptions();

    // Stops if there is no video being streamed
    if (!this.stream.active) {
      return;
    }

    this.mediaRecorder = new MediaRecorder(this.stream, options);

    this.mediaRecorder.onstop = () => {
      console.log('Recorded', this.recordedBlobs);

      this.completeRecordings.push([...this.recordedBlobs]);
      this.recordedBlobs = [];

      if (this.resolveOnClose) {
        this.resolveOnClose();
        this.resolveOnClose = null;
      }
    };

    this.mediaRecorder.ondataavailable = (event) => {
      if (!event.data || !event.data.size) {
        return;
      }

      this.recordedBlobs.push(event.data);
    };

    this.mediaRecorder.start();
    this.recordingActive = true;

    console.log('Recorder started', this.mediaRecorder);
  }

  stopRecording() {
    if (!this.recordingActive) {
      return;
    }

    if (this.mediaRecorder.state === 'inactive') {
      return;
    }

    console.log('Recording stopped', this.userName);

    const promise = new Promise(resolve => this.resolveOnClose = resolve);

    this.mediaRecorder.stop();
    this.recordingActive = false;

    return promise;
  }

  getAllVideoURLs() {
    return this.completeRecordings.map(
      recording => this._createBlobUrl(recording));
  }

  getFilesForDownload() {
    if (!this.completeRecordings.length) {
      return [];
    }

    return this.completeRecordings.map((recording) => {
      return {
        filename: `${this.id}${this.supportedMediaRecorderType.extension}`,
        blob: this._createBuffer(recording),
      };
    });
  }

  /**
   * @param {BlobPart} recording
   */
  _createBuffer(recording) {
    return new Blob(recording, {
      type: this.supportedMediaRecorderType.type,
    });
  }

  /**
   * @param {BlobPart} recording
   */
  _createBlobUrl(recording) {
    const buffer = this._createBuffer(recording);

    return window.URL.createObjectURL(buffer);
  }
}
