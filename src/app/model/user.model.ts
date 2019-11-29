export interface User {
    uid?: string;
    email?: string;
    photoURL?: string;
    name?: string;
    birthday?: string;
}

export class UserFireDataModel {
    uid: string = null;
    name: string = null;
    email: string = null;
    idCompany: string = null;
}