import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useSelector, useDispatch} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import Loading from "../Components/Loading";
import Logo from "/SdkyEstate-Icon.png";
import debounce from "lodash.debounce";
import {Link} from "react-router-dom";
import Card from "../Components/Card";

const Home = () => {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const [fallbackImage, setFallbackImage] = useState(Logo);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${host}/api/user`, {
        method: "GET",
        headers: {"Content-Type": "application/json"},
      });
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: error.message, type: "error"}));
    } finally {
      setLoading(false);
    }
  }, [host, dispatch]);

  // Fetch agents (debounced)
  const fetchAgents = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const res = await fetch(`${host}/api/user/agents`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (data.success) {
          setAgents(data?.agents);
        } else {
          dispatch(showAlert({message: data.message, type: "error"}));
        }
      } catch (error) {
        dispatch(showAlert({message: "Error fetching agents", type: "error"}));
      } finally {
        setLoading(false);
      }
    }, 500), // Debounce delay
    [host, dispatch]
  );

  useEffect(() => {
    fetchProperties();
    fetchAgents();
  }, [fetchProperties]);

  const imagePaths = useMemo(() => {
    const images = import.meta.glob(
      "../public/HomeBgImg/*.{png,jpg,jpeg,svg}",
      {eager: true}
    );
    return Object.keys(images).map((key) => images[key].default || key);
  }, []);

  useEffect(() => {
    const preloadNextImage = new Image();
    preloadNextImage.src =
      imagePaths[(currentIndex + 1) % imagePaths.length] || fallbackImage;
  }, [currentIndex, imagePaths]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % imagePaths.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [imagePaths.length]);

  useEffect(() => {
    const timeout = setTimeout(() => setFallbackImage(null), 3000);
    return () => clearTimeout(timeout);
  }, []);

  const themeClass = useMemo(
    () => ({
      container:
        mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
      card: mode === "light" ? "bg-white text-black" : "bg-gray-800 text-white",
      button:
        mode === "dark"
          ? "bg-gray-700 hover:bg-cyan-500"
          : "bg-blue-600 hover:bg-cyan-500",
    }),
    [mode]
  );

  return (
    <div className={`app ${themeClass.container} pt-12`}>
      <header
        className="bg-cover bg-center h-[570px] flex items-center justify-center"
        style={{
          backgroundImage: `url(${fallbackImage || imagePaths[currentIndex]})`,
          transition: "background-image 2s ease-in-out",
        }}
      >
        <div className="text-center max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Home</h1>
          <p className="text-lg mb-6">
            Discover the perfect property for you and your family.
          </p>
          <Link
            to="/properties"
            className={`px-6 py-3 rounded-lg uppercase app ${themeClass.button}`}
          >
            Browse Properties
          </Link>
        </div>
      </header>

      <section className="flex justify-center items-center flex-wrap gap-6 p-4">
        {loading ? (
          <Loading />
        ) : properties.length > 0 ? (
          properties.map((property) => (
            <Card
              key={property._id}
              property={property}
            />
          ))
        ) : (
          <p className="col-span-full text-center">No Properties available</p>
        )}
      </section>

      <FeaturedProperties theme={themeClass.card} />
      <Section title="Our Agents">
        {agents.map((agent) => (
          <InfoCard
            key={agent?._id}
            title={agent?.username}
            theme={themeClass.card}
            imgUrl={agent?.profileImage}
          />
        ))}
      </Section>
      <Section title="Our Services">
        {["Buy", "Sell", "Manage"].map((service, index) => (
          <InfoCard
            key={index}
            title={`${service} Property`}
            theme={themeClass.card}
          />
        ))}
      </Section>
      <Section title="Client Testimonials">
        {[1, 2, 3].map((testimonial) => (
          <InfoCard
            key={testimonial}
            title="- Jane Doe"
            description='"Amazing service. Highly recommend!"'
            theme={themeClass.card}
          />
        ))}
      </Section>

      <section className="py-10 bg-blue-600 text-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-lg mb-6">Contact us to get started today.</p>
          <Link
            to="/contact"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg uppercase hover:bg-gray-100"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeaturedProperties = ({theme}) => (
  <Section title="Featured Properties">
    {[1, 2, 3].map((property) => (
      <InfoCard
        key={property}
        title="Luxury Apartment"
        description="$500,000 - 3 Beds, 2 Baths"
        theme={theme}
        imgUrl={`https://example.com/property-${property}.jpg`}
      />
    ))}
  </Section>
);
const Section = ({title, children}) => (
  <section className="py-10">
    <div className="container mx-auto text-center">
      <h2 className="text-3xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{children}</div>
    </div>
  </section>
);
const InfoCard = ({title, description, theme, imgUrl}) => (
  <div className={`p-6 rounded-lg shadow-md app ${theme}`}>
    {imgUrl && (
      <img
        src={imgUrl}
        alt={title}
        className="w-full h-56 object-cover mb-4"
      />
    )}
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p>{description}</p>
  </div>
);

export default Home;
