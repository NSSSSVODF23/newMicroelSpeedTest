import {User} from "./user";
import {Session} from "./session";

export interface Complaint {
    complaintId?: number
    phone?: string
    description?: string
    created?: Date
    session?: Session
    processed?: User
    processedTime?: Date
}

export interface CreateComplaintBody {
    phone: string
    description: string
    captchaToken: string
}
