// Code generated by protoc-gen-ts_proto. DO NOT EDIT.
// versions:
//   protoc-gen-ts_proto  v2.7.0
//   protoc               v5.29.3
// source: auth.proto

/* eslint-disable */
import { BinaryReader, BinaryWriter } from '@bufbuild/protobuf/wire';
import { Timestamp } from './google/protobuf/timestamp';

export const protobufPackage = 'auth';

export interface CredentialsLoginRequest {
	/** Email or Username to login with. */
	userOrEmail: string;
	/** Password to login with. */
	password: string;
	/** Optional. If set, the user will be logged in as this user. */
	oneTimePassword?: string | undefined;
	/** Optional. If set, manual specify the expiration time of the session. */
	sessionExpiration?: Date | undefined;
}

export interface LoginResponse {
	response?:
		| { $case: 'success'; value: LoginResponse_LoginSuccess }
		| { $case: 'failure'; value: LoginResponse_LoginFailure }
		| { $case: 'error'; value: LoginResponse_LoginError }
		| undefined;
}

/**
 * Enum for the different login failure codes.
 * Loosely based on HTTP status codes (dont ask why).
 */
export enum LoginResponse_LoginFailureCode {
	LOGIN_FAILURE_UNSPECIFIED = 0,
	LOGIN_FAILURE_USER_NOT_FOUND = 404,
	LOGIN_FAILURE_INVALID_PASSWORD = 401,
	LOGIN_FAILURE_INVALID_ONE_TIME_PASSWORD = 428,
	LOGIN_FAILURE_ACCOUNT_DISABLED = 410,
	LOGIN_FAILURE_TOO_MANY_REQUESTS = 429,
	UNRECOGNIZED = -1
}

export function loginResponse_LoginFailureCodeFromJSON(
	object: any
): LoginResponse_LoginFailureCode {
	switch (object) {
		case 0:
		case 'LOGIN_FAILURE_UNSPECIFIED':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_UNSPECIFIED;
		case 404:
		case 'LOGIN_FAILURE_USER_NOT_FOUND':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_USER_NOT_FOUND;
		case 401:
		case 'LOGIN_FAILURE_INVALID_PASSWORD':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_INVALID_PASSWORD;
		case 428:
		case 'LOGIN_FAILURE_INVALID_ONE_TIME_PASSWORD':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_INVALID_ONE_TIME_PASSWORD;
		case 410:
		case 'LOGIN_FAILURE_ACCOUNT_DISABLED':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_ACCOUNT_DISABLED;
		case 429:
		case 'LOGIN_FAILURE_TOO_MANY_REQUESTS':
			return LoginResponse_LoginFailureCode.LOGIN_FAILURE_TOO_MANY_REQUESTS;
		case -1:
		case 'UNRECOGNIZED':
		default:
			return LoginResponse_LoginFailureCode.UNRECOGNIZED;
	}
}

export function loginResponse_LoginFailureCodeToJSON(
	object: LoginResponse_LoginFailureCode
): string {
	switch (object) {
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_UNSPECIFIED:
			return 'LOGIN_FAILURE_UNSPECIFIED';
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_USER_NOT_FOUND:
			return 'LOGIN_FAILURE_USER_NOT_FOUND';
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_INVALID_PASSWORD:
			return 'LOGIN_FAILURE_INVALID_PASSWORD';
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_INVALID_ONE_TIME_PASSWORD:
			return 'LOGIN_FAILURE_INVALID_ONE_TIME_PASSWORD';
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_ACCOUNT_DISABLED:
			return 'LOGIN_FAILURE_ACCOUNT_DISABLED';
		case LoginResponse_LoginFailureCode.LOGIN_FAILURE_TOO_MANY_REQUESTS:
			return 'LOGIN_FAILURE_TOO_MANY_REQUESTS';
		case LoginResponse_LoginFailureCode.UNRECOGNIZED:
		default:
			return 'UNRECOGNIZED';
	}
}

export enum LoginResponse_LoginErrorCode {
	LOGIN_ERROR_UNSPECIFIED = 0,
	UNRECOGNIZED = -1
}

export function loginResponse_LoginErrorCodeFromJSON(object: any): LoginResponse_LoginErrorCode {
	switch (object) {
		case 0:
		case 'LOGIN_ERROR_UNSPECIFIED':
			return LoginResponse_LoginErrorCode.LOGIN_ERROR_UNSPECIFIED;
		case -1:
		case 'UNRECOGNIZED':
		default:
			return LoginResponse_LoginErrorCode.UNRECOGNIZED;
	}
}

