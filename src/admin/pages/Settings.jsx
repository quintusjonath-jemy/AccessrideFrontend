import { Link } from "react-router-dom";
import { User, Lock, Bell, Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  const items = [
    {
      title: "Profile",
      description: "Manage administrator profile",
      icon: User,
      path: "/settings/profile",
    },
    {
      title: "Security",
      description: "Password and login settings",
      icon: Lock,
      path: "/settings/security",
    },
    {
      title: "Notifications",
      description: "Alert and notification preferences",
      icon: Bell,
      path: "/settings/notifications",
    },
    {
      title: "System",
      description: "Platform configuration",
      icon: SettingsIcon,
      path: "/settings/system",
    },
  ];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-6 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Settings
        </h1>

        <p className="text-gray-500 mt-2">
          Manage AccessRide platform settings and configurations
        </p>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-6">

        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              to={item.path}
              className="
                group
                bg-white/90
                border border-gray-100
                p-6
                rounded-3xl
                shadow-md
                hover:shadow-xl
                hover:-translate-y-1
                transition-all duration-300
                flex
                items-start
                gap-4
              "
            >
              {/* ICON */}
              <div className="p-3 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition">
                <Icon size={26} className="text-blue-600" />
              </div>

              {/* TEXT */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                  {item.title}
                </h2>

                <p className="text-gray-500 mt-1 text-sm leading-relaxed">
                  {item.description}
                </p>

                {/* subtle hint */}
                <p className="text-xs text-gray-400 mt-3 opacity-0 group-hover:opacity-100 transition">
                  Click to configure →
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Settings;