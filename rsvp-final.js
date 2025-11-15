document.addEventListener('DOMContentLoaded', function() {
    const ADMIN_PASSWORD = "ADMINPass_2025";
    
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

        // Send to Google Sheets - UPDATE THIS URL WITH YOUR NEW DEPLOYMENT
        fetch('https://script.google.com/macros/s/AKfycbwZxYu1sjFo5HabnNE5CN8OAUXtHUscq-Vtmq7Lq_AWfRG7OPeGooLIdm4eDCvbpfe0/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(response)
        })
        .then(() => {
            console.log('Fetch completed');
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

    // PASSWORD-PROTECTED VIEW RESPONSES
    document.getElementById('viewResponses').onclick = function(event) {
        event.stopPropagation();
        
        const password = prompt('Enter admin password to view responses:');
        
        if (password === ADMIN_PASSWORD) {
            loadResponses();
            const responseSection = document.getElementById('responseSection');
            if (responseSection.style.display === 'none') {
                responseSection.style.display = 'block';
            } else {
                responseSection.style.display = 'none';
            }
        } else if (password !== null) {
            alert('Incorrect password!');
        }
    };

    function loadResponses() {
        const responses = JSON.parse(localStorage.getItem('gradRSVPs') || '[]');

        const attendingCount = responses.filter(r => r.attending === 'yes').length;
        const notAttendingCount = responses.filter(r => r.attending === 'no').length;

        document.getElementById('attendingCount').textContent = attendingCount;
        document.getElementById('notAttendingCount').textContent = notAttendingCount;

        const responseList = document.getElementById('responseList');
        responseList.innerHTML = '';

        if (responses.length === 0) {
            responseList.innerHTML = '<p style="text-align: center; color: #666;">No RSVPs yet</p>';
        } else {
            responses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const recentResponses = responses.slice(0, 10);

            recentResponses.forEach(response => {
                const item = document.createElement('div');
                item.className = 'responseItem';
                const statusText = response.attending === 'yes' ? '✓ Attending' : '✗ Not Attending';
                item.innerHTML = `
                    <span class="responseName">${response.name}</span>
                    <span class="responseDate">${statusText}</span>
                `;
                responseList.appendChild(item);
            });
        }
    }

});

