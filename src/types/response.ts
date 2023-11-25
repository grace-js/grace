import { Static, TSchema } from "@sinclair/typebox";

export type ResponseSchema<
  Continue extends TSchema,
  SwitchingProtocols extends TSchema,
  Processing extends TSchema,
  OK extends TSchema,
  Created extends TSchema,
  Accepted extends TSchema,
  NonAuthoritativeInfo extends TSchema,
  NoContent extends TSchema,
  ResetContent extends TSchema,
  PartialContent extends TSchema,
  MultiStatus extends TSchema,
  AlreadyReported extends TSchema,
  IMUsed extends TSchema,
  MultipleChoices extends TSchema,
  MovedPermanently extends TSchema,
  Found extends TSchema,
  SeeOther extends TSchema,
  NotModified extends TSchema,
  UseProxy extends TSchema,
  Unused extends TSchema,
  TemporaryRedirect extends TSchema,
  PermanentRedirect extends TSchema,
  BadRequest extends TSchema,
  Unauthorized extends TSchema,
  PaymentRequired extends TSchema,
  Forbidden extends TSchema,
  NotFound extends TSchema,
  MethodNotAllowed extends TSchema,
  NotAcceptable extends TSchema,
  ProxyAuthRequired extends TSchema,
  RequestTimeout extends TSchema,
  Conflict extends TSchema,
  Gone extends TSchema,
  LengthRequired extends TSchema,
  PreconditionFailed extends TSchema,
  PayloadTooLarge extends TSchema,
  URITooLong extends TSchema,
  UnsupportedMediaType extends TSchema,
  RequestedRangeNotSatisfiable extends TSchema,
  ExpectationFailed extends TSchema,
  IMATeapot extends TSchema,
  UnprocessableEntity extends TSchema,
  Locked extends TSchema,
  FailedDependency extends TSchema,
  UpgradeRequired extends TSchema,
  PreconditionRequired extends TSchema,
  TooManyRequests extends TSchema,
  RequestHeaderFieldsTooLarge extends TSchema,
  UnavailableForLegalReasons extends TSchema,
  InternalServerError extends TSchema,
  NotImplemented extends TSchema,
  BadGateway extends TSchema,
  ServiceUnavailable extends TSchema,
  GatewayTimeout extends TSchema,
  HTTPVersionNotSupported extends TSchema,
  VariantAlsoNegotiates extends TSchema,
  InsufficientStorage extends TSchema,
  LoopDetected extends TSchema,
  NotExtended extends TSchema,
  NetworkAuthenticationRequired extends TSchema,
> = {
  100?: Continue;
  101?: SwitchingProtocols;
  102?: Processing;
  200?: OK;
  201?: Created;
  202?: Accepted;
  203?: NonAuthoritativeInfo;
  204?: NoContent;
  205?: ResetContent;
  206?: PartialContent;
  207?: MultiStatus;
  208?: AlreadyReported;
  226?: IMUsed;
  300?: MultipleChoices;
  301?: MovedPermanently;
  302?: Found;
  303?: SeeOther;
  304?: NotModified;
  305?: UseProxy;
  306?: Unused;
  307?: TemporaryRedirect;
  308?: PermanentRedirect;
  400?: BadRequest;
  401?: Unauthorized;
  402?: PaymentRequired;
  403?: Forbidden;
  404?: NotFound;
  405?: MethodNotAllowed;
  406?: NotAcceptable;
  407?: ProxyAuthRequired;
  408?: RequestTimeout;
  409?: Conflict;
  410?: Gone;
  411?: LengthRequired;
  412?: PreconditionFailed;
  413?: PayloadTooLarge;
  414?: URITooLong;
  415?: UnsupportedMediaType;
  416?: RequestedRangeNotSatisfiable;
  417?: ExpectationFailed;
  418?: IMATeapot;
  422?: UnprocessableEntity;
  423?: Locked;
  424?: FailedDependency;
  426?: UpgradeRequired;
  428?: PreconditionRequired;
  429?: TooManyRequests;
  431?: RequestHeaderFieldsTooLarge;
  451?: UnavailableForLegalReasons;
  500?: InternalServerError;
  501?: NotImplemented;
  502?: BadGateway;
  503?: ServiceUnavailable;
  504?: GatewayTimeout;
  505?: HTTPVersionNotSupported;
  506?: VariantAlsoNegotiates;
  507?: InsufficientStorage;
  508?: LoopDetected;
  510?: NotExtended;
  511?: NetworkAuthenticationRequired;
};

export type AnyResponseSchema = ResponseSchema<
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema,
  TSchema
>;

