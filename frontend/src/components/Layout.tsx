import { Outlet, NavLink, Link } from "react-router";
import { Button } from "@/components/ui/button";

const Layout = () => {
  return (
    <>
      <nav className="mx-5">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="text-base font-semibold">
            Ebbinghaus
          </Link>
          <div className="flex items-center gap-2">
            <NavLink to="/">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"}>Decks</Button>
              )}
            </NavLink>
            <NavLink to="/study">
              {({ isActive }) => (
                <Button variant={isActive ? "secondary" : "ghost"}>Study</Button>
              )}
            </NavLink>
          </div>
        </div>
      </nav>
      <div className="flex justify-center m-6">
        <main className="container">
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default Layout;
