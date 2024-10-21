export interface AuthRequestUser {
    type: 'reg',
    data: User | string,
    id: number
}

export interface UserResponse extends AuthRequestUser {
    data: UserInResponse | string
}

export interface User {
    name: string;
    password: string;
}

export interface UserInResponse extends User {
    error: boolean,
    errorText: string,
    index: number
}
