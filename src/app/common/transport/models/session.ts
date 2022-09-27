import {House} from "./house";

export interface Session {
    sessionId?: number;
    mac?: string;
    login?: string;
    ip?: string;
    vlan?: number;
    house?: House;
}
