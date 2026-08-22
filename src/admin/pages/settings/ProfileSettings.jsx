import axios from "axios";
import { useEffect, useState } from "react";
import API_BASE from "../../../config/api";

const ProfileSettings = () => {
  const [admin, setAdmin] = useState({
    id: 1,
    name: "",
    email: "",
    phone: "",
  });

  const [image, setImage] = useState(null);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_BASE}/admin/api/admin.php`)

      .then((res) => {
        setAdmin(res.data);
        setLoading(false);
      })

      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setAdmin({
      ...admin,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("id", admin.id);
    formData.append("name", admin.name);
    formData.append("email", admin.email);
    formData.append("phone", admin.phone);

    if (image) {
      formData.append("profile_image", image);
    } else if (admin.profile_image) {
      formData.append("profile_image", admin.profile_image);
    }

    try {
      const res = await axios.post(
        `${API_BASE}/admin/api/admin.php?action=profile`,
        formData,
      );

      console.log(res.data);
      alert("Profile updated successfully");
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-lg">
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-blue-100 mt-2">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border dark:border-slate-700 transition-colors">
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={
                  image
                    ? URL.createObjectURL(image)
                    : admin.profile_image
                      ? `${API_BASE}/admin/uploads/${admin.profile_image}`
                      : "https://via.placeholder.com/200"
                }
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-100 dark:border-slate-700 shadow-lg"
              />

              <label className="absolute bottom-2 right-2 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700">
                ✎
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <h2 className="text-2xl font-bold mt-5 text-gray-800 dark:text-slate-100">
              {admin.name}
            </h2>

            <p className="text-gray-500 dark:text-slate-400">System Administrator</p>

            <div className="w-full mt-6 space-y-4">
              <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl transition-colors">
                <p className="text-sm text-gray-500 dark:text-slate-400">Email</p>

                <p className="font-medium text-gray-800 dark:text-slate-200">{admin.email}</p>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl transition-colors">
                <p className="text-sm text-gray-500 dark:text-slate-400">Phone</p>

                <p className="font-medium text-gray-800 dark:text-slate-200">{admin.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 border dark:border-slate-700 transition-colors">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6">
            Account Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600 dark:text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={admin.name || ""}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600 dark:text-slate-300">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={admin.email || ""}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-600 dark:text-slate-300">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={admin.phone || ""}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
