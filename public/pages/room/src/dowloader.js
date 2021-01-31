class Downloader {
  constructor() {
    this.zip = new JSZip();
    this.directories = new Map();
    this.hasFiles = false;
  }

  /**
   * @param {Object} o
   * @param {Blob} o.blob
   * @param {string} o.filename
   * @param {string} o.directory
   */
  addFile({
    blob,
    filename,
    directory = null,
  }) {
    const file = directory
      ? `${directory}/${filename}`
      : filename;

    this.zip.file(file, blob);
    this.hasFiles = true;
  }

  async download() {
    if (!this.hasFiles) {
      return;
    }

    const blob = await this.zip.generateAsync({ type: 'blob' });

    const url = window.URL.createObjectURL(blob);

    window.open(url, '_blank');
  }
}
