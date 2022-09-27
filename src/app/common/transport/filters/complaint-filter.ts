export interface ComplaintsFilter {
    login?: string;
    phone?: string;
    address?: number;
    mac?: string;
    ip?: string;
    start?: string;
    end?: string;
    first?: number;
    rows?: number;
    processed?: boolean;
}