export type PossibleResponses<Response extends AnyResponseSchema> =
  | {
      code: 100 | "CONTINUE";
      body: Response[100] extends TSchema ? Static<Response[100]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 101 | "SWITCHING_PROTOCOLS";
      body: Response[101] extends TSchema ? Static<Response[101]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 102 | "PROCESSING";
      body: Response[102] extends TSchema ? Static<Response[102]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 200 | "OK";
      body: Response[200] extends TSchema ? Static<Response[200]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 201 | "CREATED";
      body: Response[201] extends TSchema ? Static<Response[201]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 202 | "ACCEPTED";
      body: Response[202] extends TSchema ? Static<Response[202]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 203 | "NON_AUTHORITATIVE_INFO";
      body: Response[203] extends TSchema ? Static<Response[203]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 204 | "NO_CONTENT";
      body: Response[204] extends TSchema ? Static<Response[204]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 205 | "RESET_CONTENT";
      body: Response[205] extends TSchema ? Static<Response[205]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 206 | "PARTIAL_CONTENT";
      body: Response[206] extends TSchema ? Static<Response[206]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 207 | "MULTI_STATUS";
      body: Response[207] extends TSchema ? Static<Response[207]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 208 | "ALREADY_REPORTED";
      body: Response[208] extends TSchema ? Static<Response[208]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 226 | "IM_USED";
      body: Response[226] extends TSchema ? Static<Response[226]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 300 | "MULTIPLE_CHOICES";
      body: Response[300] extends TSchema ? Static<Response[300]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 301 | "MOVED_PERMANENTLY";
      body: Response[301] extends TSchema ? Static<Response[301]> : never;
      headers?: Record<string, string>;
      redirect: string;
    }
  | {
      code: 302 | "FOUND";
      body: Response[302] extends TSchema ? Static<Response[302]> : never;
      headers?: Record<string, string>;
      redirect: string;
    }
  | {
      code: 303 | "SEE_OTHER";
      body: Response[303] extends TSchema ? Static<Response[303]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 304 | "NOT_MODIFIED";
      body: Response[304] extends TSchema ? Static<Response[304]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 305 | "USE_PROXY";
      body: Response[305] extends TSchema ? Static<Response[305]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 306 | "UNUSED";
      body: Response[306] extends TSchema ? Static<Response[306]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 307 | "TEMPORARY_REDIRECT";
      body: Response[307] extends TSchema ? Static<Response[307]> : never;
      headers?: Record<string, string>;
      redirect: string;
    }
  | {
      code: 308 | "PERMANENT_REDIRECT";
      body: Response[308] extends TSchema ? Static<Response[308]> : never;
      headers?: Record<string, string>;
      redirect: string;
    }
  | {
      code: 400 | "BAD_REQUEST";
      body: Response[400] extends TSchema ? Static<Response[400]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 401 | "UNAUTHORIZED";
      body: Response[401] extends TSchema ? Static<Response[401]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 402 | "PAYMENT_REQUIRED";
      body: Response[402] extends TSchema ? Static<Response[402]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 403 | "FORBIDDEN";
      body: Response[403] extends TSchema ? Static<Response[403]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 404 | "NOT_FOUND";
      body: Response[404] extends TSchema ? Static<Response[404]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 405 | "METHOD_NOT_ALLOWED";
      body: Response[405] extends TSchema ? Static<Response[405]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 406 | "NOT_ACCEPTABLE";
      body: Response[406] extends TSchema ? Static<Response[406]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 407 | "PROXY_AUTH_REQUIRED";
      body: Response[407] extends TSchema ? Static<Response[407]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 408 | "REQUEST_TIMEOUT";
      body: Response[408] extends TSchema ? Static<Response[408]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 409 | "CONFLICT";
      body: Response[409] extends TSchema ? Static<Response[409]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 410 | "GONE";
      body: Response[410] extends TSchema ? Static<Response[410]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 411 | "LENGTH_REQUIRED";
      body: Response[411] extends TSchema ? Static<Response[411]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 412 | "PRECONDITION_FAILED";
      body: Response[412] extends TSchema ? Static<Response[412]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 413 | "PAYLOAD_TOO_LARGE";
      body: Response[413] extends TSchema ? Static<Response[413]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 414 | "URI_TOO_LONG";
      body: Response[414] extends TSchema ? Static<Response[414]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 415 | "UNSUPPORTED_MEDIA_TYPE";
      body: Response[415] extends TSchema ? Static<Response[415]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 416 | "REQUESTED_RANGE_NOT_SATISFIABLE";
      body: Response[416] extends TSchema ? Static<Response[416]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 417 | "EXPECTATION_FAILED";
      body: Response[417] extends TSchema ? Static<Response[417]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 418 | "IMA_TEAPOT";
      body: Response[418] extends TSchema ? Static<Response[418]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 422 | "UNPROCESSABLE_ENTITY";
      body: Response[422] extends TSchema ? Static<Response[422]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 423 | "LOCKED";
      body: Response[423] extends TSchema ? Static<Response[423]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 424 | "FAILED_DEPENDENCY";
      body: Response[424] extends TSchema ? Static<Response[424]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 426 | "UPGRADE_REQUIRED";
      body: Response[426] extends TSchema ? Static<Response[426]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 428 | "PRECONDITION_REQUIRED";
      body: Response[428] extends TSchema ? Static<Response[428]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 429 | "TOO_MANY_REQUESTS";
      body: Response[429] extends TSchema ? Static<Response[429]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 431 | "REQUEST_HEADER_FIELDS_TOO_LARGE";
      body: Response[431] extends TSchema ? Static<Response[431]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 451 | "UNAVAILABLE_FOR_LEGAL_REASONS";
      body: Response[451] extends TSchema ? Static<Response[451]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 500 | "INTERNAL_SERVER_ERROR";
      body: Response[500] extends TSchema ? Static<Response[500]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 501 | "NOT_IMPLEMENTED";
      body: Response[501] extends TSchema ? Static<Response[501]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 502 | "BAD_GATEWAY";
      body: Response[502] extends TSchema ? Static<Response[502]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 503 | "SERVICE_UNAVAILABLE";
      body: Response[503] extends TSchema ? Static<Response[503]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 504 | "GATEWAY_TIMEOUT";
      body: Response[504] extends TSchema ? Static<Response[504]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 505 | "HTTP_VERSION_NOT_SUPPORTED";
      body: Response[505] extends TSchema ? Static<Response[505]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 506 | "VARIANT_ALSO_NEGOTIATES";
      body: Response[506] extends TSchema ? Static<Response[506]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 507 | "INSUFFICIENT_STORAGE";
      body: Response[507] extends TSchema ? Static<Response[507]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 508 | "LOOP_DETECTED";
      body: Response[508] extends TSchema ? Static<Response[508]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 510 | "NOT_EXTENDED";
      body: Response[510] extends TSchema ? Static<Response[510]> : never;
      headers?: Record<string, string>;
    }
  | {
      code: 511 | "NETWORK_AUTHENTICATION_REQUIRED";
      body: Response[511] extends TSchema ? Static<Response[511]> : never;
      headers?: Record<string, string>;
    };