export function loginResponse_LoginErrorCodeToJSON(object: LoginResponse_LoginErrorCode): string {
	switch (object) {
		case LoginResponse_LoginErrorCode.LOGIN_ERROR_UNSPECIFIED:
			return 'LOGIN_ERROR_UNSPECIFIED';
		case LoginResponse_LoginErrorCode.UNRECOGNIZED:
		default:
			return 'UNRECOGNIZED';
	}
}

export interface LoginResponse_LoginSuccess {
	/** A JWT like token that can be used to authenticate future requests. */
	token: string;
}

export interface LoginResponse_LoginFailure {
	/** / A machine readable error code. */
	code: LoginResponse_LoginFailureCode;
	/** / A human readable error message. */
	error?: string | undefined;
}

export interface LoginResponse_LoginError {
	/** / A machine readable error code. */
	code: LoginResponse_LoginErrorCode;
	/** / A human readable error message. */
	message: string;
}

function createBaseCredentialsLoginRequest(): CredentialsLoginRequest {
	return {
		userOrEmail: '',
		password: '',
		oneTimePassword: undefined,
		sessionExpiration: undefined
	};
}

export const CredentialsLoginRequest: MessageFns<CredentialsLoginRequest> = {
	encode(
		message: CredentialsLoginRequest,
		writer: BinaryWriter = new BinaryWriter()
	): BinaryWriter {
		if (message.userOrEmail !== '') {
			writer.uint32(10).string(message.userOrEmail);
		}
		if (message.password !== '') {
			writer.uint32(18).string(message.password);
		}
		if (message.oneTimePassword !== undefined) {
			writer.uint32(26).string(message.oneTimePassword);
		}
		if (message.sessionExpiration !== undefined) {
			Timestamp.encode(toTimestamp(message.sessionExpiration), writer.uint32(34).fork()).join();
		}
		return writer;
	},

	decode(input: BinaryReader | Uint8Array, length?: number): CredentialsLoginRequest {
		const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseCredentialsLoginRequest();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1: {
					if (tag !== 10) {
						break;
					}

					message.userOrEmail = reader.string();
					continue;
				}
				case 2: {
					if (tag !== 18) {
						break;
					}

					message.password = reader.string();
					continue;
				}
				case 3: {
					if (tag !== 26) {
						break;
					}

					message.oneTimePassword = reader.string();
					continue;
				}
				case 4: {
					if (tag !== 34) {
						break;
					}

					message.sessionExpiration = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
					continue;
				}
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skip(tag & 7);
		}
		return message;
	},

	fromJSON(object: any): CredentialsLoginRequest {
		return {
			userOrEmail: isSet(object.userOrEmail) ? gt.String(object.userOrEmail) : '',
			password: isSet(object.password) ? gt.String(object.password) : '',
			oneTimePassword: isSet(object.oneTimePassword)
				? gt.String(object.oneTimePassword)
				: undefined,
			sessionExpiration: isSet(object.sessionExpiration)
				? fromJsonTimestamp(object.sessionExpiration)
				: undefined
		};
	},

	toJSON(message: CredentialsLoginRequest): unknown {
		const obj: any = {};
		if (message.userOrEmail !== '') {
			obj.userOrEmail = message.userOrEmail;
		}
		if (message.password !== '') {
			obj.password = message.password;
		}
		if (message.oneTimePassword !== undefined) {
			obj.oneTimePassword = message.oneTimePassword;
		}
		if (message.sessionExpiration !== undefined) {
			obj.sessionExpiration = message.sessionExpiration.toISOString();
		}
		return obj;
	},

	create<I extends Exact<DeepPartial<CredentialsLoginRequest>, I>>(
		base?: I
	): CredentialsLoginRequest {
		return CredentialsLoginRequest.fromPartial(base ?? ({} as any));
	},
	fromPartial<I extends Exact<DeepPartial<CredentialsLoginRequest>, I>>(
		object: I
	): CredentialsLoginRequest {
		const message = createBaseCredentialsLoginRequest();
		message.userOrEmail = object.userOrEmail ?? '';
		message.password = object.password ?? '';
		message.oneTimePassword = object.oneTimePassword ?? undefined;
		message.sessionExpiration = object.sessionExpiration ?? undefined;
		return message;
	}
};

