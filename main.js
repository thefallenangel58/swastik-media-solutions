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

const supabase = window.supabase.createClient(
  "https://vuvdilqvcakopnjucvtj.supabase.co",
  "sb_publishable_UUv0re8hkUCxXc-QYcjN-w_bm64lYSS"
);

window.mySupabase = supabase;

async function loadImages() {

  const { data, error } = await supabase
    .from("Images")
    .select("*");

  if (error) {
    console.error("Supabase Error:", error);
    return;
  }

  data.forEach(item => {

    // Find the category section
    const categoryDiv = document.querySelector(
      `.${item.category}`
    );

    if (!categoryDiv) {
      console.warn(
        `Category div not found: ${item.category}`
      );
      return;
    }

    // Find the projects_image div inside it
    const imageContainer = categoryDiv.querySelector(
      ".projects_image"
    );

    if (!imageContainer) {
      console.warn(
        `.projects_image not found inside ${item.category}`
      );
      return;
    }

    const img = document.createElement("img");
    img.src = item.image_url;
    img.alt = item.category;
    imageContainer.appendChild(img);
  });
}

await loadImages();

document.querySelectorAll(".gallery_container").forEach(container => {
  const gallery = container.querySelector(".projects_image");
  if (!gallery) return;

  const leftBtn = container.querySelector(".left_btn");
  const rightBtn = container.querySelector(".right_btn");

  const originalCount = gallery.children.length;
  if (originalCount === 0) return;

  // Clone all items once to allow infinite scrolling
  const items = Array.from(gallery.children);
  items.forEach(item => {
    gallery.appendChild(item.cloneNode(true));
  });

  // Calculate loop width: the scroll position where the first cloned item starts
  function getLoopWidth() {
    const firstCloned = gallery.children[originalCount];
    if (!firstCloned) return gallery.scrollWidth / 2;
    return firstCloned.getBoundingClientRect().left - gallery.getBoundingClientRect().left + gallery.scrollLeft;
  }

  let paused = false;
  let isTransitioning = false;
  let scrollTimeout;

  const speed = 0.5; // continuous slow scroll speed (pixels per frame)

  function autoScroll() {
    if (!paused && !isTransitioning && gallery.scrollWidth > gallery.clientWidth) {
      gallery.scrollLeft += speed;
      const loopWidth = getLoopWidth();
      if (gallery.scrollLeft >= loopWidth) {
        gallery.scrollLeft -= loopWidth;
      }
    }
    requestAnimationFrame(autoScroll);
  }

  // Start auto scrolling
  requestAnimationFrame(autoScroll);

  // Pause on hover
  container.addEventListener("mouseenter", () => {
    paused = true;
  });
  container.addEventListener("mouseleave", () => {
    paused = false;
  });

  // Support mobile touch gestures (pause auto-scroll while touching)
  container.addEventListener("touchstart", () => {
    paused = true;
  }, { passive: true });
  container.addEventListener("touchend", () => {
    paused = false;
  }, { passive: true });

  // Normalize scroll position (keep inside [0, loopWidth))
  function normalizeScroll() {
    const loopWidth = getLoopWidth();
    if (gallery.scrollLeft >= loopWidth) {
      gallery.scrollLeft -= loopWidth;
    } else if (gallery.scrollLeft < 0) {
      gallery.scrollLeft += loopWidth;
    }
  }

  // Scroll event listener for seamless wrapping and end-of-transition detection
  gallery.addEventListener("scroll", () => {
    const loopWidth = getLoopWidth();

    if (!isTransitioning) {
      if (gallery.scrollLeft >= loopWidth) {
        gallery.scrollLeft -= loopWidth;
      } else if (gallery.scrollLeft <= 0) {
        gallery.scrollLeft += loopWidth;
      }
    } else {
      // During button click transitions, debounce to detect when scroll finishes
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isTransitioning = false;
        normalizeScroll();
      }, 150);
    }
  });

  function checkScrollability() {
    if (gallery.scrollWidth > gallery.clientWidth) {
      if (leftBtn) leftBtn.style.display = "block";
      if (rightBtn) rightBtn.style.display = "block";
    } else {
      if (leftBtn) leftBtn.style.display = "none";
      if (rightBtn) rightBtn.style.display = "none";
    }
  }

  // Initial check and on window resize
  checkScrollability();
  window.addEventListener("resize", checkScrollability);

  // Next / Prev Button event listeners
  if (leftBtn && rightBtn) {
    function getItemWidth() {
      const firstImg = gallery.querySelector("img");
      return firstImg ? firstImg.offsetWidth + 30 : 290;
    }

    leftBtn.addEventListener("click", () => {
      // Normalize before scrolling to ensure we are inside safe bounds
      normalizeScroll();

      const itemWidth = getItemWidth();
      const loopWidth = getLoopWidth();

      // If we are close to the left edge, wrap to the right copy first to ensure we can scroll left
      if (gallery.scrollLeft < itemWidth) {
        gallery.scrollLeft += loopWidth;
      }

      isTransitioning = true;
      gallery.scrollBy({
        left: -itemWidth,
        behavior: "smooth"
      });
    });

    rightBtn.addEventListener("click", () => {
      normalizeScroll();

      const itemWidth = getItemWidth();
      isTransitioning = true;
      gallery.scrollBy({
        left: itemWidth,
        behavior: "smooth"
      });
    });
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");

      // Optional: animate only once
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll(".fade-in").forEach(el => {
  observer.observe(el);
});

document.querySelectorAll(".stat-number").forEach(counter => {
  const text = counter.textContent;
  const target = parseInt(text); // Extract number
  const suffix = text.replace(target, ""); // %, +, etc.

  function animateCounter(counter) {
    const text = counter.textContent;
    const target = parseInt(text);
    const suffix = text.replace(target, "");

    const duration = 1700;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;

      const progress = Math.max(
        0,
        Math.min(elapsed / duration, 1)
      );

      const easedProgress =
        1 - 0.5 * (Math.pow(1 - progress, 2));

      counter.textContent =
        Math.floor(easedProgress * target) + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  animateCounter(counter);
});