// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Stagger Animations Observation
  // Observation Options: Reduced root area to trigger fade-out earlier
  const observerOptions = {
    root: null,
    rootMargin: "-90px 0px -100px 0px", // Pushes trigger points inward
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const group = entry.target;

      // Entrance Logic: Trigger stagger animation only once
      // Now triggers once the section is 100px into the viewport
      if (entry.isIntersecting && !group.dataset.animated) {
        const items = group.querySelectorAll('.stagger-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 100);
        });
        group.dataset.animated = "true";
      }

      // Mobile Fade-Out: Triggered earlier for rows, later for section headings (skipped for no-fade-out class)
      if (window.matchMedia('(max-width: 900px)').matches && !group.classList.contains('no-fade-out')) {
        const isHeader = group.classList.contains('section-header');
        // Section headings stay visible until they actually hit the top of the screen (0)
        // Rows/subsections fade out earlier (200px buffer) for a cleaner UX
        const triggerThreshold = isHeader ? 0 : 200;

        if (!entry.isIntersecting && entry.boundingClientRect.top < triggerThreshold) {
          group.classList.add('scrolled-away');
        } else if (entry.isIntersecting) {
          group.classList.remove('scrolled-away');
        }
      } else {
        group.classList.remove('scrolled-away');
      }
    });
  }, observerOptions);

  // Observe all stagger groups
  const staggerGroups = document.querySelectorAll('.stagger-group');
  staggerGroups.forEach(group => {
    observer.observe(group);
  });

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }
});
