import React, {memo} from "react";
import Sidebar from "../pages/admin/Sidebar";
import Topbar from "../pages/admin/Topbar";

const AdminLayout = memo(({children}) => (
  <div className="flex h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 flex flex-col">
      <Topbar />
      {children}
    </div>
  </div>
));

export default AdminLayout;
