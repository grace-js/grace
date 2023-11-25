import { NumericOptions, SchemaOptions } from "@sinclair/typebox";

export type FileSize = {
  value: number;
  unit: "B" | "KB" | "MB" | "GB" | "TB";
};

export type FileMimeType = MaybeArray<
  | string
  | "image"
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/tiff"
  | "image/x-icon"
  | "image/svg"
  | "image/webp"
  | "image/avif"
  | "audio"
  | "audio/mpeg"
  | "audio/x-ms-wma"
  | "audio/vnd.rn-realaudio"
  | "audio/x-wav"
  | "video"
  | "video/mpeg"
  | "video/mp4"
  | "video/quicktime"
  | "video/x-ms-wmv"
  | "video/x-msvideo"
  | "video/x-flv"
  | "video/webm"
  | "text"
  | "text/css"
  | "text/csv"
  | "text/html"
  | "text/javascript"
  | "text/plain"
  | "text/xml"
  | "application"
  | "application/ogg"
  | "application/pdf"
  | "application/xhtml"
  | "application/html"
  | "application/json"
  | "application/ld+json"
  | "application/xml"
  | "application/zip"
>;

export type MaybeArray<T> = T | T[];

export interface File extends SchemaOptions {
  mimetype?: FileMimeType;
  minimumSize?: FileSize;
  maximumSize?: FileSize;
}

export interface Files extends File {
  minimumFiles?: number;
  maximumFiles?: number;
}

export namespace GraceTypeOptions {
  export type Numeric = NumericOptions<number>;

  export interface File extends SchemaOptions {
    mimetype?: FileMimeType;
    minimumSize?: FileSize;
    maximumSize?: FileSize;
  }

  export interface Files extends File {
    minimumFiles?: number;
    maximumFiles?: number;
  }
}
