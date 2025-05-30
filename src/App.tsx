
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import MainLayout from "./components/layout/MainLayout";
import Schedule from "./pages/Schedule";
import Groups from "./pages/Groups";
import Teachers from "./pages/Teachers";
import ClassRooms from "./pages/ClassRooms";
import TeacherJournal from "./pages/TeacherJournal";
import Attendance from "./pages/Attendance";
import Finances from "./pages/Finances";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Schedule />} />
              <Route path="groups" element={<Groups />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="classrooms" element={<ClassRooms />} />
              <Route path="teacher-journal" element={<TeacherJournal />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="finances" element={<Finances />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
