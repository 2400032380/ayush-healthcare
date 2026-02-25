import { Outlet, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const { role } = useParams();

  return (
    <div className="dashboard-layout">
      <Sidebar role={role} />
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
