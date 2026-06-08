lucide.createIcons();

// Filter Buttons Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const inactiveClasses = ['bg-white', 'border', 'border-slate-300', 'text-slate-700'];
const activeClasses = ['bg-[#0d1b2a]', 'text-white', 'shadow-md'];

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active state from all
    filterBtns.forEach(b => {
      b.classList.remove(...activeClasses, 'active');
      b.classList.add(...inactiveClasses);
    });
    // Add active state to clicked
    btn.classList.remove(...inactiveClasses);
    btn.classList.add(...activeClasses, 'active');
  });
});

// Action Buttons Logic
const allButtons = document.querySelectorAll('button');
allButtons.forEach(btn => {
  if (!btn.classList.contains('filter-btn') && !btn.closest('header')) {
    btn.addEventListener('click', (e) => {
      let text = btn.innerText.trim();
      if (btn.querySelector('i[data-lucide="mic"]')) {
        text = "Voice search activated. Listening...";
      }
      if (text) {
        alert('Action: ' + text);
      }
    });
  }
});