function createBaseLoginResponse(): LoginResponse {
	return { response: undefined };
}

export const LoginResponse: MessageFns<LoginResponse> = {
	encode(message: LoginResponse, writer: BinaryWriter = new BinaryWriter()): BinaryWriter {
		switch (message.response?.$case) {
			case 'success':
				LoginResponse_LoginSuccess.encode(message.response.value, writer.uint32(10).fork()).join();
				break;
			case 'failure':
				LoginResponse_LoginFailure.encode(message.response.value, writer.uint32(18).fork()).join();
				break;
			case 'error':
				LoginResponse_LoginError.encode(message.response.value, writer.uint32(26).fork()).join();
				break;
		}
		return writer;
	},

	decode(input: BinaryReader | Uint8Array, length?: number): LoginResponse {
		const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseLoginResponse();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1: {
					if (tag !== 10) {
						break;
					}

					message.response = {
						$case: 'success',
						value: LoginResponse_LoginSuccess.decode(reader, reader.uint32())
					};
					continue;
				}
				case 2: {
					if (tag !== 18) {
						break;
					}

					message.response = {
						$case: 'failure',
						value: LoginResponse_LoginFailure.decode(reader, reader.uint32())
					};
					continue;
				}
				case 3: {
					if (tag !== 26) {
						break;
					}

					message.response = {
						$case: 'error',
						value: LoginResponse_LoginError.decode(reader, reader.uint32())
					};
					continue;
				}
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skip(tag & 7);
		}
		return message;
	},

	fromJSON(object: any): LoginResponse {
		return {
			response: isSet(object.success)
				? { $case: 'success', value: LoginResponse_LoginSuccess.fromJSON(object.success) }
				: isSet(object.failure)
					? { $case: 'failure', value: LoginResponse_LoginFailure.fromJSON(object.failure) }
					: isSet(object.error)
						? { $case: 'error', value: LoginResponse_LoginError.fromJSON(object.error) }
						: undefined
		};
	},

	toJSON(message: LoginResponse): unknown {
		const obj: any = {};
		if (message.response?.$case === 'success') {
			obj.success = LoginResponse_LoginSuccess.toJSON(message.response.value);
		} else if (message.response?.$case === 'failure') {
			obj.failure = LoginResponse_LoginFailure.toJSON(message.response.value);
		} else if (message.response?.$case === 'error') {
			obj.error = LoginResponse_LoginError.toJSON(message.response.value);
		}
		return obj;
	},

	create<I extends Exact<DeepPartial<LoginResponse>, I>>(base?: I): LoginResponse {
		return LoginResponse.fromPartial(base ?? ({} as any));
	},
	fromPartial<I extends Exact<DeepPartial<LoginResponse>, I>>(object: I): LoginResponse {
		const message = createBaseLoginResponse();
		switch (object.response?.$case) {
			case 'success': {
				if (object.response?.value !== undefined && object.response?.value !== null) {
					message.response = {
						$case: 'success',
						value: LoginResponse_LoginSuccess.fromPartial(object.response.value)
					};
				}
				break;
			}
			case 'failure': {
				if (object.response?.value !== undefined && object.response?.value !== null) {
					message.response = {
						$case: 'failure',
						value: LoginResponse_LoginFailure.fromPartial(object.response.value)
					};
				}
				break;
			}
			case 'error': {
				if (object.response?.value !== undefined && object.response?.value !== null) {
					message.response = {
						$case: 'error',
						value: LoginResponse_LoginError.fromPartial(object.response.value)
					};
				}
				break;
			}
		}
		return message;
	}
};

function createBaseLoginResponse_LoginSuccess(): LoginResponse_LoginSuccess {
	return { token: '' };
}

