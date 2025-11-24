document.addEventListener('DOMContentLoaded', function() {
    
    // Auto-open popup on page load
    document.getElementById('invitePopup').classList.add('visible');
    
    // Close profile box when clicking X
    document.getElementById('closeProfile').onclick = function(event) {
        event.stopPropagation();
        document.getElementById('profileBox').style.display = 'none';
    };
    
    document.getElementById('messengerIcon').onclick = function(event) {
        event.stopPropagation();
        document.getElementById('invitePopup').classList.add('visible');
    };

    document.getElementById('closePopup').onclick = function(event) {
        event.stopPropagation();
        document.getElementById('invitePopup').classList.remove('visible');
        document.getElementById('responseSection').style.display = 'none';
        document.getElementById('successMessage').style.display = 'none';
    };

    document.getElementById('closeExtra').onclick = function(event) {
    event.stopPropagation();
    document.getElementById('extraBox').style.display = 'none';
    };

    document.getElementById('submitRsvp').onclick = function(event) {
        event.stopPropagation();
        const name = document.getElementById('guestName').value.trim();
        const number = document.getElementById('guestNumber').value.trim();
        const email = document.getElementById('guestEmail').value.trim();
        const attending = document.querySelector('input[name="rsvpOption"]:checked').value;

        if (!name) {
            alert('Please enter your name');
            return;
        }

        if (!number) {
            alert('Please enter your phone number');
            return;
        }

        // Check for duplicate locally first
        let responses = JSON.parse(localStorage.getItem('gradRSVPs') || '[]');
        
        if (responses.some(r => r.name.toLowerCase() === name.toLowerCase())) {
            alert('You have already submitted an RSVP!');
            return;
        }

        const response = {
            name: name,
            number: number,
            email: email,
            attending: attending,
            timestamp: new Date().toISOString()
        };

        console.log('Sending data:', response);

// Send to Google Sheets
    fetch('https://script.google.com/macros/s/AKfycbxLjFiUk0EIUXdrs_NyuHQ11HHWgiTHOEwQPuljcWJFvntzbcuPvHZdsp6BgiIHoAU/exec', {
        redirect: "follow",
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(response)
    })
    .then(res => res.text())
    .then(result => {
        console.log('Fetch completed');
        console.log('Response:', result);
        
        // Save locally
        responses.push(response);
        localStorage.setItem('gradRSVPs', JSON.stringify(responses));
        
        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        setTimeout(() => {
            document.getElementById('successMessage').style.display = 'none';
        }, 3000);
    
        // Clear form
        document.getElementById('guestName').value = '';
        document.getElementById('guestNumber').value = '';
        document.getElementById('guestEmail').value = '';
        document.getElementById('attending').checked = true;
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('Error submitting RSVP. Please try again.');
    });
};
});


