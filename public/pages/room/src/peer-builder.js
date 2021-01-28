/**
 * @typedef {Object} PeerConfig
 * @property {string|number} port
 * @property {string} host
 * @property {string} path
 */

class PeerBuilder {
  /**
   * @param {Object} o
   * @param {string} o.id
   * @param {PeerConfig} o.peerConfig
   */
  constructor({ id, peerConfig }) {
    this.id = id;
    this.peerConfig = peerConfig;

    this.onError = () => {};
    this.onCallReceived = () => {};
    this.onConnectionOpened = () => {};
  }

  /**
   * @param {() => void} fn
   */
  setOnError(fn) {
    this.onError = fn;

    return this;
  }

  /**
   * @param {() => void} fn
   */
  setOnCallReceived(fn) {
    this.onCallReceived = fn;

    return this;
  }

  /**
   * @param {() => void} fn
   */
  setOnConnectionOpened(fn) {
    this.onConnectionOpened = fn;

    return this;
  }

  /**
   * @param {() => void} fn
   */
  setOnPeerStreamReceived(fn) {
    this.onPeerStreamReceived = fn;

    return this;
  }

  _prepareCallEvent(call) {
    call.on('stream', stream => this.onPeerStreamReceived(call, stream));

    this.onCallReceived(call);
  }

  build() {
    const peer = new Peer(this.id, this.peerConfig);

    peer.on('error', this.onError);
    peer.on('call', this._prepareCallEvent.bind(this));

    return new Promise(resolve => peer.on('open', () => {
      this.onConnectionOpened(peer);
      return resolve(peer);
    }));
  }
}
