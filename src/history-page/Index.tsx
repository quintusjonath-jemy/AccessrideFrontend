import { useState } from "react";
import { Link } from "react-router-dom";

type RideStatus = "completed" | "cancelled";
type FilterType = "Today" | "Week" | "All";

interface Ride {
  id: number;
  date: string;
  amount: string;
  status: RideStatus;
  pickup: string;
  drop: string;
}

const rides: Ride[] = [
  {
    id: 1,
    date: "Oct 24, 2:30 PM",
    amount: "LKR 244.00",
    status: "completed",
    pickup: "123 Central Library Square",
    drop: "Metropolitan Health Center",
  },
  {
    id: 2,
    date: "Oct 22, 10:15 AM",
    amount: "LKR 0.00",
    status: "cancelled",
    pickup: "Heritage Senior Living",
    drop: "Downtown Transit Center",
  },
  {
    id: 3,
    date: "Oct 26, 8:45 AM",
    amount: "LKR 184.60",
    status: "completed",
    pickup: "455 Riverside Park Dr",
    drop: "Veterans Affairs Office",
  },
  {
    id: 4,
    date: "Oct 18, 4:10 PM",
    amount: "LKR 250.00",
    status: "completed",
    pickup: "Metropolitan Health Center",
    drop: "123 Central Library Square",
  },
  {
    id: 5,
    date: "Oct 15, 11:39 AM",
    amount: "LKR 0.00",
    status: "cancelled",
    pickup: "Green Valley Grocery",
    drop: "Heritage Senior Living",
  },
];

const PickupIcon = () => (
  <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
    <path d="M8 10C8.55 10 9.02083 9.80417 9.4125 9.4125C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.4125C6.97917 9.80417 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7375 14 9.38333 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38333 2.49167 10.7375 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86667 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.741667 5.88333 0 8 0C10.1167 0 11.9792 0.741667 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86667 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" fill="#001142"/>
  </svg>
);

const DropIcon = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mt-0.5">
    <path d="M4 2H6V0H4V2ZM8 2V0H10V2H8ZM4 10V8H6V10H4ZM12 6V4H14V6H12ZM12 10V8H14V10H12ZM8 10V8H10V10H8ZM12 2V0H14V2H12ZM6 4V2H8V4H6ZM0 16V0H2V2H4V4H2V6H4V8H2V16H0ZM10 8V6H12V8H10ZM6 8V6H8V8H6ZM4 6V4H6V6H4ZM8 6V4H10V6H8ZM10 4V2H12V4H10Z" fill="#795900"/>
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

const HomeNavIcon = () => (
  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16H5V10H11V16H14V7L8 2.5L2 7V16ZM0 18V6L8 0L16 6V18H9V12H7V18H0Z" fill="#444651"/>
  </svg>
);

const ScheduleNavIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 12V10H14V12H4ZM4 16V14H11V16H4ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H3V0H5V2H13V0H15V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H2ZM2 18H16V8H2V18Z" fill="#6F5100"/>
  </svg>
);

const ProfileNavIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z" fill="#444651"/>
  </svg>
);

const VoiceWaveIcon = () => (
  <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 16V4H6V16H4ZM8 20V0H10V20H8ZM0 12V8H2V12H0ZM12 16V4H14V16H12ZM16 12V8H18V12H16Z" fill="#FFC329"/>
  </svg>
);

const MicrophoneIcon = () => (
  <svg width="47" height="64" viewBox="0 0 47 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.3333 40C20.5556 40 18.1944 39.0278 16.25 37.0833C14.3056 35.1389 13.3333 32.7778 13.3333 30V10C13.3333 7.22222 14.3056 4.86111 16.25 2.91667C18.1944 0.972222 20.5556 0 23.3333 0C26.1111 0 28.4722 0.972222 30.4167 2.91667C32.3611 4.86111 33.3333 7.22222 33.3333 10V30C33.3333 32.7778 32.3611 35.1389 30.4167 37.0833C28.4722 39.0278 26.1111 40 23.3333 40ZM20 63.3333V53.0833C14.2222 52.3056 9.44444 49.7222 5.66667 45.3333C1.88889 40.9444 0 35.8333 0 30H6.66667C6.66667 34.6111 8.29167 38.5417 11.5417 41.7917C14.7917 45.0417 18.7222 46.6667 23.3333 46.6667C27.9444 46.6667 31.875 45.0417 35.125 41.7917C38.375 38.5417 40 34.6111 40 30H46.6667C46.6667 35.8333 44.7778 40.9444 41 45.3333C37.2222 49.7222 32.4444 52.3056 26.6667 53.0833V63.3333H20Z" fill="#6F5100"/>
  </svg>
);

