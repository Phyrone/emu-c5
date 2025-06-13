import {z} from 'zod';

export const SignInRequest =  z.union([
    z.object({
        email: z.string(),
        username: z.string(),
        rememberMe: z.boolean(),
        otp: z.string().optional(),
    }),
    // tuple representation is much smaller
    z.tuple([
        // email or username
        z.string(),
        // password
        z.string(),
        // remember_me
        z.boolean(),
        // OTP
        z.string().optional()
    ])
])
export type SignInRequest = z.infer<typeof SignInRequest>;

export const SignInResponse = z.union([
    z.object({
        email: z.string(),
        username: z.string(),
        rememberMe: z.boolean(),
        otp: z.string().optional(),
    }),
    // tuple representation is much smaller
    z.tuple([
        // email or username
        z.string(),
        // password
        z.string(),
        // remember_me
        z.boolean(),
        // OTP
        z.string().optional()
    ])
])
export type SignInResponse = z.infer<typeof SignInResponse>;

export const WebAuthNChallengeResponse = z.tuple([z.string()])
export type WebAuthNChallengeResponse = z.infer<typeof WebAuthNChallengeResponse>;