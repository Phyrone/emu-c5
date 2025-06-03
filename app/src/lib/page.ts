import z from "zod";

export const PageId = z.enum([
    'home', 'profile'
])

export type PageId = z.infer<typeof PageId>;


export function get_page_id(
    route_id: string | null
): PageId | undefined {
    if (route_id === null) {
        return undefined;
    }


    return undefined;
}