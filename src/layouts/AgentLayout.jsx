import React, {memo} from "react";
import Topbar from "../pages/admin/Topbar";

const AgentLayout = memo(({children}) => (
  <div className="flex-1 flex flex-col">
    <Topbar />
    {children}
  </div>
));

export default AgentLayout;
