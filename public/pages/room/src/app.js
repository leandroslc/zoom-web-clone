/// <reference path="socket-builder.js" />
/// <reference path="peer-builder.js" />
/// <reference path="media.js" />
/// <reference path="view.js" />
/// <reference path="business.js" />

const ManifestUrl = '/manifest.json';

async function main() {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');

  const response = await fetch(ManifestUrl);
  const manifestData = await response.json();

  console.log('This is the room', room);

  const socketUrl = manifestData.serverUrl;
  const socketBuilder = new SocketBuilder({ socketUrl });

  const peerBuilder = new PeerBuilder({
    id: undefined,
    peerConfig: {
      host: manifestData.peerServer.host,
      port: manifestData.peerServer.port,
      path: '/',
      secure: true,
    },
  });

  const view = new View();
  const media = new Media();

  await Business.create({
    media,
    view,
    room,
    socketBuilder,
    peerBuilder,
  });
}

window.onload = main;
