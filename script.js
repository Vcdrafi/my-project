document.addEventListener("DOMContentLoaded", function () {
    const phoneInput = document.getElementById("phone-number");
    const phoneInputWrapper = document.querySelector(".intl-tel-input");
    const submitPhoneButton = document.getElementById("submit-phone");
    const verificationModal = document.getElementById("verification-modal");
    const closeModal = document.getElementById("close-modal");
    const digitInputs = document.querySelectorAll(".code-inputs input");
    const verifyButton = document.getElementById("verify-code");
    const verificationErrorMessage = document.getElementById("verification-error-message");
    const phoneErrorMessage = document.getElementById("phone-error-message");
    const timerDisplay = document.getElementById("timer");

    // Initialize intl-tel-input
    let iti = initializePhoneInput();

    submitPhoneButton.onclick = function () {
        const phoneNumber = iti.getNumber();
        if (iti.isValidNumber()) {
            phoneErrorMessage.textContent = "";
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
        });

        input.addEventListener("keydown", function (event) {
            if (event.key === "Backspace" && input.value.length === 0 && index > 0) {
                digitInputs[index - 1].focus();
            }
        });

        // Set numeric input mode
        input.setAttribute("inputmode", "numeric");
    });

    closeModal.onclick = function () {
        closeModalFunction();
        phoneInputWrapper.style.display = "block";  // Show the intl-tel-input wrapper
    };

    verifyButton.onclick = function () {
        let verificationCode = '';
        digitInputs.forEach(input => verificationCode += input.value);

        if (verificationCode.length === 4) {
            if (verificationCode === "1234") { // Example code for validation
                alert('Verification successful!');
                closeModalFunction();
            } else {
                verificationErrorMessage.textContent = "Incorrect verification code.";
            }
        } else {
            verificationErrorMessage.textContent = "Please enter the full 4-digit code.";
        }
    };

    function openModal() {
        verificationModal.style.display = "flex";
    }

    function closeModalFunction() {
        verificationModal.style.display = "none";
        digitInputs.forEach(input => input.value = '');
        verificationErrorMessage.textContent = '';
    }

    function startTimer(duration, display) {
        let timer = duration, minutes, seconds;
        const countdownInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.textContent = minutes + ":" + seconds;

            if (--timer < 0) {
                clearInterval(countdownInterval);
                display.textContent = "Time's up! Please request a new code.";
                closeModalFunction();
                phoneInputWrapper.style.display = "block";  // Show the intl-tel-input wrapper
            }
        }, 1000);
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
