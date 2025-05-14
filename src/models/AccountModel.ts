class AccountModel {
    accountId: number;
    userId: number;
    username: string;
    password: string;
    fullName?: string;
    constructor(
    accountId: number,
    userId: number,
    username: string,
    password: string,
    fullName?: string
  ) {
    this.accountId = accountId;
    this.userId = userId;
    this.username = username;
    this.password = password;
    this.fullName = fullName;
  }
}
export default AccountModel;