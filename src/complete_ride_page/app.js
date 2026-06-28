document.addEventListener('DOMContentLoaded', () => {
    // 1. Tab Switching Logic
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Note: In a real app, this would also filter the content
            console.log(`Switched to tab: ${tab.textContent}`);
        });
    });

    // 2. Voice Booking Interaction
    const micButton = document.querySelector('.mic-button');
    const micShadow = document.querySelector('.mic-shadow');
    let isListening = false;

    if (micButton) {
        micButton.addEventListener('click', () => {
            isListening = !isListening;
            
            if (isListening) {
                // Add a pulsing effect to indicate listening
                micShadow.style.animation = 'pulse 1.5s infinite';
                micButton.style.transform = 'scale(1.05)';
                console.log('Voice recognition started...');
                
                // Simulate ending after 3 seconds
                setTimeout(() => {
                    isListening = false;
                    micShadow.style.animation = 'none';
                    micButton.style.transform = 'scale(1)';
                    alert("Voice command recorded! Searching for your next ride...");
                }, 3000);
            }
        });
    }

    // 3. Interactive Star Rating
    const stars = document.querySelectorAll('.star-rating i');
    const feedbackSection = document.querySelector('.feedback-section');

    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            // Update stars visually
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.remove('fa-regular');
                    s.classList.add('fa-solid');
                    s.style.color = '#ffb703';
                } else {
                    s.classList.remove('fa-solid');
                    s.classList.add('fa-regular');
                    s.style.color = '#cbd5e1';
                }
            });

            // Show a thank you message after a short delay
            setTimeout(() => {
                const ratingValue = index + 1;
                feedbackSection.innerHTML = `
                    <div style="padding: 10px 0; animation: fadeIn 0.5s;">
                        <i class="fa-solid fa-circle-check" style="color: #15803d; font-size: 32px; margin-bottom: 12px;"></i>
                        <h3 style="margin-bottom: 4px; font-weight: 700; color: var(--text-primary);">Thank You!</h3>
                        <p style="color: var(--text-secondary); font-size: 14px; font-weight: 500;">You rated Michael ${ratingValue} stars.</p>
                    </div>
                `;
            }, 500);
        });
    });

    // 4. Primary Button Action
    const doneButton = document.querySelector('.primary-btn');
    if (doneButton) {
        doneButton.addEventListener('click', () => {
            doneButton.textContent = 'Processing...';
            doneButton.style.opacity = '0.7';
            setTimeout(() => {
                alert("Redirecting to Home view...");
                doneButton.textContent = 'Done';
                doneButton.style.opacity = '1';
            }, 800);
        });
    }
});
