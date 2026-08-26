import {
  CloudOff,
  Home,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import './NotFoundPage.scss';

function NotFoundPage() {
  return (
    <main className="not-found-page">
      <section className="not-found-page__card">
        <span
          className="not-found-page__icon"
          aria-hidden="true"
        >
          <CloudOff />
        </span>

        <strong>404</strong>

        <h1>Không tìm thấy trang</h1>

        <p>
          Đường dẫn bạn truy cập không tồn tại
          hoặc đã được thay đổi.
        </p>

        <Link
          className="app-button app-button--primary"
          to="/"
        >
          <Home aria-hidden="true" />

          <span>Quay lại Dashboard</span>
        </Link>
      </section>
    </main>
  );
}

export default NotFoundPage;