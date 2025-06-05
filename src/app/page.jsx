import Principal from "@/component/landing/Principal";
import Navbar from "@/component/landing/Navbar";
import CardInfo from "@/component/landing/cardInfo";
import MoreAbout from "@/component/landing/moreAbout";
import MoreAbout2 from "@/component/landing/moreAbout2";
import Experiencias from "@/component/landing/Experiencias";
import FAQ from "@/component/landing/FAQ";
import Footer from "@/component/landing/footer";

export default function Home() {
  return (
     <div className="p-2"> 
     {/* NavBar */}

      <div className="flex mb-32 md:mb-5">
        <Navbar/>
      </div>

      {/* parte principal de la landing */}
      <Principal/>
      <CardInfo/>
      <MoreAbout/>
      <MoreAbout2/>
      <Experiencias/>
      <FAQ/>
      {/* Footer */}
      <Footer/>

    </div>
  );
}
