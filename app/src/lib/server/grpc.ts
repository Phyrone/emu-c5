import grpc from '@grpc/grpc-js';
import type { UnaryCallback } from '@grpc/grpc-js/build/src/client';
import { Observable } from 'rxjs';

type GrpcChannel = {
	request(service: string, method: string, data: Uint8Array): Promise<Uint8Array>;
	//clientStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Promise<Uint8Array>;
	//serverStreamingRequest(service: string, method: string, data: Uint8Array): Observable<Uint8Array>;
	//bidirectionalStreamingRequest(service: string, method: string, data: Observable<Uint8Array>): Observable<Uint8Array>;
};

//Credits to https://github.com/stephenh/ts-proto/tree/main?tab=readme-ov-file#basic-grpc-implementation
export function wrapGrpcClient(grpc_client: grpc.Client): GrpcChannel {
	return {
		async request(service: string, method: string, data: Uint8Array): Promise<Uint8Array> {
			// Conventionally in gRPC, the request path looks like
			//   "package.names.ServiceName/MethodName",
			// we therefore construct such a string
			const path = `/${service}/${method}`;

			return new Promise((resolve, reject) => {
				// makeUnaryRequest transmits the result (and error) with a callback
				// transform this into a promise!
				const resultCallback: UnaryCallback<any> = (err, res) => {
					if (err) {
						return reject(err);
					}
					resolve(res);
				};

				function passThrough(argument: any) {
					return argument;
				}

				// Using passThrough as the deserialize functions
				grpc_client.makeUnaryRequest(
					path,
					(d) => Buffer.from(d),
					passThrough,
					data,
					resultCallback
				);
			});
		}
	} satisfies GrpcChannel;
}
