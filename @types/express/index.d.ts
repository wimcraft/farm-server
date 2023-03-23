declare namespace Express {
    export interface Request {
        user?:import ('../../src/modules/users/entities/user.entity').IUser
    }
}