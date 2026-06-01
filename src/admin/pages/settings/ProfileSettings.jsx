import axios from "axios";
import { useEffect, useState } from "react";

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

    const formData = new FormData();

    formData.append("id", admin.id);
    formData.append("name", admin.name);
    formData.append("email", admin.email);
    formData.append("phone", admin.phone);

    if (image) {
      formData.append("profile_image", image);
    }

    try {
      const res = await axios.post(
        "http://localhost/admin/api/admin.php?action=profile",
        formData,
      );

      console.log(res.data);
      alert("Profile updated successfully");
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <img
        src={
          image
            ? URL.createObjectURL(image)
            : admin.profile_image
              ? `http://localhost/admin/uploads/${admin.profile_image}`
              : "https://via.placeholder.com/150"
        }
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border"
      />
      <br />

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <input
          className="border p-3"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
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
