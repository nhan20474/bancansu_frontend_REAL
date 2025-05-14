import User from './UserModel';

class ClassEntityModel {
  public classId: number;
  public className: string;
  public teacher: User;

  constructor(classId: number, className: string, teacher: User) {
    this.classId = classId;
    this.className = className;
    this.teacher = teacher;
  }
}
export default ClassEntityModel;
