export class QueryLimit {
    offset = 0;
    limit = 1;

    static of(offset: string | number, limit: string | number) {
        const queryLimit = new QueryLimit();
        queryLimit.setOffset(offset);
        queryLimit.setLimit(limit);
        return queryLimit;
    }

    setOffset(v: string | number) {
        if (typeof v === "string") {
            this.offset = parseInt(v);
        } else {
            this.offset = v;
        }
    }

    setLimit(v: string | number) {
        if (typeof v === "string") {
            this.limit = parseInt(v);
        } else {
            this.limit = v;
        }
    }
}