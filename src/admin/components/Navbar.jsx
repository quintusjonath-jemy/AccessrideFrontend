import { FaBell } from "react-icons/fa";
import axios from "axios";
import { useState, useEffect } from "react";
import LiveClock from "./LiveClock";

const Navbar = () => {
  const [admin, setAdmin] = useState({});

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
        </div>
      </div>
    </div>
  );
}

export default Navbar;
