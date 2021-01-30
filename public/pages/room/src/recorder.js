const CommonRecorderVideoTypes = [
  'video/webm',
];

const CommonRecorderCodecs = [
  'codecs=vp9,opus',
  'codecs=vp8,opus',
  '',
];

const CommonMediaRecorderContentTypes = CommonRecorderVideoTypes
  .map(type => CommonRecorderCodecs
    .map(codec => `${type}${codec ? ';' + codec : ''}`))
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
    this.mediaRecorder = {};
    this.recordedBlobs = [];
    this.completeRecordings = [];
    this.recordingActive = false;
  }

  _getMediaRecorderOptions() {
    const supportMediaRecorderType = CommonMediaRecorderContentTypes
      .find(type => MediaRecorder.isTypeSupported(type));

    if (!supportMediaRecorderType) {
      throw new Error(`None of the following codecs are supported: "${
        CommonMediaRecorderContentTypes.join(', ')
      }"`);
    }

    return {
      mimeType: supportMediaRecorderType,
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

    this.mediaRecorder.stop();
    this.recordingActive = false;
  }
}
