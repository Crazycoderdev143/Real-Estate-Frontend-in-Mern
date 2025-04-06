import * as Icons from "react-icons/fa";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {useMemo} from "react";

const Footer = () => {
  const mode = useSelector((state) => state.theme.mode);

  // Memoized styles to optimize performance and avoid unnecessary recalculations
  const containerClass = useMemo(
    () =>
      mode === "light" ? "bg-gray-100 text-black" : "bg-gray-900 text-white",
    [mode]
  );
  const iconClass = useMemo(
    () =>
      mode === "light"
        ? "text-gray-600 hover:text-gray-900"
        : "text-gray-300 hover:text-white",
    [mode]
  );

  // Social media links (Array for easy maintainability)
  const socialLinks = [
    {
      icon: <Icons.FaFacebook size={24} />,
      href: "https://facebook.com",
      label: "Facebook",
    },
    {
      icon: <Icons.FaTwitter size={24} />,
      href: "https://twitter.com",
      label: "Twitter",
    },
    {
      icon: <Icons.FaInstagram size={24} />,
      href: "https://instagram.com",
      label: "Instagram",
    },
    {
      icon: <Icons.FaLinkedin size={24} />,
      href: "https://linkedin.com",
      label: "LinkedIn",
    },
  ];

  return (
    <footer className={`${containerClass} app py-3 pt-32 mt-10 shadow-md`}>
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        {/* Logo and Branding */}
        <div>
          <h1 className="font-bold text-2xl flex justify-center md:justify-start items-center">
            <img
              src={"/SdkyEstate-Icon.png"}
              alt="Logo"
              style={{height: "50px", width: "auto"}}
            />

            <div>
              <span className="text-slate-600">Sdky</span>
              <span className="text-cyan-500">Estate</span>
            </div>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Your trusted real estate partner.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Quick Links</h2>
          <ul className="space-y-2">
            {["Home", "About", "Contact"].map((link, index) => (
              <li key={index}>
                <Link
                  to={`/${link.toLowerCase()}`}
                  className="hover:underline"
                >
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h2 className="font-semibold text-lg mb-2">Follow Us</h2>
          <div className="flex justify-center md:justify-start gap-4">
            {socialLinks.map(({icon, href, label}, index) => (
              <a
                key={index}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconClass} app`}
                aria-label={label} // Improves accessibility
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-500 text-sm mt-6 border-t pt-4">
        &copy; {new Date().getFullYear()} SdkyEstate. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
