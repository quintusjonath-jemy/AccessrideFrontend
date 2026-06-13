const WelcomeSection = ({ user }) => {
  const userName = user?.name ? `, ${user.name}` : "";
  return (
    <div className="px-5 mt-6">
      <h2 className="text-3xl font-extrabold text-[#0B2F89] tracking-tight">
        Welcome back{userName}
      </h2>

      <p className="text-gray-500 text-sm mt-1">How can we help you today?</p>
    </div>
  );
}

export default WelcomeSection;
