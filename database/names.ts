export enum RoleName {
    administrator = 'admin',
    technician = 'tech',
    guest = 'guest'
}

export interface Timespan {
    ts_id: number;
    start: Date;
    end: Date;
}

export interface User {
    user_id: number;
    username: string;
    password: string;
    role: RoleName;
    name: string;
}

export interface Role {
    role: RoleName;
    resource: string;
    action: string;
    attributes: string;
}

export interface Table {
    timespan: Timespan;
    users: User;
    roles: Role;
}