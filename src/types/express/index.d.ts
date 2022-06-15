declare module Express {
  export interface Request {
    authClaims: IDecoded;
  }
}

interface IDecoded {
  userID: string
  createdAt?: string
  phoneNumber: string
}
