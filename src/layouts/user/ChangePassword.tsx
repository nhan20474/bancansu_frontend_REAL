import React from 'react';
import ChangePasswordForm from './ChangePasswordForm';

const ChangePassword: React.FC = () => {
  return (
    <div className="change-password-page">
      <h2>Đổi mật khẩu</h2>
      <ChangePasswordForm />
    </div>
  );
};

export default ChangePassword;
