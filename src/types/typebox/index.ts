import {TypeSystem} from "@sinclair/typebox/system";
import {
    type NumericOptions,
    ObjectOptions,
    type TNull,
    TNumber,
    TObject,
    TProperties,
    type TSchema,
    type TUndefined,
    type TUnion,
    Type
} from "@sinclair/typebox";
import {type TypeCheck} from "@sinclair/typebox/compiler";
import {addValidationFormats} from "./validation-formats";
import {File, Files} from "./types";
import {validateFile} from "./validate-file";

addValidationFormats();

const Files = TypeSystem.Type<File[], Files>(
    'Files',
    (options, value) => {
        if (!Array.isArray(value)) {
            return validateFile(options, value);
        }

        if (options.minimumFiles && value.length < options.minimumFiles) {
            return false;
        }

        if (options.maximumFiles && value.length > options.maximumFiles) {
            return false;
        }

        for (const item of value) {
            if (!validateFile(options, item)) {
                return false;
            }
        }

        return true;
    }
);

export const ExtendedType = {
    Numeric: (property?: NumericOptions<number>) => Type.Transform(Type.Union([Type.String(), Type.Number(property)]))
        .Decode((value) => {
            const number = +value;

            if (isNaN(number)) {
                return value;
            }

            return number;
        })
        .Encode((value) => value) as any as TNumber,
    ObjectString: <T extends TProperties>(properties: T, options?: ObjectOptions) => Type.Transform(Type.Union([Type.String(), Type.Object(properties, options)]))
        .Decode((value) => {
            if (typeof value === 'string') {
                try {
                    return JSON.parse(value as string);
                } catch {
                    return value;
                }
            }

            return value;
        })
        .Encode((value) => JSON.stringify(value)) as any as TObject<T>,
    File: TypeSystem.Type<File, File>('File', validateFile),
    Files: (options?: Files) => Type.Transform(Type.Union([Files(options)]))
        .Decode((value) => {
            if (Array.isArray(value)) {
                return value;
            }

            return [value];
        })
        .Encode((value) => value),
    Nullable: <T extends TSchema>(schema: T): TUnion<[T, TNull]> => ({
        ...schema,
        nullable: true
    } as any),
    MaybeEmpty: <T extends TSchema>(schema: T): TUnion<[T, TUndefined]> => Type.Union([Type.Undefined(), schema]) as any,
} as const;

declare module '@sinclair/typebox' {
    interface TypeBuilder {
        ObjectString: typeof ExtendedType.ObjectString
        Numeric: typeof ExtendedType.Numeric
        File: typeof ExtendedType.File
        Files: typeof ExtendedType.Files
        Nullable: typeof ExtendedType.Nullable
        MaybeEmpty: typeof ExtendedType.MaybeEmpty
    }

    interface SchemaOptions {
        error?: | string | ((
            type: string,
            validator: TypeCheck<any>,
            value: unknown
        ) => string | void)
    }
}

Type.ObjectString = ExtendedType.ObjectString;
Type.Numeric = ExtendedType.Numeric;

Type.File = (arg = {}) => ExtendedType.File({
    default: 'File',
    ...arg,
    mimetype: arg?.mimetype,
    format: 'binary'
});
Type.Files = (arg = {}) => ExtendedType.Files({
    ...arg,
    frameworkMeta: 'Files',
    default: 'Files',
    mimetype: arg?.mimetype,
    items: {
        ...arg,
        default: 'Files',
        mimetype: 'string',
        format: 'binary'
    }
});
Type.Nullable = (schema) => ExtendedType.Nullable(schema);
Type.MaybeEmpty = ExtendedType.MaybeEmpty;

export {Type as t};
export {
    type File,
    type Files,
    type FileMimeType,
    type FileSize,
    type MaybeArray,
} from './types';

export  {
    convertToBytes,
    validateFile,
} from './validate-file';

