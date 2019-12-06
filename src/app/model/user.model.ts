export interface User {
    uid?: string;
    email?: string;
    photoURL?: string;
    name?: string;
    birthday?: string;
    firstName?: string;
    birthDate?: string;
    password?: string;
    field?: string;
    group?: string;
    whatsappNumber?: string;
}

export class UserFireDataModel {
    uid: string = null;
    name: string = null;
    email: string = null;
    idCompany: string = null;
}