export const LoginResponse_LoginSuccess: MessageFns<LoginResponse_LoginSuccess> = {
	encode(
		message: LoginResponse_LoginSuccess,
		writer: BinaryWriter = new BinaryWriter()
	): BinaryWriter {
		if (message.token !== '') {
			writer.uint32(10).string(message.token);
		}
		return writer;
	},

	decode(input: BinaryReader | Uint8Array, length?: number): LoginResponse_LoginSuccess {
		const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseLoginResponse_LoginSuccess();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1: {
					if (tag !== 10) {
						break;
					}

					message.token = reader.string();
					continue;
				}
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skip(tag & 7);
		}
		return message;
	},

	fromJSON(object: any): LoginResponse_LoginSuccess {
		return { token: isSet(object.token) ? gt.String(object.token) : '' };
	},

	toJSON(message: LoginResponse_LoginSuccess): unknown {
		const obj: any = {};
		if (message.token !== '') {
			obj.token = message.token;
		}
		return obj;
	},

	create<I extends Exact<DeepPartial<LoginResponse_LoginSuccess>, I>>(
		base?: I
	): LoginResponse_LoginSuccess {
		return LoginResponse_LoginSuccess.fromPartial(base ?? ({} as any));
	},
	fromPartial<I extends Exact<DeepPartial<LoginResponse_LoginSuccess>, I>>(
		object: I
	): LoginResponse_LoginSuccess {
		const message = createBaseLoginResponse_LoginSuccess();
		message.token = object.token ?? '';
		return message;
	}
};

function createBaseLoginResponse_LoginFailure(): LoginResponse_LoginFailure {
	return { code: 0, error: undefined };
}

export const LoginResponse_LoginFailure: MessageFns<LoginResponse_LoginFailure> = {
	encode(
		message: LoginResponse_LoginFailure,
		writer: BinaryWriter = new BinaryWriter()
	): BinaryWriter {
		if (message.code !== 0) {
			writer.uint32(8).int32(message.code);
		}
		if (message.error !== undefined) {
			writer.uint32(18).string(message.error);
		}
		return writer;
	},

	decode(input: BinaryReader | Uint8Array, length?: number): LoginResponse_LoginFailure {
		const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseLoginResponse_LoginFailure();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1: {
					if (tag !== 8) {
						break;
					}

					message.code = reader.int32() as any;
					continue;
				}
				case 2: {
					if (tag !== 18) {
						break;
					}

					message.error = reader.string();
					continue;
				}
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skip(tag & 7);
		}
		return message;
	},

	fromJSON(object: any): LoginResponse_LoginFailure {
		return {
			code: isSet(object.code) ? loginResponse_LoginFailureCodeFromJSON(object.code) : 0,
			error: isSet(object.error) ? gt.String(object.error) : undefined
		};
	},

	toJSON(message: LoginResponse_LoginFailure): unknown {
		const obj: any = {};
		if (message.code !== 0) {
			obj.code = loginResponse_LoginFailureCodeToJSON(message.code);
		}
		if (message.error !== undefined) {
			obj.error = message.error;
		}
		return obj;
	},

	create<I extends Exact<DeepPartial<LoginResponse_LoginFailure>, I>>(
		base?: I
	): LoginResponse_LoginFailure {
		return LoginResponse_LoginFailure.fromPartial(base ?? ({} as any));
	},
	fromPartial<I extends Exact<DeepPartial<LoginResponse_LoginFailure>, I>>(
		object: I
	): LoginResponse_LoginFailure {
		const message = createBaseLoginResponse_LoginFailure();
		message.code = object.code ?? 0;
		message.error = object.error ?? undefined;
		return message;
	}
};

function createBaseLoginResponse_LoginError(): LoginResponse_LoginError {
	return { code: 0, message: '' };
}

