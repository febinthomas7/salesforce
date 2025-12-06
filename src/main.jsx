import ReactDOM from "react-dom/client";
import { Suspense } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import "./index.css";
import FallBack from "./components/fallBack";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Suspense fallback={<FallBack />}>
      <RouterProvider router={router} />
  </Suspense>
);
