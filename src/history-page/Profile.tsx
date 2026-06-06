import { Link } from "react-router-dom";

const HomeNavIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16H5V10H11V16H14V7L8 2.5L2 7V16ZM0 18V6L8 0L16 6V18H9V12H7V18H0Z" fill="#444651"/>
  </svg>
);

const ScheduleNavIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12V10H14V12H4ZM4 16V14H11V16H4ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18Z" fill="#444651"/>
  </svg>
);

const ProfileNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#6F5100"/>
  </svg>
);

const HamburgerIcon = () => (
  <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 12V10H18V12H0ZM0 7V5H18V7H0ZM0 2V0H18V2H0Z" fill="#001142"/>
  </svg>
);

const UserIcon = () => (
  <svg width="40" height="41" viewBox="0 0 40 41" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.7 30.2C9.4 28.9 11.3 27.875 13.4 27.125C15.5 26.375 17.7 26 20 26C22.3 26 24.5 26.375 26.6 27.125C28.7 27.875 30.6 28.9 32.3 30.2C33.4667 28.8333 34.375 27.2833 35.025 25.55C35.675 23.8167 36 21.9667 36 20C36 15.5667 34.4417 11.7917 31.325 8.675C28.2083 5.55833 24.4333 4 20 4C15.5667 4 11.7917 5.55833 8.675 8.675C5.55833 11.7917 4 15.5667 4 20C4 21.9667 4.325 23.8167 4.975 25.55C5.625 27.2833 6.53333 28.8333 7.7 30.2ZM20 22C18.0333 22 16.375 21.325 15.025 19.975C13.675 18.625 13 16.9667 13 15C13 13.0333 13.675 11.375 15.025 10.025C16.375 8.675 18.0333 8 20 8C21.9667 8 23.625 8.675 24.975 10.025C26.325 11.375 27 13.0333 27 15C27 16.9667 26.325 18.625 24.975 19.975C23.625 21.325 21.9667 22 20 22ZM20 40C17.2333 40 14.6333 39.475 12.2 38.425C9.76667 37.375 7.65 35.95 5.85 34.15C4.05 32.35 2.625 30.2333 1.575 27.8C0.525 25.3667 0 22.7667 0 20C0 17.2333 0.525 14.6333 1.575 12.2C2.625 9.76667 4.05 7.65 5.85 5.85C7.65 4.05 9.76667 2.625 12.2 1.575C14.6333 0.525 17.2333 0 20 0C22.7667 0 25.3667 0.525 27.8 1.575C30.2333 2.625 32.35 4.05 34.15 5.85C35.95 7.65 37.375 9.76667 38.425 12.2C39.475 14.6333 40 17.2333 40 20C40 22.7667 39.475 25.3667 38.425 27.8C37.375 30.2333 35.95 32.35 34.15 34.15C32.35 35.95 30.2333 37.375 27.8 38.425C25.3667 39.475 22.7667 40 20 40Z" fill="#001142"/>
  </svg>
);

export default function Profile() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FCF9F8]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-[45px] items-center justify-between bg-[#FCF9F8] px-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-4">
          <button aria-label="Menu" className="flex items-center justify-center">
            <HamburgerIcon />
          </button>
          <span className="text-[#001142] font-extrabold text-2xl leading-[1.3]">
            AccessRide
          </span>
        </div>
        <button aria-label="Profile" className="flex items-center justify-center">
          <UserIcon />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pb-[82px] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#00236F] flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0Z" fill="white"/>
          </svg>
        </div>
        <h2 className="text-[#001142] font-extrabold text-2xl mb-3">Profile</h2>
        <p className="text-[#444651] text-lg leading-relaxed max-w-xs">
          Profile page coming soon. Keep prompting to fill in this page's content!
        </p>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex min-h-[80px] items-center justify-around rounded-t-lg bg-[#FCF9F8] px-5 shadow-[0_-4px_20px_0_rgba(0,35,111,0.08)]">
        <Link to="/" className="flex flex-col items-center justify-center gap-0.5 px-6 py-2">
          <HomeNavIcon />
          <span className="text-[#444651] font-bold text-lg leading-[1.2] tracking-[0.02em]">Home</span>
        </Link>
        <Link to="/my-rides" className="flex flex-col items-center justify-center gap-0.5 px-6 py-2">
          <ScheduleNavIcon />
          <span className="text-[#444651] font-bold text-lg leading-[1.2] tracking-[0.02em]">Schedule</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-[#FFC329] px-6 py-2">
          <ProfileNavIcon />
          <span className="text-[#6F5100] font-bold text-lg leading-[1.2] tracking-[0.02em]">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
