
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-profit-light">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold mb-6 text-profit-blue">404</h1>
        <p className="text-xl text-gray-600 mb-8">Страница не найдена</p>
        <p className="text-gray-500 mb-8">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <Button asChild>
          <Link to="/">
            Вернуться на главную
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
