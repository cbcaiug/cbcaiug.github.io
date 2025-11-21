// Mobile navigation handler
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    // Handle mobile menu toggle
    navToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('nav-open');
        navToggle.classList.toggle('nav-toggle-active');
        document.body.classList.toggle('nav-menu-open');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks?.classList.contains('nav-open') && 
            !e.target.closest('.nav-links') && 
            !e.target.closest('.nav-toggle')) {
            navLinks.classList.remove('nav-open');
            navToggle.classList.remove('nav-toggle-active');
            document.body.classList.remove('nav-menu-open');
        }
    });

    // Function to update active navigation state
    const updateActiveNavigation = () => {
        const sections = ['how-it-works', 'assistants', 'footer'];
        const scrollPosition = window.scrollY + header.offsetHeight;

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section) return;
            
            const sectionTop = section.offsetTop - header.offsetHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            const navLink = document.querySelector(`.nav-links a[href="#${sectionId}"]`);
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLink?.classList.add('active');
            } else {
                navLink?.classList.remove('active');
            }
        });
    };

    // Update active state on scroll
    window.addEventListener('scroll', updateActiveNavigation);
    // Update on resize (header height may change) and run once on load
    window.addEventListener('resize', updateActiveNavigation);
    updateActiveNavigation();

    // Smooth scroll with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            const headerHeight = header.offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
            
            window.scrollTo({
                top: targetPosition - headerHeight - 20, // Additional 20px buffer
                behavior: 'smooth'
            });

            // Close mobile menu if open
            if (navLinks?.classList.contains('nav-open')) {
                navLinks.classList.remove('nav-open');
                navToggle.classList.remove('nav-toggle-active');
                document.body.classList.remove('nav-menu-open');
            }
            // run the active nav update after a short delay (after smooth scroll)
            setTimeout(updateActiveNavigation, 350);
        });
    });

    // Header scroll behavior
    window.addEventListener('scroll', () => {
        // Only hide header on mobile devices
        if (window.innerWidth > 768) return;

        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            header.classList.remove('scroll-down');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
});