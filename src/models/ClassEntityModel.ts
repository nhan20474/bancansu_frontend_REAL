import User from './UserModel';

class ClassEntityModel {
  public classId: number;
  public classCode: string;
  public className: string;
  public major: string;
  public course: string;
  public teacher?: User;
  public teacherName?: string;

  constructor(
    classId: number,
    classCode: string,
    className: string,
    major: string,
    course: string,
    teacherName?: string,
    teacher?: User
  ) {
    this.classId = classId;
    this.classCode = classCode;
    this.className = className;
    this.major = major;
    this.course = course;
    this.teacherName = teacherName;
    this.teacher = teacher;
  }
}

export default ClassEntityModel;
