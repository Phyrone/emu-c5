import grpc from '@grpc/grpc-js';
import type { UnaryCallback } from '@grpc/grpc-js/build/src/client';
import { Observable } from 'rxjs';

type GrpcChannel = {
	request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
	clientStreamingRequest(
		service: string,
		method: string,
		data: Observable<Uint8Array>
	): Promise<Uint8Array>;
	serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
	bidirectionalStreamingRequest(
		service: string,
		method: string,
		data: Observable<Uint8Array>
	): Observable<Uint8Array>;
};

//Credits to https://github.com/stephenh/ts-proto/tree/main?tab=readme-ov-file#basic-grpc-implementation
export function wrapGrpcClient(grpc_client: grpc.Client): GrpcChannel {
	function pathify(service: string, method: string): string {
		// Conventionally in gRPC, the request path looks like
		//   "package.names.ServiceName/MethodName",
		// we therefore construct such a string
		return `/${service}/${method}`;
	}

	function passThrough(argument: any) {
		return argument;
	}

	const serialize = (d: Uint8Array<ArrayBufferLike>) => Buffer.from(d);

	return {
		async request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
			return new Promise((resolve, reject) => {
				const path = pathify(service, method);

				// Using passThrough as the deserialize functions
				grpc_client.makeUnaryRequest(path, serialize, passThrough, data, (err, res) => {
					if (err) {
						return reject(err);
					}
					resolve(res);
				});
			});
		},
		async clientStreamingRequest(
			service: string,
			method: string,
			data: Observable<Uint8Array>
		): Promise<Uint8Array> {
			const path = pathify(service, method);
			return new Promise((resolve, reject) => {
				const stream = grpc_client.makeClientStreamRequest(
					path,
					serialize,
					passThrough,
					(err, res) => {
						if (err) {
							subscription.unsubscribe(); // Ensure unsubscription on gRPC error
							return reject(err);
						}
						subscription.unsubscribe(); // Ensure unsubscription on gRPC success
						resolve(res);
					}
				);

				const subscription = data.subscribe({
					next: (chunk) => {
						if (!stream.writableEnded) {
							stream.write(chunk);
						}
					},
					error: (err) => {
						if (!stream.writableEnded) {
							stream.cancel(); // Or stream.destroy(err) depending on desired behavior
						}
						subscription.unsubscribe();
						reject(err); // Reject the promise if the observable errors
					},

					complete: () => {
						if (!stream.writableEnded) {
							stream.end(); // Signal that no more data will be sent
						}
						// Unsubscription will be handled by the 'close' or 'finish' event of the stream
					}
				});

				// It's also good practice to handle stream errors and status events
				stream.on('error', (err) => {
					// This event can be emitted if the server sends an error status mid-stream
					// or if there's a connection issue.
					subscription.unsubscribe();
					if (!stream.writableEnded) {
						stream.cancel();
					}
					reject(err);
				});

				// The 'finish' event is emitted after stream.end() has been called and all data has been flushed.
				// The 'close' event is emitted when the stream and any of its underlying resources have been closed.
				// For client streams, the callback to makeClientStreamRequest usually handles the final status.
				// However, ensuring unsubscription in 'close' is a good safeguard.
				stream.on('close', () => {
					subscription.unsubscribe();
				});
			});
		},
		serverStreamingRequest(
			service: string,
			method: string,
			data: Uint8Array
		): Observable<Uint8Array> {
			const path = pathify(service, method);
			return new Observable<Uint8Array>((subscriber) => {
				const stream = grpc_client.makeServerStreamRequest(path, serialize, passThrough, data);

				stream.on('data', (chunk: Uint8Array) => {
					subscriber.next(chunk);
				});

				stream.on('end', () => {
					subscriber.complete();
				});

				stream.on('error', (err: Error) => {
					subscriber.error(err);
				});

				// Cleanup when the observable is unsubscribed
				return () => {
					stream.cancel(); // Or stream.destroy() depending on desired behavior
				};
			});
		},
		bidirectionalStreamingRequest(
			service: string,
			method: string,
			data: Observable<Uint8Array>
		): Observable<Uint8Array> {
			const path = pathify(service, method);
			return new Observable<Uint8Array>((subscriber) => {
				const stream = grpc_client.makeBidiStreamRequest(path, serialize, passThrough);

				const inputSubscription = data.subscribe({
					next: (chunk) => {
						if (!stream.writableEnded) {
							stream.write(chunk);
						}
					},
					error: (err) => {
						// Propagate error to the output observable and cancel the stream
						subscriber.error(err);
						if (!stream.writableEnded) {
							stream.cancel();
						}
					},
					complete: () => {
						// Signal that the client is done sending data
						if (!stream.writableEnded) {
							stream.end();
						}
					}
				});

				stream.on('data', (chunk: Uint8Array) => {
					subscriber.next(chunk);
				});

				stream.on('end', () => {
					subscriber.complete();
				});

				stream.on('error', (err: Error) => {
					subscriber.error(err);
				});

				stream.on('status', (status) => {
					// gRPC stream can end with a status that is not an error
					// but might indicate the end of the stream from the server side.
					// We complete the subscriber here if it's not already completed or errored.
					if (status.code !== grpc.status.OK) {
						// Optionally, you could map gRPC statuses to errors
						// For now, we just complete if it's not OK, assuming 'end' or 'error' will handle other cases.
						// Or, if you want to treat non-OK statuses as errors:
						// const err = new Error(`gRPC stream ended with status: ${status.details || status.code}`);
						// (err as any).code = status.code;
						// (err as any).metadata = status.metadata;
						// subscriber.error(err);
					}
					if (!subscriber.closed) {
						subscriber.complete();
					}
				});

				// Cleanup when the output observable is unsubscribed
				return () => {
					inputSubscription.unsubscribe();
					if (!stream.writableEnded || !stream.readableEnded) {
						stream.cancel();
					}
				};
			});
		}
	} satisfies GrpcChannel;
}
