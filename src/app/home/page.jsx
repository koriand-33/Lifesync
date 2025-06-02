import NavbarHome from "@/component/landing/NavbarHome";
import HomePage from "@/component/home/HomePage";

export default function Home() {
  return (
     <div className="p-2"> 
     {/* NavBar */}

      <div className="pt-20 px-6">
        <NavbarHome/>
      </div>
      
      <HomePage/>

    </div>
  );
}
