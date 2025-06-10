import {z} from 'zod';

export const SignInRequest = z.tuple([
    /**
     * Email or Username of the user
     */
    z.string(),
    z.string(),
    z.boolean()
]);
export type SignInRequest = z.infer<typeof SignInRequest>;

export const SignInResponse = z.union([
    z.tuple([]),
    z.tuple([
        z.string(), // email or username
        z.string(), // password
        z.boolean() // remember_me
    ])
])
export type SignInResponse = z.infer<typeof SignInResponse>;

export const WebAuthNChallengeResponse = z.tuple([z.string()])
export type WebAuthNChallengeResponse = z.infer<typeof WebAuthNChallengeResponse>;