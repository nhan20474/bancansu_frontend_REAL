import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import './StudentList.css';

interface Student {
  MaNguoiDung: number;
  HoTen: string;
  Email: string;
  SoDienThoai: string;
  VaiTro: string;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/students');
        setStudents(res.data);
      } catch (err: any) {
        setError('Không thể tải danh sách sinh viên.');
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  if (loading) return <div className="student-list-page">Đang tải danh sách sinh viên...</div>;
  if (error) return <div className="student-list-page" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="student-list-page">
      <h2>Danh sách sinh viên</h2>
      <table className="student-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Vai trò</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.MaNguoiDung}>
              <td>{student.MaNguoiDung}</td>
              <td>{student.HoTen}</td>
              <td>{student.Email}</td>
              <td>{student.SoDienThoai}</td>
              <td>{student.VaiTro}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
