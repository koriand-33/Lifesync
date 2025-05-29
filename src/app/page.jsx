import Principal from "@/component/landing/Principal";
import Navbar from "@/component/landing/Navbar";

export default function Home() {
  return (
     <div className="p-2"> 
     {/* NavBar */}

      <div className="flex mb-20">
        <Navbar/>
      </div>

      {/* parte principal de la landing */}
      <Principal/>


    </div>
  );
}
