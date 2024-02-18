import {z} from 'zod';

export type FileSize = {
    value: number;
    unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB';
}

export type FileMimeType = MaybeArray<
    string | 'image' | 'image/jpeg' | 'image/png' | 'image/gif' | 'image/tiff' | 'image/x-icon' | 'image/svg' | 'image/webp' | 'image/avif' |
    'audio' | 'audio/mpeg' | 'audio/x-ms-wma' | 'audio/vnd.rn-realaudio' | 'audio/x-wav' |
    'video' | 'video/mpeg' | 'video/mp4' | 'video/quicktime' | 'video/x-ms-wmv' | 'video/x-msvideo' | 'video/x-flv' | 'video/webm' |
    'text' | 'text/css' | 'text/csv' | 'text/html' | 'text/javascript' | 'text/plain' | 'text/xml' |
    'application' | 'application/ogg' | 'application/pdf' | 'application/xhtml' | 'application/html' | 'application/json'
    | 'application/ld+json' | 'application/xml' | 'application/zip'
>;

export type MaybeArray<T> = T | T[];

export interface GraceFile {
    mimetype?: FileMimeType;
    minimumSize?: FileSize;
    maximumSize?: FileSize;
}

export interface GraceFiles extends GraceFile {
    minimumFiles?: number;
    maximumFiles?: number;
}

export function convertToBytes(fileSize: FileSize): number {
    const {
        value,
        unit
    } = fileSize;

    switch (unit) {
        case 'B':
            return value;
        case 'KB':
            return value * 1024;
        case 'MB':
            return value * 1024 * 1024;
        case 'GB':
            return value * 1024 * 1024 * 1024;
        case 'TB':
            return value * 1024 * 1024 * 1024 * 1024;
        default:
            throw new Error('Invalid file size unit.');
    }
}

export function validateFile(options: GraceFile, value: any) {
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
        if (typeof options.mimetype === 'string') {
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

export const zg = Object.assign({
    file: (options: GraceFile) => z.custom<File>((data) => {
        return validateFile(options, data);
    }),
    files: (options: GraceFiles) => z.array(z.custom<File>((data) => {
        return validateFile(options, data);
    })).min(options.minimumFiles ?? 0).max(options.maximumFiles ?? Infinity),
    base64: (options: GraceFile) => z.string().refine((data) => {
        if (data.startsWith('data:')) {
            const [mimetype, base64] = data.split(';base64,');
            return validateFile(options, new Blob([atob(base64)], {type: mimetype}));
        }

        return validateFile(options, new Blob([data], {type: 'application/octet-stream'}));
    })
}, z);
