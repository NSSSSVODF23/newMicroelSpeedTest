import { RoleGroup } from "./role";

export interface User {
	userId?: number;
	username?: String;
	password?: String;
	role?: RoleGroup;
	name?: String;
	created?: String;
	lastLogin?: String;
	avatar?: number[] | ArrayBuffer | Uint8Array;
}
