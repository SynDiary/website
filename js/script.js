/*
-- Page Loading
-- Count Down Date
-- Back To Top
-- AOS Animation 
-- Quantity Button
*/

(function($) {
    "use strict";

    // Page Loading
    document.addEventListener('DOMContentLoaded', function() {
        const preloader = document.querySelector('.page-loading');
        if (preloader) {
            function removePreloader() {
                preloader.classList.remove('active');
                setTimeout(function() {
                    preloader.remove();
                }, 1500);
            }
            removePreloader();
        }

        // Setup form submissions
        setupFormSubmissions();
    });

    // Index Demo Page Scrolling
    window.addEventListener('DOMContentLoaded', event => {
        const mainNav = document.body.querySelector('#mainNav');
        if (mainNav) {
            new bootstrap.ScrollSpy(document.body, {
                target: '#mainNav',
                rootMargin: '0px 0px',
            });
        };
        const navbarToggler = document.body.querySelector('.navbar-toggler');
        const responsiveNavItems = [].slice.call(
            document.querySelectorAll('#navbarResponsive .nav-link')
        );
        responsiveNavItems.map(function(responsiveNavItem) {
            responsiveNavItem.addEventListener('click', () => {
                if (window.getComputedStyle(navbarToggler).display !== 'none') {
                    navbarToggler.click();
                }
            });
        });
    });    
    
    // Back To Top
    var backButton = document.createElement("button");
    backButton.id = "back-to-top";
    backButton.title = "Go to top";
    backButton.textContent = "\u25B2";
    document.body.appendChild(backButton);
    window.onscroll = function() {
        scrollFunction();
    };
    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            backButton.style.display = "block";
        } else {
            backButton.style.display = "none";
        }
    }
    backButton.onclick = function() {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    };

    // AOS Animation
    AOS.init();
    AOS.refresh();

    // Form Submissions
    function setupFormSubmissions() {
        const signupForm = document.getElementById('signup-form');
        const contactForm = document.getElementById('contact-form');
        const betaSignupForm = document.getElementById('beta-signup-form');

        if (signupForm) {
            signupForm.addEventListener('submit', handleSubmit);
        }

        if (contactForm) {
            contactForm.addEventListener('submit', handleSubmit);
        }

        if (betaSignupForm) {
            betaSignupForm.addEventListener('submit', handleBetaSubmit);
        }
    }

    function handleBetaSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })
        .then(() => {
            // Close the modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('betaSignupModal'));
            if (modal) {
                modal.hide();
            }
            // Show success message
            showModal('successModal');
            form.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('errorModal');
        });
    }

    // Support opening beta modal via URL hash (#join-beta)
    window.addEventListener('DOMContentLoaded', function() {
        const hash = window.location.hash;
        if (hash === '#join-beta') {
            const betaModal = document.getElementById('betaSignupModal');
            if (betaModal) {
                const modal = new bootstrap.Modal(betaModal);
                modal.show();
            }
        }
    });

    function handleSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(formData).toString(),
        })
        .then(() => {
            showModal('successModal');
            form.reset(); // Reset the form after successful submission
        })
        .catch((error) => {
            console.error('Error:', error);
            showModal('errorModal');
        });
    }

    function showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }
})(window.jQuery);