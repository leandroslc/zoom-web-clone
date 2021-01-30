/**
 * @typedef {Object} PeerConfig
 * @property {string|number} port
 * @property {string} host
 * @property {string} path
 * @property {boolean} secure
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
    this.onPeerStreamReceived = () => {};
    this.onCallError = () => {};
    this.onCallClose = () => {};
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
  setOnCallError(fn) {
    this.onCallError = fn;

    return this;
  }

  /**
   * @param {() => void} fn
   */
  setOnCallClose(fn) {
    this.onCallClose = fn;

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
    call.on('error', error => this.onCallError(call, error));
    call.on('close', () => this.onCallClose(call));

    this.onCallReceived(call);
  }

  // Generates a Peer proxy class that adds the same events of the receiver for the caller
  _generatePeerProxy(PeerModule) {
    class PeerProxy extends PeerModule {};

    const originalCallMethod = PeerProxy.prototype.call;
    const self = this;

    PeerProxy.prototype.call = function (id, stream) {
      const call = originalCallMethod.apply(this, [id, stream]);

      self._prepareCallEvent(call);

      return call;
    };

    return PeerProxy;
  }

  build() {
    const PeerProxy = this._generatePeerProxy(Peer);
    const peer = new PeerProxy(this.id, this.peerConfig);

    peer.on('error', this.onError);
    peer.on('call', this._prepareCallEvent.bind(this));

    return new Promise(resolve => peer.on('open', () => {
      this.onConnectionOpened(peer);
      return resolve(peer);
    }));
  }
}
