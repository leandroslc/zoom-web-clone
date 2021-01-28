/// <reference path="socket-builder.js" />
/// <reference path="media.js" />
/// <reference path="view.js" />
/// <reference path="business.js" />

const ManifestUrl = '/manifest.json';

/**
 * @param {HTMLButtonElement} recorderBtn
 */
const recordClick = function (recorderBtn) {
  this.recordingEnabled = false;

  return () => {
    this.recordingEnabled = !this.recordingEnabled;
    recorderBtn.style.color = this.recordingEnabled ? 'red' : 'white';
  };
}

async function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');

  const response = await fetch(ManifestUrl);
  const manifestData = await response.json();

  console.log('This is the room', room);

  const recorderBtn = document.getElementById('record');
  recorderBtn.addEventListener('click', recordClick(recorderBtn));

  const socketUrl = manifestData.serverUrl;
  const socketBuilder = new SocketBuilder({ socketUrl });

  const view = new View();
  const media = new Media();

  await Business.create({
    media,
    view,
    room,
    socketBuilder,
  });
}

window.onload = main;
