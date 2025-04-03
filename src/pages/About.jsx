import React, {useMemo} from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";

const aboutData = {
  appName: "Sdky Estate",
  companyName: "Sdky Estate Pvt Ltd",
  missionStatement:
    "We connect buyers, sellers, and renters with their dream properties through a seamless and transparent experience.",
  features: [
    "Comprehensive property listings with real-time updates.",
    "Advanced search filters for location, budget, and amenities.",
    "Secure and verified property transactions.",
    "AI-driven price estimation and market insights.",
    "24/7 customer support for buyers, sellers, and renters.",
  ],
  mission:
    "At Sdky Estate Pvt Ltd., we aim to redefine the real estate experience by providing cutting-edge digital solutions that simplify property transactions. We focus on transparency, innovation, and customer satisfaction.",
  teamDescription:
    "Our dedicated team of real estate experts, developers, and customer service professionals work tirelessly to bring you the best property solutions. We leverage technology to make buying, selling, and renting homes a hassle-free experience.",
};

const Section = ({title, children}) => (
  <section className="my-6 px-4 md:px-10">
    <h2 className="text-2xl font-semibold mb-3 text-center md:text-left">
      {title}
    </h2>
    <div className="text-center md:text-left">{children}</div>
  </section>
);

const About = () => {
  const mode = useSelector((state) => state.theme.mode);

  // Dynamic classes based on mode
  const containerTheme = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );

  return (
    <div className={`p-5 w-full max-w-5xl mx-auto pt-12 app ${containerTheme}`}>
      <h1 className="text-4xl font-bold text-center my-5">
        About {aboutData.appName}
      </h1>
      <p className="text-lg text-center px-4 md:px-10">
        Welcome to <span className="font-semibold">{aboutData.appName}</span>!{" "}
        {aboutData.missionStatement}
      </p>

      <Section title="Why Choose Us?">
        <ul className="list-disc list-inside space-y-2">
          {aboutData.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </Section>

      <Section title="Our Mission">
        <p>{aboutData.mission}</p>
      </Section>

      <Section title="Meet Our Team">
        <p>{aboutData.teamDescription}</p>
      </Section>

      <footer className="text-center mt-10 px-4 md:px-10">
        <p>
          Thank you for choosing{" "}
          <span className="font-semibold">{aboutData.appName}</span>. Have
          questions or looking for your dream home?{" "}
          <Link
            to="/contact"
            className="text-blue-600 underline hover:text-blue-800"
          >
            Contact us
          </Link>
          .
        </p>
      </footer>
    </div>
  );
};

export default About;
