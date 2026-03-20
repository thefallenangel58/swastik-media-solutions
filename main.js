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
});
