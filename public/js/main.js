// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Set active nav item based on current page
    if (navItems && navItems.length) {
        navItems.forEach(item => item.classList.remove('active'));
        navItems.forEach(item => {
            try {
                const itemUrl = new URL(item.href, window.location.origin);
                const itemPath = itemUrl.pathname;
                if (itemPath === currentPath || (currentPath === '/' && (itemPath === '/' || itemPath === '/index.html'))) {
                    item.classList.add('active');
                }
            } catch (_) {}
        });
    }

    // Smooth scrolling for anchor links (kept for same-page sections only)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current section in navigation (only on home page)
    const sections = document.querySelectorAll('section');
    if (currentPath === '/' || currentPath === '/index.html') {
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (pageYOffset >= sectionTop - 200) {
                    current = section.getAttribute('id');
                }
            });

            // Maintain active state on Home when scrolling sections
            navItems.forEach(item => {
                item.classList.remove('active');
            });

            // If a section is active, try to highlight its corresponding hash link if present
            if (current) {
                const sectionLink = document.querySelector(`.nav-links a[href="#${current}"]`);
                if (sectionLink) sectionLink.classList.add('active');
            } else {
                // Default to Home
                const homeLink = document.querySelector('.nav-links a[href="/"]');
                if (homeLink) homeLink.classList.add('active');
            }
        });
    }
});

// Keep only utilities needed across the site. All content loading now happens in site.js via real backend APIs.
// Generate URL-friendly slug from title (utility)
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^À-ſa-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}
