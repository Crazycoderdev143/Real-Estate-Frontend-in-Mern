import React, {useEffect, useState, useMemo, useCallback} from "react";
import {useSelector, useDispatch} from "react-redux";
import {showAlert} from "../Redux/slices/alertSlice";
import Loading from "../Components/Loading";
import debounce from "lodash.debounce";
import {FaStar} from "react-icons/fa";
import {Link} from "react-router-dom";
import Card from "../Components/Card";

const Home = () => {
  const mode = useSelector((state) => state.theme.mode);
  const dispatch = useDispatch();
  const host = import.meta.env.VITE_HOST || "http://localhost:8000";

  const [fallbackImage, setFallbackImage] = useState("/SdkyEstate-Icon.png");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [properties, setProperties] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState([]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${host}/api/user`, {
        method: "GET",
        credentials: "include", // important!
        headers: {"Content-Type": "application/json"},
      });
      const data = await res.json();
      if (data.success) {
        setProperties(data.properties);
      } else {
        dispatch(showAlert({message: data.message, type: "error"}));
      }
    } catch (error) {
      dispatch(showAlert({message: "Something went wrong!", type: "error"}));
    } finally {
      setLoading(false);
    }
  }, [host, dispatch]);

  const fetchAgents = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const res = await fetch(`${host}/api/user/agents`, {
          method: "GET",
          credentials: "include", // important!
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

  const fetchFeedbacks = useCallback(
    debounce(async () => {
      try {
        setLoading(true);
        const res = await fetch(`${host}/api/user/feedbacks`, {
          method: "GET",
          credentials: "include", // important!
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (data.success) {
          setFeedbacks(data?.feedbacks);
        } else {
          dispatch(showAlert({message: data.message, type: "error"}));
        }
      } catch (error) {
        dispatch(
          showAlert({message: "Error fetching feedbacks", type: "error"})
        );
      } finally {
        setLoading(false);
      }
    }, 500), // Debounce delay
    [host, dispatch]
  );

  useEffect(() => {
    fetchAgents();
    fetchFeedbacks();
    fetchProperties();
  }, [fetchAgents, fetchProperties, fetchFeedbacks]);

  const serviceData = [
    {
      title: "Buy Property",
      description:
        "Find your dream home with advanced search filters, verified listings, and expert support.",
    },
    {
      title: "Sell Property",
      description:
        "List your property easily, reach thousands of buyers, and get the best market value.",
    },
    {
      title: "Manage Property",
      description:
        "Professional property management services including maintenance, rent collection, and more.",
    },
  ];

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
      starActive: "text-yellow-400",
      starInactive: "text-gray-300",
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

      {/* Agent section  */}
      <Section title="Our Agents">
        {agents.map((agent) => (
          <InfoCard
            key={agent?._id}
            title={agent?.username}
            description={agent?.email}
            theme={themeClass.card}
            imgUrl={agent?.profileImage}
          />
        ))}
      </Section>

      {/* Services section  */}
      <Section title="Our Services">
        {serviceData.map((service, index) => (
          <ServicesCard
            key={index}
            title={service.title}
            description={service.description}
            theme={themeClass.card}
          />
        ))}
      </Section>

      {/* Client feedbacks section  */}
      <Section title="Client Testimonials">
        {feedbacks.map((feedback) => (
          <InfoCard
            key={feedback?._id}
            imgUrl={feedback?.imgUrl}
            username={feedback?.username}
            title={
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <FaStar
                    key={index}
                    className={`text-xl ${
                      index < feedback.rating
                        ? themeClass.starActive
                        : themeClass.starInactive
                    }`}
                  />
                ))}
              </div>
            }
            description={feedback?.comment}
            theme={themeClass.card}
          />
        ))}
      </Section>

      <section className="py-10 bg-blue-800 text-gray-800">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-lg mb-6">Contact us to get started today.</p>
          <Link
            to="/contact"
            className="bg-gray-300 text-blue-600 px-6 py-3 rounded-lg uppercase hover:bg-gray-100"
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
        imgUrl={"/SdkyEstate-Icon.png"}
      />
    ))}
  </Section>
);

const Section = ({title, children, theme}) => (
  <section className="py-10 px-4">
    <div className="max-w-7xl mx-auto text-center">
      {title && (
        <h2 className={`text-3xl font-semibold mb-8 app ${theme}`}>{title}</h2>
      )}

      <div className="flex flex-wrap justify-center gap-6">
        {React.Children.map(children, (child) => (
          <div className="w-full sm:w-[45%] lg:w-[30%]">{child}</div>
        ))}
      </div>
    </div>
  </section>
);

const InfoCard = ({title, description, username, theme, imgUrl}) => {
  return (
    <div
      className={`relative rounded-2xl shadow-lg overflow-hidden transition duration-300 app ${theme} h-72 md:h-80`}
    >
      {/* Background Image */}
      {imgUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{backgroundImage: `url(${imgUrl})`}}
        />
      )}

      {/* Gradient Overlay */}
      {imgUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent" />
      )}

      {/* Content */}
      <div className="relative p-6 z-10 h-full flex flex-col justify-end">
        <h2 className="text-lg font-semibold mb-1 opacity-90">{username}</h2>
        <h3 className="text-2xl font-bold mb-2 flex justify-center">{title}</h3>
        <p className="text-sm md:text-base italic opacity-90">
          {description ? `"${description}"` : ""}
        </p>
      </div>
    </div>
  );
};

const ServicesCard = ({title, description, theme}) => {
  return (
    <div
      className={`rounded-xl shadow-md p-6 transition-all duration-300 ${theme}`}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
};

export default Home;
