import { FaBell } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import LiveClock from "./LiveClock";

const Navbar = () => {
  const [admin, setAdmin] = useState({});
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")
      .then((res) => {
        setAdmin(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="bg-white shadow-sm p-4 flex justify-between items-center">
      <input
        type="text"
        placeholder="Search..."
        className="bg-gray-100 px-4 py-2 rounded-lg outline-none w-80"
      />

      <div className="flex items-center gap-5">
        <FaBell className="text-xl cursor-pointer" />

        <div className="flex items-center gap-2">
          <LiveClock />
          <div className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-xl transition">
            <img
              src={
                admin.profile_image
                  ? `http://localhost/admin/uploads/${admin.profile_image}`
                  : "https://via.placeholder.com/150"
              }
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
            />

            <div>
              <h4 className="font-semibold text-gray-800">{admin.name}</h4>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setOpenMenu(!openMenu)}
                className="flex items-center gap-3"
              >
                ...
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-50">
                  <Link
                    to="/settings/profile"
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    Profile
                  </Link>

                  <Link
                    to="/settings"
                    className="block px-4 py-3 hover:bg-gray-50"
                  >
                    Settings
                  </Link>

                  <button className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>  
        </div>
      </div>
    </div>
  );
};

export default Navbar;
