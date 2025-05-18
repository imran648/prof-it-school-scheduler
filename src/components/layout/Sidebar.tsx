
import { NavLink } from 'react-router-dom';
import { 
  CalendarIcon, UsersIcon, UserIcon, BookOpenIcon, BookIcon, 
  LayoutIcon, DollarSignIcon
} from 'lucide-react';

const Sidebar = () => {
  // helper function for active route styling
  const getLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
      isActive
        ? 'bg-white text-profit-blue font-medium'
        : 'text-white hover:bg-white/10'
    }`;

  return (
    <aside className="bg-profit-blue w-60 min-h-screen p-4 flex flex-col">
      <div className="mb-8 px-4">
        <h2 className="text-white text-xl font-bold">Меню</h2>
      </div>
      
      <nav className="flex flex-col gap-1">
        <NavLink to="/" end className={getLinkClassName}>
          <CalendarIcon className="w-5 h-5" />
          <span>Расписание</span>
        </NavLink>
        
        <NavLink to="/groups" className={getLinkClassName}>
          <UsersIcon className="w-5 h-5" />
          <span>Группы</span>
        </NavLink>
        
        <NavLink to="/teachers" className={getLinkClassName}>
          <UserIcon className="w-5 h-5" />
          <span>Преподаватели</span>
        </NavLink>
        
        <NavLink to="/classrooms" className={getLinkClassName}>
          <LayoutIcon className="w-5 h-5" />
          <span>Кабинеты</span>
        </NavLink>
        
        <NavLink to="/teacher-journal" className={getLinkClassName}>
          <BookOpenIcon className="w-5 h-5" />
          <span>Журнал преподавателя</span>
        </NavLink>
        
        <NavLink to="/attendance" className={getLinkClassName}>
          <BookIcon className="w-5 h-5" />
          <span>Учет посещаемости</span>
        </NavLink>
        
        <NavLink to="/finances" className={getLinkClassName}>
          <DollarSignIcon className="w-5 h-5" />
          <span>Финансы</span>
        </NavLink>
      </nav>
      
      <div className="mt-auto text-center text-white/60 text-xs">
        <p>Prof-it © 2025</p>
        <p>Система управления IT школой</p>
      </div>
    </aside>
  );
};

export default Sidebar;
