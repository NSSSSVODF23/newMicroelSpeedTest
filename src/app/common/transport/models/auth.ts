export interface AuthRequest {
	username: string;
	password: string;
}

export interface AuthResponse {
	type: string;
	token: string;
	refreshToken: string;
}
