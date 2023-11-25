import { FileSize } from "./types";
import { File } from "./types";

export function convertToBytes(fileSize: FileSize): number {
  const { value, unit } = fileSize;

  switch (unit) {
    case "B":
      return value;
    case "KB":
      return value * 1024;
    case "MB":
      return value * 1024 * 1024;
    case "GB":
      return value * 1024 * 1024 * 1024;
    case "TB":
      return value * 1024 * 1024 * 1024 * 1024;
    default:
      throw new Error("Invalid file size unit.");
  }
}

export function validateFile(options: File, value: any) {
  if (!(value instanceof Blob)) {
    return false;
  }

  if (options.minimumSize && value.size < convertToBytes(options.minimumSize)) {
    return false;
  }

  if (options.maximumSize && value.size > convertToBytes(options.maximumSize)) {
    return false;
  }

  if (options.mimetype) {
    if (typeof options.mimetype === "string") {
      if (!value.type.startsWith(options.mimetype)) {
        return false;
      }
    } else {
      for (const item of options.mimetype) {
        if (value.type.startsWith(item)) {
          return true;
        }
      }

      return false;
    }
  }

  return true;
}
