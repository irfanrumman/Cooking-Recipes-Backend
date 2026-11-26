export interface ILoginUser {
    email: string;
    password: string;
}

export interface IVerifyEmailPayload {
    email: string;
    otp: string;
}