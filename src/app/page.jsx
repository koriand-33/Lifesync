import Image from "next/image";

export default function Home() {
  return (
     <div className="p-2"> 
     {/* NavBar */}

      <div className="flex mb-32 md:mb-20">
        <Navbar/>
      </div>

      {/* parte principal de la landing */}
      <Principal/>


    </div>
  );
}