export const LoginResponse_LoginError: MessageFns<LoginResponse_LoginError> = {
	encode(
		message: LoginResponse_LoginError,
		writer: BinaryWriter = new BinaryWriter()
	): BinaryWriter {
		if (message.code !== 0) {
			writer.uint32(8).int32(message.code);
		}
		if (message.message !== '') {
			writer.uint32(18).string(message.message);
		}
		return writer;
	},

	decode(input: BinaryReader | Uint8Array, length?: number): LoginResponse_LoginError {
		const reader = input instanceof BinaryReader ? input : new BinaryReader(input);
		let end = length === undefined ? reader.len : reader.pos + length;
		const message = createBaseLoginResponse_LoginError();
		while (reader.pos < end) {
			const tag = reader.uint32();
			switch (tag >>> 3) {
				case 1: {
					if (tag !== 8) {
						break;
					}

					message.code = reader.int32() as any;
					continue;
				}
				case 2: {
					if (tag !== 18) {
						break;
					}

					message.message = reader.string();
					continue;
				}
			}
			if ((tag & 7) === 4 || tag === 0) {
				break;
			}
			reader.skip(tag & 7);
		}
		return message;
	},

	fromJSON(object: any): LoginResponse_LoginError {
		return {
			code: isSet(object.code) ? loginResponse_LoginErrorCodeFromJSON(object.code) : 0,
			message: isSet(object.message) ? gt.String(object.message) : ''
		};
	},

	toJSON(message: LoginResponse_LoginError): unknown {
		const obj: any = {};
		if (message.code !== 0) {
			obj.code = loginResponse_LoginErrorCodeToJSON(message.code);
		}
		if (message.message !== '') {
			obj.message = message.message;
		}
		return obj;
	},

	create<I extends Exact<DeepPartial<LoginResponse_LoginError>, I>>(
		base?: I
	): LoginResponse_LoginError {
		return LoginResponse_LoginError.fromPartial(base ?? ({} as any));
	},
	fromPartial<I extends Exact<DeepPartial<LoginResponse_LoginError>, I>>(
		object: I
	): LoginResponse_LoginError {
		const message = createBaseLoginResponse_LoginError();
		message.code = object.code ?? 0;
		message.message = object.message ?? '';
		return message;
	}
};

export interface AuthService {
	CredentialsLogin(request: CredentialsLoginRequest): Promise<LoginResponse>;
}

export const AuthServiceServiceName = 'auth.AuthService';
export class AuthServiceClientImpl implements AuthService {
	private readonly rpc: Rpc;
	private readonly service: string;
	constructor(rpc: Rpc, opts?: { service?: string }) {
		this.service = opts?.service || AuthServiceServiceName;
		this.rpc = rpc;
		this.CredentialsLogin = this.CredentialsLogin.bind(this);
	}
	CredentialsLogin(request: CredentialsLoginRequest): Promise<LoginResponse> {
		const data = CredentialsLoginRequest.encode(request).finish();
		const promise = this.rpc.request(this.service, 'CredentialsLogin', data);
		return promise.then((data) => LoginResponse.decode(new BinaryReader(data)));
	}
}

interface Rpc {
	request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
}

declare const self: any | undefined;
declare const window: any | undefined;
declare const global: any | undefined;
const gt: any = (() => {
	if (typeof globalThis !== 'undefined') {
		return globalThis;
	}
	if (typeof self !== 'undefined') {
		return self;
	}
	if (typeof window !== 'undefined') {
		return window;
	}
	if (typeof global !== 'undefined') {
		return global;
	}
	throw 'Unable to locate global object';
})();

type Builtin = Date | Function | Uint8Array | string | number | boolean | bigint | undefined;

export type DeepPartial<T> = T extends Builtin
	? T
	: T extends globalThis.Array<infer U>
		? globalThis.Array<DeepPartial<U>>
		: T extends ReadonlyArray<infer U>
			? ReadonlyArray<DeepPartial<U>>
			: T extends { $case: string; value: unknown }
				? { $case: T['$case']; value?: DeepPartial<T['value']> }
				: T extends {}
					? { [K in keyof T]?: DeepPartial<T[K]> }
					: Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
	? P
	: P & { [K in keyof P]: Exact<P[K], I[K]> } & { [K in Exclude<keyof I, KeysOfUnion<P>>]: never };

function toTimestamp(date: Date): Timestamp {
	const seconds = BigInt(Math.trunc(date.getTime() / 1_000));
	const nanos = (date.getTime() % 1_000) * 1_000_000;
	return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
	let millis = (gt.Number(t.seconds.toString()) || 0) * 1_000;
	millis += (t.nanos || 0) / 1_000_000;
	return new gt.Date(millis);
}

function fromJsonTimestamp(o: any): Date {
	if (o instanceof gt.Date) {
		return o;
	} else if (typeof o === 'string') {
		return new gt.Date(o);
	} else {
		return fromTimestamp(Timestamp.fromJSON(o));
	}
}

function isSet(value: any): boolean {
	return value !== null && value !== undefined;
}

export interface MessageFns<T> {
	encode(message: T, writer?: BinaryWriter): BinaryWriter;
	decode(input: BinaryReader | Uint8Array, length?: number): T;
	fromJSON(object: any): T;
	toJSON(message: T): unknown;
	create<I extends Exact<DeepPartial<T>, I>>(base?: I): T;
	fromPartial<I extends Exact<DeepPartial<T>, I>>(object: I): T;
}
