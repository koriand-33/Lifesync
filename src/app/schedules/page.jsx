import NavbarHome from "@/component/landing/NavbarHome";
import SchedulesPage from "@/component/schedules/SchedulesPage";

export default function Schedules() {
  return (
     <div className="p-2"> 
      <div className="pt-20 px-6">
        <NavbarHome/>
      </div>
      <SchedulesPage/>
    </div>
  );
}