export function convertStatusCode(code: string | number) {
  if (typeof code === "number") {
    return code;
  }

  switch (code) {
    case "CONTINUE":
      return 100;
    case "SWITCHING_PROTOCOLS":
      return 101;
    case "PROCESSING":
      return 102;
    case "OK":
      return 200;
    case "CREATED":
      return 201;
    case "ACCEPTED":
      return 202;
    case "NON_AUTHORITATIVE_INFO":
      return 203;
    case "NO_CONTENT":
      return 204;
    case "RESET_CONTENT":
      return 205;
    case "PARTIAL_CONTENT":
      return 206;
    case "MULTI_STATUS":
      return 207;
    case "ALREADY_REPORTED":
      return 208;
    case "IM_USED":
      return 226;
    case "MULTIPLE_CHOICES":
      return 300;
    case "MOVED_PERMANENTLY":
      return 301;
    case "FOUND":
      return 302;
    case "SEE_OTHER":
      return 303;
    case "NOT_MODIFIED":
      return 304;
    case "USE_PROXY":
      return 305;
    case "UNUSED":
      return 306;
    case "TEMPORARY_REDIRECT":
      return 307;
    case "PERMANENT_REDIRECT":
      return 308;
    case "BAD_REQUEST":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "PAYMENT_REQUIRED":
      return 402;
    case "FORBIDDEN":
      return 403;
    case "NOT_FOUND":
      return 404;
    case "METHOD_NOT_ALLOWED":
      return 405;
    case "NOT_ACCEPTABLE":
      return 406;
    case "PROXY_AUTH_REQUIRED":
      return 407;
    case "REQUEST_TIMEOUT":
      return 408;
    case "CONFLICT":
      return 409;
    case "GONE":
      return 410;
    case "LENGTH_REQUIRED":
      return 411;
    case "PRECONDITION_FAILED":
      return 412;
    case "PAYLOAD_TOO_LARGE":
      return 413;
    case "URI_TOO_LONG":
      return 414;
    case "UNSUPPORTED_MEDIA_TYPE":
      return 415;
    case "REQUESTED_RANGE_NOT_SATISFIABLE":
      return 416;
    case "EXPECTATION_FAILED":
      return 417;
    case "IMA_TEAPOT":
      return 418;
    case "UNPROCESSABLE_ENTITY":
      return 422;
    case "LOCKED":
      return 423;
    case "FAILED_DEPENDENCY":
      return 424;
    case "UPGRADE_REQUIRED":
      return 426;
    case "PRECONDITION_REQUIRED":
      return 428;
    case "TOO_MANY_REQUESTS":
      return 429;
    case "REQUEST_HEADER_FIELDS_TOO_LARGE":
      return 431;
    case "UNAVAILABLE_FOR_LEGAL_REASONS":
      return 451;
    case "INTERNAL_SERVER_ERROR":
      return 500;
    case "NOT_IMPLEMENTED":
      return 501;
    case "BAD_GATEWAY":
      return 502;
    case "SERVICE_UNAVAILABLE":
      return 503;
    case "GATEWAY_TIMEOUT":
      return 504;
    case "HTTP_VERSION_NOT_SUPPORTED":
      return 505;
    case "VARIANT_ALSO_NEGOTIATES":
      return 506;
    case "INSUFFICIENT_STORAGE":
      return 507;
    case "LOOP_DETECTED":
      return 508;
    case "NOT_EXTENDED":
      return 510;
    case "NETWORK_AUTHENTICATION_REQUIRED":
      return 511;
    default:
      throw new Error(`Unknown HTTP status code: ${code}`);
  }
}
