lucide.createIcons();

// Voice Speed Segment Control
const speedBtns = document.querySelectorAll('.speed-btn');
const activeSpeedClasses = ['bg-[#0d1b2a]', 'text-white', 'shadow'];
const inactiveSpeedClasses = ['text-slate-800'];

speedBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    speedBtns.forEach(b => {
      b.classList.remove(...activeSpeedClasses, 'active');
      b.classList.add(...inactiveSpeedClasses);
    });
    btn.classList.remove(...inactiveSpeedClasses);
    btn.classList.add(...activeSpeedClasses, 'active');
  });
});

// Action Buttons Logic
const allButtons = document.querySelectorAll('button');
allButtons.forEach(btn => {
  if (!btn.classList.contains('speed-btn') && !btn.closest('header')) {
    btn.addEventListener('click', () => {
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

// Toggles and Sliders
const checkboxes = document.querySelectorAll('input[type="checkbox"]');
checkboxes.forEach(cb => {
  cb.addEventListener('change', (e) => {
    const label = e.target.closest('.flex').querySelector('span').innerText;
    alert(label + (e.target.checked ? ' enabled' : ' disabled'));
  });
});

const range = document.querySelector('input[type="range"]');
if (range) {
  range.addEventListener('input', (e) => {
    const level = e.target.value;
    if (level === "1") {
      document.documentElement.style.fontSize = "14px"; // Small
    } else if (level === "2") {
      document.documentElement.style.fontSize = "16px"; // Normal
    } else if (level === "3") {
      document.documentElement.style.fontSize = "20px"; // Large
    }
  });
}
