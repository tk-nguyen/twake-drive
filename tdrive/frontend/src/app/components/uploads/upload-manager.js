import Observable from '@deprecated/CollectionsV1/observable.js';

class UploadManager extends Observable {
  constructor() {
    super();
    this.setObservableName('upload_manager');
    this.reinit();

    window.uploadManager = this;
  }

  reinit() {
    if (this.reinitTimeout) clearTimeout(this.reinitTimeout);
    if (this.reinitTimeoutBefore) clearTimeout(this.reinitTimeoutBefore);
    this.currentUploadTotalSize = 0;
    this.currentUploadTotalNumber = 0;
    this.currentUploadedTotalSize = 0;
    this.currentUploadedFilesNumber = 0;
    this.currentUploadingFilesNumber = 0;
    this.currentCancelledFilesNumber = 0;
    this.currentWaitingFilesNumber = 0;
    this.currentErrorFilesNumber = 0;
    this.currentUploadFiles = [];
    this.currentUploadStartTime = new Date();
    this.will_close = false;
    this.notify();
  }

  abort(elements) {
    var that = this;

    if (elements.length === undefined) {
      elements = [elements];
    }

    elements.forEach(element => {
      if (element.resumable) element.resumable.cancel();
      element.xhr_cancelled = true;
      element.cancelled = true;
      that.currentCancelledFilesNumber++;
      that.currentUploadingFilesNumber--;

      if (
        that.currentUploadedFilesNumber +
          that.currentCancelledFilesNumber +
          that.currentErrorFilesNumber >=
        that.currentUploadTotalNumber
      ) {
        that.reinitAfterDelay();
      }
    });

    that.notify();
  }
}

const service = new UploadManager();
export default service;
