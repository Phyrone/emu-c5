/**
 * REGEX for validating and parsing usernames both local and remote.
 * format <username> or <username>@<hostname>
 */
export const USERNAME_REGEX = /^(?<username>[a-zA-Z0-9_-]+)(?:@(?<hostname>[^@]+))?$/;

export function parse_user(user: string): { username: string; hostname?: string } | undefined {
	const match = USERNAME_REGEX.exec(user);
	if (!match) return undefined;

	const { username, hostname } = match.groups as { username: string; hostname?: string };
	return { email: username.toLowerCase(), hostname: hostname?.toLowerCase() };
}
