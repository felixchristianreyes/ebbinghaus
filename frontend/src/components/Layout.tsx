import { Outlet, Link } from "react-router";
import { Button } from "@/components/ui/button";

const Layout = () => {
  return (
    <div>
      <nav className="mx-5">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="text-base font-semibold">
            Ebbinghaus
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost">Decks</Button>
            </Link>
            <Link to="/study">
              <Button>Study</Button>
            </Link>
          </div>
        </div>
      </nav>
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