function RideCard({ ride }: { ride: Ride }) {
  const isCompleted = ride.status === "completed";

  return (
    <article
      className={[
        "flex flex-col gap-4 rounded-xl bg-white p-6",
        "shadow-card",
        isCompleted
          ? "border border-ar-blue border-l-[8px]"
          : "border border-ar-border-muted border-l-[8px] border-l-ar-border-muted",
      ].join(" ")}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-ar-muted-text font-semibold text-base leading-[1.2]">
            {ride.date}
          </span>
          <span className="text-ar-navy font-bold text-2xl leading-[1.3]">
            {ride.amount}
          </span>
        </div>

        {isCompleted ? (
          <span className="shrink-0 rounded-full bg-ar-gold px-4 py-1 text-ar-gold-dark font-semibold text-base leading-[1.2]">
            Completed
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-ar-cancelled-bg px-4 py-1 text-ar-cancelled-text font-semibold text-base leading-[1.2]">
            Cancelled
          </span>
        )}
      </div>

      {/* Location details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <PickupIcon />
          <div className="flex flex-col min-w-0">
            <span className="text-ar-muted-text font-semibold text-base leading-[1.2]">
              Pickup Location
            </span>
            <span className="text-ar-card-text font-bold text-xl leading-8">
              {ride.pickup}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <DropIcon />
          <div className="flex flex-col min-w-0">
            <span className="text-ar-muted-text font-semibold text-base leading-[1.2]">
              Drop Location
            </span>
            <span className="text-ar-card-text font-bold text-xl leading-8">
              {ride.drop}
            </span>
          </div>
        </div>
      </div>

      {/* View Details button */}
      {isCompleted ? (
        <button className="flex h-12 w-full items-center justify-center rounded-xl bg-ar-blue shadow-btn">
          <span className="text-ar-link-blue font-bold text-2xl leading-[1.3]">
            View Details
          </span>
        </button>
      ) : (
        <button className="flex h-12 w-full items-center justify-center rounded-xl border border-ar-border-muted bg-ar-btn-inactive">
          <span className="text-ar-navy font-bold text-2xl leading-[1.3]">
            View Details
          </span>
        </button>
      )}
    </article>
  );
}

export default function Index() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("Today");

  const filters: FilterType[] = ["Today", "Week", "All"];

  // Simple filtering logic based on the mocked rides list and selected tab
  const filteredRides = rides.filter((ride) => {
    if (activeFilter === "Today") {
      // Show Oct 26 (today) and Oct 24 (recent)
      return ride.id === 1 || ride.id === 3;
    } else if (activeFilter === "Week") {
      // Show within the last 7 days (Oct 26, Oct 24, Oct 22)
      return ride.id === 1 || ride.id === 2 || ride.id === 3;
    }
    return true; // "All"
  });

  return (
    <div className="flex h-screen flex-col bg-ar-bg overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 flex h-[45px] items-center justify-between bg-ar-bg px-5 shadow-nav-top">
        <div className="flex items-center gap-4">
          <button aria-label="Menu" className="flex items-center justify-center">
            <HamburgerIcon />
          </button>
          <span className="text-ar-navy font-extrabold text-2xl leading-[1.3]">
            AccessRide
          </span>
        </div>
        <button aria-label="Profile" className="flex items-center justify-center">
          <UserIcon />
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto pb-[120px]">
        <div className="mx-auto w-full max-w-[402px] px-[25px] pt-[38px]">

          {/* Page heading */}
          <h1 className="text-ar-navy font-extrabold text-[32px] leading-[1.2] mb-6">
            My Rides
          </h1>

          {/* Voice Feedback Area */}
          <div className="flex items-center gap-4 rounded-xl border-2 border-ar-blue bg-white p-6 shadow-card mb-6">
            <VoiceWaveIcon />
            <span className="text-ar-blue font-bold text-xl leading-8">
              Showing your recent rides
            </span>
          </div>

          {/* Filter Buttons */}
          <div className="flex items-center gap-2 mb-6">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={[
                  "flex-1 rounded-xl py-3 font-bold text-lg leading-[1.2] tracking-[0.02em] transition-colors",
                  activeFilter === filter
                    ? "bg-ar-navy text-white shadow-btn"
                    : "border border-ar-border-muted bg-ar-btn-inactive text-ar-muted-text shadow-sm",
                ].join(" ")}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Ride Cards */}
          <div className="flex flex-col gap-6 pb-8">
            {filteredRides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>

          {/* Voice Button Section */}
          <div className="flex flex-col items-center gap-4 py-4 pb-8">
            <button
              aria-label="Search rides by voice"
              className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-ar-bg bg-ar-gold shadow-voice-btn animate-pulse-ring"
            >
              <MicrophoneIcon />
            </button>
            <div className="rounded-full bg-ar-bg/80 backdrop-blur-sm px-6 py-2 shadow-sm">
              <span className="text-ar-navy font-bold text-2xl leading-[1.3]">
                Search rides by voice
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex min-h-[80px] items-center justify-around rounded-t-lg bg-ar-bg px-5 shadow-nav-bottom">
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-0.5 px-6 py-2"
        >
          <HomeNavIcon />
          <span className="text-ar-muted-text font-bold text-lg leading-[1.2] tracking-[0.02em]">
            Home
          </span>
        </Link>

        <Link
          to="/my-rides"
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-ar-gold px-6 py-2"
        >
          <ScheduleNavIcon />
          <span className="text-ar-gold-dark font-bold text-lg leading-[1.2] tracking-[0.02em]">
            Schedule
          </span>
        </Link>

        <Link
          to="/profile"
          className="flex flex-col items-center justify-center gap-0.5 px-6 py-2"
        >
          <ProfileNavIcon />
          <span className="text-ar-muted-text font-bold text-lg leading-[1.2] tracking-[0.02em]">
            Profile
          </span>
        </Link>
      </nav>
    </div>
  );
}
