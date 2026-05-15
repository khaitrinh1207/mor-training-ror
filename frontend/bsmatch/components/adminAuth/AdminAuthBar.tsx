import { adminSignInPath, adminSignUpPath } from '../../configs/api';
import type { AdminSession } from '../../repositories/adminAuthRepository';

export interface AdminAuthBarProps {
  admin: AdminSession | null;
  isLoading: boolean;
  isLoggingOut: boolean;
  onLogout(): void;
}

export const AdminAuthBar = ({ admin, isLoading, isLoggingOut, onLogout }: AdminAuthBarProps): JSX.Element => {
  return (
    <nav aria-label="Admin authentication" className="admin-auth-bar">
      <div>
        <span className="admin-auth-bar__eyebrow">Admin session</span>
        <strong>{admin ? admin.email : 'Chưa đăng nhập'}</strong>
      </div>

      <div className="admin-auth-bar__actions">
        {isLoading ? <span>Đang kiểm tra đăng nhập...</span> : null}
        {admin ? (
          <button disabled={isLoggingOut} onClick={onLogout} type="button">
            {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
          </button>
        ) : (
          <>
            <a href={adminSignInPath}>Đăng nhập</a>
            <a href={adminSignUpPath}>Đăng ký</a>
          </>
        )}
      </div>
    </nav>
  );
};
