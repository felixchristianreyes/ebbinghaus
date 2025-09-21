import { Outlet, Link } from "react-router";

const Layout = () => {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-content">
          <Link to="/" className="nav-logo">
            Ebbinghaus
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/">Decks</Link>
            </li>
            <li>
              <Link to="/study">Study</Link>
            </li>
          </ul>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
