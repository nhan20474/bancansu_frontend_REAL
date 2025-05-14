class UserModel {
  public userId: number;
  public studentId: string;
  public fullName: string;
  public email: string;
  public role: 'Student' | 'ClassLeader' | 'Teacher' | 'Guest';
  public createdAt: string;

  constructor(
    userId: number,
    studentId: string,
    fullName: string,
    email: string,
    role: 'Student' | 'ClassLeader' | 'Teacher' | 'Guest',
    createdAt: string
  ) {
    this.userId = userId;
    this.studentId = studentId;
    this.fullName = fullName;
    this.email = email;
    this.role = role;
    this.createdAt = createdAt;
  }
}
export default UserModel;
