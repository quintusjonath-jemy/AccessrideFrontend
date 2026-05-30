import axios from "axios";
import { useEffect, useState } from "react";

function ProfileSettings() {

  const [admin, setAdmin] = useState({
    id: 1,
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost/admin/api/admin.php")

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

    try {

      await axios.put(
        "http://localhost/admin/api/admin.php",
        admin
      );

      alert("Profile Updated");

    } catch (error) {

      console.log(error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">

      <h1 className="text-2xl font-bold mb-6">
        Profile Settings
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          type="text"
          name="name"
          value={admin.name}
          onChange={handleChange}
          placeholder="Name"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="email"
          name="email"
          value={admin.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full border p-3 rounded-lg"
        />

        <input
          type="text"
          name="phone"
          value={admin.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full border p-3 rounded-lg"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-3 rounded-lg"
        >
          Save Changes
        </button>

      </form>

    </div>
  );
}

export default ProfileSettings;