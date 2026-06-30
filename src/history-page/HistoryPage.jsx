import React, { useState } from 'react';
import { 
  Menu, Bell, Mic, CheckCircle2, Accessibility, 
  RefreshCw, XCircle, Home, CalendarDays, User 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const HistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState('Completed');
  const [menuOpen, setMenuOpen] = useState(false);

  const filters = ['All', 'Upcoming', 'Completed', 'Cancelled'];

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="bg-slate-50 text-slate-800 m-0 p-0 flex justify-center min-h-screen font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen pb-[90px] relative flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-md sticky top-0 z-20 shadow-sm border-b border-slate-100">
          <button 
            className="text-[#0d1b2a] hover:bg-slate-100 p-2 rounded-full transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Side Menu Overlay */}
          <div className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}></div>
          
          {/* Side Menu */}
          <nav className={`fixed top-0 left-0 h-full w-[250px] bg-white z-50 transform transition-transform duration-300 ease-in-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl flex flex-col`}>
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-extrabold text-[#0d1b2a]">Menu</h2>
              <button onClick={() => setMenuOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><XCircle className="w-6 h-6 text-slate-500" /></button>
            </div>
            <ul className="p-4 flex flex-col gap-2">
              {['History', 'Profile', 'Ratings', 'Complaints', 'Settings'].map(item => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase()}`} className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors" onClick={() => setMenuOpen(false)}>
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <h1 className="text-xl font-extrabold text-[#0d1b2a] m-0 bg-clip-text text-transparent bg-gradient-to-r from-[#0d1b2a] to-[#1a365d]">AccessRide</h1>
          <button className="text-[#0d1b2a] hover:bg-slate-100 p-2 rounded-full transition-colors relative">
            <Bell className="w-6 h-6" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </header>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 sticky top-[68px] bg-white/90 backdrop-blur-md z-10 border-b border-slate-200 shadow-sm mb-4">
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => handleFilterClick(filter)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all duration-300 ${
                activeFilter === filter 
                  ? 'bg-gradient-to-r from-[#0d1b2a] to-[#1a365d] text-white shadow-lg shadow-blue-900/20 scale-105' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Voice Search FAB */}
        <div className="flex flex-col items-center mt-2 mb-6 px-4">
          <button 
            className="w-[85px] h-[85px] bg-gradient-to-br from-[#ffb703] to-[#ff9e00] rounded-full flex items-center justify-center shadow-[0_8px_25px_rgba(255,183,3,0.4)] hover:shadow-[0_12px_30px_rgba(255,183,3,0.6)] active:scale-95 transition-all duration-300 mb-3 border-none group"
            onClick={() => alert("Voice search activated. Listening...")}
          >
            <Mic className="w-8 h-8 text-[#0d1b2a] group-hover:scale-110 transition-transform duration-300" />
          </button>
          <span className="font-extrabold text-[#0d1b2a] text-[1.05rem] tracking-tight">Book new ride by voice</span>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 flex flex-col gap-6">
          
          {/* Date Section: Today */}
          <section className="animate-fade-in-up">
            <h2 className="font-extrabold text-[#0d1b2a] mb-4 text-[1.15rem] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ffb703]"></span> Today, June 24
            </h2>
            
            {/* Ride Card 1 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50 -z-10"></div>
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-5">
                <span className="bg-green-50 text-green-700 border border-green-200 text-[0.75rem] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
                <span className="text-slate-500 font-bold text-sm bg-slate-50 px-3 py-1 rounded-full">09:30 AM</span>
              </div>

              {/* Driver Info */}
              <div className="bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-xl p-3 flex items-center gap-4 mb-6 shadow-sm group-hover:border-slate-200 transition-colors">
                <div className="w-12 h-12 rounded-full border-2 border-white shadow-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0d1b2a] to-[#1a365d] flex items-center justify-center">
                   <div className="text-white font-bold text-lg">M</div>
                </div>
                <div className="flex-1">
                  <div className="font-extrabold text-[#0d1b2a] text-[1rem]">Michael C.</div>
                  <div className="flex items-center gap-1.5 text-[0.75rem] font-bold text-slate-500 mt-1 bg-slate-100 w-max px-2 py-0.5 rounded-md">
                    <Accessibility className="w-3.5 h-3.5 text-[#ffb703]" />
                    <span>Wheelchair Accessible</span>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="font-extrabold text-[#0d1b2a] text-sm">Honda Odyssey</div>
                  <div className="bg-[#0d1b2a] text-white text-[0.7rem] font-bold px-2 py-1 rounded mt-1 tracking-wider shadow-sm">ABC-123</div>
                </div>
              </div>

              {/* Route */}
              <div className="ml-2.5 relative border-l-2 border-dashed border-slate-200 pl-6 pb-2 flex flex-col gap-6 mb-6">
                {/* Start Location */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#10b981] rounded-full ring-4 ring-green-50 shadow-sm"></div>
                  <div className="font-extrabold text-[#0d1b2a] text-[1rem] leading-tight mb-1">123 Main St, Springfield</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Start Location</div>
                </div>
                {/* End Location */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#ef4444] rounded-full ring-4 ring-red-50 shadow-sm"></div>
                  <div className="font-extrabold text-[#0d1b2a] text-[1rem] leading-tight mb-1">General Hospital, West Wing</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drop-off</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.85rem] transition-colors whitespace-nowrap">
                  Need Help?
                </button>
                <button className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.85rem] transition-colors whitespace-nowrap">
                  Rate Driver
                </button>
                <button className="flex-[1.2] py-3 px-2 rounded-xl bg-gradient-to-r from-[#0d1b2a] to-[#1a365d] text-white font-extrabold text-[0.85rem] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all whitespace-nowrap">
                  <RefreshCw className="w-4 h-4" /> Rebook
                </button>
              </div>
            </div>
          </section>

          {/* Date Section: Yesterday */}
          <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="font-extrabold text-[#0d1b2a] mb-4 text-[1.15rem] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span> Yesterday, June 23
            </h2>
            
            {/* Ride Card 2 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-50 to-transparent rounded-bl-full opacity-50 -z-10"></div>
              
              {/* Card Header */}
              <div className="flex justify-between items-center mb-6">
                <span className="bg-red-50 text-red-700 border border-red-200 text-[0.75rem] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <XCircle className="w-4 h-4" /> Cancelled
                </span>
                <span className="text-slate-500 font-bold text-sm bg-slate-50 px-3 py-1 rounded-full">02:15 PM</span>
              </div>

              {/* Route */}
              <div className="ml-2.5 relative border-l-2 border-dashed border-slate-200 pl-6 pb-2 flex flex-col gap-6 mb-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-slate-300 rounded-full ring-4 ring-slate-50 shadow-sm"></div>
                  <div className="font-extrabold text-slate-500 text-[1rem] leading-tight mb-1 line-through decoration-slate-300">Oakwood Community Center</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Start Location</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-slate-300 rounded-full ring-4 ring-slate-50 shadow-sm"></div>
                  <div className="font-extrabold text-slate-500 text-[1rem] leading-tight mb-1 line-through decoration-slate-300">Springfield Mall</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drop-off</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.9rem] transition-colors">
                  Need Help?
                </button>
                <button className="flex-1 py-3 rounded-xl bg-slate-50 text-[#0d1b2a] border border-[#0d1b2a]/20 hover:bg-[#0d1b2a] hover:text-white font-extrabold text-[0.9rem] transition-all">
                  View Details
                </button>
              </div>
            </div>

            {/* Ride Card 3 */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300 mb-5 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-50 to-transparent rounded-bl-full opacity-50 -z-10"></div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="bg-green-50 text-green-700 border border-green-200 text-[0.75rem] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
                <span className="text-slate-500 font-bold text-sm bg-slate-50 px-3 py-1 rounded-full">10:00 AM</span>
              </div>

              <div className="ml-2.5 relative border-l-2 border-dashed border-slate-200 pl-6 pb-2 flex flex-col gap-6 mb-6">
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#10b981] rounded-full ring-4 ring-green-50 shadow-sm"></div>
                  <div className="font-extrabold text-[#0d1b2a] text-[1rem] leading-tight mb-1">Home</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Start Location</div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#ef4444] rounded-full ring-4 ring-red-50 shadow-sm"></div>
                  <div className="font-extrabold text-[#0d1b2a] text-[1rem] leading-tight mb-1">Physical Therapy Clinic</div>
                  <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">Drop-off</div>
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.85rem] transition-colors whitespace-nowrap">
                  Need Help?
                </button>
                <button className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-extrabold text-[0.85rem] transition-colors whitespace-nowrap">
                  Rate Driver
                </button>
                <button className="flex-[1.2] py-3 px-2 rounded-xl bg-gradient-to-r from-[#0d1b2a] to-[#1a365d] text-white font-extrabold text-[0.85rem] flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95 transition-all whitespace-nowrap">
                  <RefreshCw className="w-4 h-4" /> Rebook
                </button>
              </div>
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[75px] bg-white/90 backdrop-blur-md flex justify-around items-center rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] px-4 z-30 border-t border-slate-100">
          <Link to="/" className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl font-bold text-[0.75rem] text-slate-400 hover:text-[#0d1b2a] hover:bg-slate-50 transition-all">
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <Link to="/history" className="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-2xl font-bold text-[0.75rem] bg-gradient-to-r from-[#ffb703] to-[#ff9e00] text-[#0d1b2a] shadow-lg shadow-orange-500/20 -mt-6 border-4 border-white transition-transform hover:scale-105">
            <CalendarDays className="w-6 h-6" />
            <span>History</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1.5 py-2 px-6 rounded-2xl font-bold text-[0.75rem] text-slate-400 hover:text-[#0d1b2a] hover:bg-slate-50 transition-all">
            <User className="w-6 h-6" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
      
      {/* Hide scrollbar styles in global css (index.css) - assuming it's already configured or we just rely on tailwind standard scrollbar hiding plugin if available. We can add a custom style block here for the local scrollbar hiding if needed. */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HistoryPage;
