/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { v4 as uuid } from "uuid";

import JWTStorage from "@features/auth/jwt-storage-service";
import { FileType, PendingFileType } from "@features/files/types/file";
import Resumable from "@features/files/utils/resumable";
import Logger from "@features/global/framework/logger-service";
import RouterServices from "@features/router/services/router-service";
import _ from "lodash";
import FileUploadAPIClient from "../api/file-upload-api-client";
import { isPendingFileStatusPending } from "../utils/pending-files";
import { FileTreeObject, getFilesTree } from "components/uploads/file-tree-utils";

export type PendingUploadData = {
  id: string;
  status: "new" | "pending" | "error" | "success" | "pause" | "cancel";
  label: string;
  progress: number; //Between 0 and 1
  lastProgress: number;
  speed: number;
  totalCount: number;
  numberOfUploaded: number;
  //estimation in seconds
  estimation: number;
};

export interface Upload<T> {

  start(): Promise<void>;

  cancel(): Promise<void>;

  pause(): Promise<void>;

  resume(): Promise<void>;

  pauseOrResume(): Promise<void>;

}

export class SingleFileUpload implements Upload<File>{

  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  pause(): Promise<void> {
    return Promise.resolve(undefined);
  }

  pauseOrResume(): Promise<void> {
    return Promise.resolve(undefined);
  }

  resume(): Promise<void> {
    return Promise.resolve(undefined);
  }

  start(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

export class SingleDirectoryUpload implements Upload<File>{

  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  cancel(): Promise<void> {
    return Promise.resolve(undefined);
  }

  pause(): Promise<void> {
    return Promise.resolve(undefined);
  }

  pauseOrResume(): Promise<void> {
    return Promise.resolve(undefined);
  }

  resume(): Promise<void> {
    return Promise.resolve(undefined);
  }

  start(): Promise<void> {
    return Promise.resolve(undefined);
  }
}

class FileTreeObj {

  files: File[] = [];

  directories: FileTreeObj[] = [];

  totalFilesSize: number = 0;

  totalNumberOfDirectories: number = 0;

  isFile: boolean = false;

}
class UploadTask {

  private static MAX_CONCURRENT_REQUESTS = 3;

  id: string;
  status: "new" | "pending" | "error" | "success" | "pause" | "cancel";
  label: string;
  progress = 0; //Between 0 and 1
  speed  = 0;
  totalCount = 0;
  totalFolderCount: 0;
  numberOfUploaded = 0;
  //estimation in seconds
  estimation = 0;

  private event: Event & { dataTransfer: DataTransfer } ;


  constructor(event: Event & { dataTransfer: DataTransfer }) {
    this.id = uuid()
    this.status = "new";
    this.label = "";
    this.event = event;
  }



  async start(): Promise<void> {
    //build file tree
    const tree = await getFilesTree(this.event);

    //list of files with the link to the parent folder
    //list of folders

    this.totalCount = 0; //TODO get from object tree

    //estimation
    // e = speedOfCreatingOneFolder * numberOfFolders + speedOfUploadingOneByte * numberOfBytes
    // if we didn't upload any files yes, then
    // e = speedToCreateOneFolder * totalNumberOfElements * 2
    // because we will have at least twice more requests, one for creation file record and one for
    // uploading

    //we need to update estimation after completion of every task


  }

  aysnc private getFileTree(): FileTreeObj {

  }

  public inProgress(): boolean {
    return this.status === "pending";
  }

  public onPause(): boolean {
    return this.status === "pause";
  }

  public isNew(): boolean {
    return this.status === "new";
  }

}

class FileUploadService {

  private static MAX_CONCURRENT_UPLOADS = 3;

  private logger = Logger.getLogger("Services/FileUploadService");

  private pendingUploads: UploadTask[] = [];

  public upload(event: Event & { dataTransfer: DataTransfer }) {
    if (!event) throw new Error("Input params are undefined");
    this.pendingUploads.push(new UploadTask(event));
    this.tick()
  }

  private tick() {
    const startedTasks = this.pendingUploads.filter(u => u.inProgress()).length;
    if (startedTasks >= FileUploadService.MAX_CONCURRENT_UPLOADS) return;

    const task =  this.pendingUploads.find(u => u.isNew());
    if (task) task
      .start()
      .catch((e) => {
        task.status = "error";
        this.logger.error("Error staring file upload");
        throw e;
      })
      .finally(this.tick);
  }

}