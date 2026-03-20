// main.js

document.addEventListener("DOMContentLoaded", () => {
  // Stagger Animations Observation
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find all child stagger items within this stagger group
        const group = entry.target;
        const items = group.querySelectorAll('.stagger-item');
        
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('visible');
          }, index * 100); // 100ms stagger delay
        });

        // Unobserve group once animated
        observer.unobserve(group);
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
