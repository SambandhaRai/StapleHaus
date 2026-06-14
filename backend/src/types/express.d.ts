import { UserRoleType } from "./user.type";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: UserRoleType;
            };
        }
    }
}

export { };
