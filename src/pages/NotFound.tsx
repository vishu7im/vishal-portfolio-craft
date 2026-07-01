import { Link, useLocation } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="text-center">
        <p className="eyebrow mb-3">404 · route not found</p>
        <h1 className="font-mono text-5xl font-bold tracking-tight">/{location.pathname.replace(/^\//, "")}</h1>
        <p className="mt-3 text-muted-foreground">This path isn't on the map.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Back to the world
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
