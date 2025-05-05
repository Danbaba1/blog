declare namespace Express {
    export interface Request {
        user?: {
            id: number;
            name?: string;
            username?: string;
            email?: string;
        };
    }
}