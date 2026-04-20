const siteContent = window.siteContent || {};

const queryAll = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function scrollToHash(hash, replaceHistory = false) {
  if (!hash) {
    return;
  }

  if (hash === "#top") {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const method = replaceHistory ? "replaceState" : "pushState";
    window.history[method](null, "", hash);
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const header = document.querySelector(".site-header");
  const headerOffset = header ? header.getBoundingClientRect().height + 12 : 0;
  const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - headerOffset);

  window.scrollTo({ top, behavior: "smooth" });

  const method = replaceHistory ? "replaceState" : "pushState";
  window.history[method](null, "", hash);
}

function getScrollSpyProbe(header) {
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const viewportLead = Math.max(260, window.innerHeight * 0.38);

  return window.scrollY + headerHeight + viewportLead;
}

function setYear() {
  queryAll("#year").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });
}

function setContactDetails() {
  const contact = siteContent.contact || {};

  queryAll("[data-phone]").forEach((node) => {
    node.textContent = contact.phoneDisplay || "";
  });

  queryAll("[data-email]").forEach((node) => {
    node.textContent = contact.email || "";
  });

  queryAll("[data-location]").forEach((node) => {
    node.textContent = contact.location || "";
  });

  queryAll("[data-phone-link]").forEach((node) => {
    node.href = contact.phoneHref || "#";
  });

  queryAll("[data-email-link]").forEach((node) => {
    node.href = contact.email ? `mailto:${contact.email}` : "#";
  });
}

function setActiveNav() {
  const navLinks = queryAll('.site-nav a[href^="#"]');
  if (!navLinks.length) {
    return;
  }

  const sections = [
    { hash: "#top", element: document.querySelector(".hero") || document.querySelector("#top") },
    { hash: "#services", element: document.querySelector("#services") },
    { hash: "#projects", element: document.querySelector("#projects") },
    { hash: "#contact", element: document.querySelector("#contact") }
  ].filter((item) => item.element);

  if (!sections.length) {
    return;
  }

  const header = document.querySelector(".site-header");
  const probe = getScrollSpyProbe(header);
  const pageBottom = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;

  let activeHash = sections[0].hash;
  if (window.scrollY <= 40) {
    activeHash = "#top";
  }

  sections.forEach((section) => {
    if (section.element.offsetTop <= probe) {
      activeHash = section.hash;
    }
  });

  if (pageBottom >= pageHeight - 24) {
    activeHash = sections[sections.length - 1].hash;
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    link.classList.toggle("is-active", href === activeHash);
  });
}

function setupHeader() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (toggle && nav) {
    const closeNav = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      document.body.classList.remove("has-nav-open");
    };

    const setNavState = (expanded) => {
      toggle.setAttribute("aria-expanded", String(expanded));
      nav.classList.toggle("is-open", expanded);
      document.body.classList.toggle("has-nav-open", expanded);
    };

    const shouldCloseNavOnClick = (link) => {
      const href = link.getAttribute("href") || "";

      if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("mailto:")) {
        return true;
      }

      try {
        const targetUrl = new URL(link.href, window.location.href);
        return targetUrl.pathname === window.location.pathname && Boolean(targetUrl.hash);
      } catch {
        return true;
      }
    };

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      setNavState(!expanded);
    });

    queryAll(".site-nav a").forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href") || "";

        if (href.startsWith("#")) {
          event.preventDefault();
          link.blur();
          toggle.blur();
          closeNav();
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => scrollToHash(href));
          });
          return;
        }

        if (shouldCloseNavOnClick(link)) {
          closeNav();
        }
      });
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) {
        return;
      }

      if (nav.contains(event.target) || toggle.contains(event.target)) {
        return;
      }

      closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 920) {
          closeNav();
        }
      },
      { passive: true }
    );
  }

  const onScroll = () => {
    if (!header) {
      return;
    }

    header.classList.toggle("is-scrolled", window.scrollY > 16);
    setActiveNav();
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (window.location.hash) {
    window.setTimeout(() => scrollToHash(window.location.hash, true), 80);
  }
}

function renderHeroPills() {
  const container = document.getElementById("hero-pills");
  if (!container || !siteContent.heroPills) {
    return;
  }

  container.innerHTML = siteContent.heroPills
    .map((item) => `<span class="pill">${item}</span>`)
    .join("");
}

function renderFeatureList() {
  const container = document.getElementById("feature-list");
  if (!container || !siteContent.features) {
    return;
  }

  container.innerHTML = siteContent.features
    .map(
      (item) => `
        <div class="check-list__item">
          <span></span>
          <p>${item}</p>
        </div>
      `
    )
    .join("");
}

function renderServices(targetId) {
  const container = document.getElementById(targetId);
  if (!container || !siteContent.services) {
    return;
  }

  container.innerHTML = siteContent.services
    .map(
      (service, index) => `
        <article class="service-card" data-reveal style="--card-delay:${index * 70}ms">
          <p class="service-card__eyebrow">0${index + 1}</p>
          <h3>${service.label}</h3>
          <strong>${service.intro}</strong>
          <p>${service.text}</p>
        </article>
      `
    )
    .join("");
}

function renderStandards() {
  const container = document.getElementById("standards-grid");
  if (!container || !siteContent.standards) {
    return;
  }

  container.innerHTML = siteContent.standards
    .map(
      (item, index) => `
        <article class="standard-card" data-reveal style="--card-delay:${index * 80}ms">
          <span>${String(index + 1).padStart(2, "0")}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `
    )
    .join("");
}

function renderCategories() {
  const container = document.getElementById("project-category-grid");
  if (!container || !siteContent.categories) {
    return;
  }

  container.innerHTML = siteContent.categories
    .map(
      (item, index) => `
        <article class="category-card" data-reveal style="--card-delay:${index * 60}ms">
          <div class="category-card__image">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="category-card__body">
            <span>${item.label}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <small>${item.count}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function galleryCardTemplate(item, index) {
  const tags = (item.tags || [])
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  const shapeClass = item.shape ? `gallery-card--${item.shape}` : "";
  const indexValue = typeof index === "number" ? index : -1;

  return `
    <article class="gallery-card ${shapeClass}" data-gallery-index="${indexValue}" data-reveal>
      <button class="gallery-card__button" type="button" data-gallery-index="${indexValue}" aria-label="Open ${item.title}">
        <div class="gallery-card__media">
          <img src="${item.image}" alt="${item.alt}" loading="lazy" />
        </div>
        <div class="gallery-card__body">
          <span class="gallery-card__eyebrow">${item.subtitle}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
          <div class="gallery-card__tags">${tags}</div>
        </div>
      </button>
    </article>
  `;
}

function renderGalleryPreview() {
  const container = document.getElementById("gallery-preview");
  if (!container || !siteContent.gallery) {
    return;
  }

  const items = siteContent.gallery.filter((item) => item.featured).slice(0, 6);
  container.innerHTML = items.map((item, index) => galleryCardTemplate(item, index)).join("");
  setupLightbox(items, container);
}

function renderCollections() {
  const container = document.getElementById("collections-grid");
  if (!container || !siteContent.collections) {
    return;
  }

  container.innerHTML = siteContent.collections
    .map(
      (item, index) => `
        <article class="collection-card" data-reveal style="--card-delay:${index * 60}ms">
          <div class="collection-card__media">
            <img src="${item.image}" alt="${item.title}" loading="lazy" />
          </div>
          <div class="collection-card__overlay"></div>
          <div class="collection-card__body">
            <span>${item.label}</span>
            <h3>${item.title}</h3>
            <p>${item.text}</p>
            <small>${item.count}</small>
          </div>
        </article>
      `
    )
    .join("");
}

function renderFilters(activeId) {
  const container = document.getElementById("filter-bar");
  if (!container || !siteContent.filters) {
    return;
  }

  container.innerHTML = siteContent.filters
    .map(
      (filter) => `
        <button class="filter-chip ${filter.id === activeId ? "is-active" : ""}" type="button" data-filter="${filter.id}">
          ${filter.label}
        </button>
      `
    )
    .join("");
}

function renderGallery(activeId = "all") {
  const container = document.getElementById("gallery-grid");
  if (!container || !siteContent.gallery) {
    return;
  }

  const items =
    activeId === "all"
      ? siteContent.gallery
      : siteContent.gallery.filter((item) => (item.tags || []).includes(activeId));

  container.innerHTML = items.map((item, index) => galleryCardTemplate(item, index)).join("");
  renderFilters(activeId);

  queryAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => renderGallery(button.dataset.filter));
  });

  setupLightbox(items, container);
  setupReveal();
}

function setupLightbox(items, root) {
  if (!root || !items.length) {
    return;
  }

  queryAll(".gallery-card__button[data-gallery-index]", root).forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.galleryIndex);
      const item = items[index];

      if (!item) {
        return;
      }

      openLightbox(item);
    });
  });
}

function openLightbox(item) {
  let modal = document.querySelector(".lightbox");

  if (!modal) {
    modal = document.createElement("div");
    modal.className = "lightbox";
    modal.innerHTML = `
      <div class="lightbox__backdrop" data-lightbox-close></div>
      <div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="Project image preview">
        <button class="lightbox__close" type="button" data-lightbox-close aria-label="Close preview">Close</button>
        <img class="lightbox__image" alt="" />
        <div class="lightbox__content">
          <span class="lightbox__eyebrow"></span>
          <h3 class="lightbox__title"></h3>
          <p class="lightbox__text"></p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    queryAll("[data-lightbox-close]", modal).forEach((node) => {
      node.addEventListener("click", () => {
        modal.classList.remove("is-open");
        document.body.classList.remove("has-lightbox-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        modal.classList.remove("is-open");
        document.body.classList.remove("has-lightbox-open");
      }
    });
  }

  modal.querySelector(".lightbox__image").src = item.image;
  modal.querySelector(".lightbox__image").alt = item.alt;
  modal.querySelector(".lightbox__eyebrow").textContent = item.subtitle;
  modal.querySelector(".lightbox__title").textContent = item.title;
  modal.querySelector(".lightbox__text").textContent = item.text;
  modal.classList.add("is-open");
  document.body.classList.add("has-lightbox-open");
}

function setupQuoteForms() {
  const email = siteContent.contact?.email;
  if (!email) {
    return;
  }

  queryAll("[data-quote-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const name = formData.get("name")?.toString().trim() || "";
      const visitorEmail = formData.get("email")?.toString().trim() || "";
      const phone = formData.get("phone")?.toString().trim() || "";
      const service = formData.get("service")?.toString().trim() || "";
      const details = formData.get("details")?.toString().trim() || "";

      const subject = encodeURIComponent(`Estimate request from ${name || "website visitor"}`);
      const body = encodeURIComponent(
        [
          `Name: ${name}`,
          `Email: ${visitorEmail}`,
          phone ? `Phone: ${phone}` : "",
          service ? `Service: ${service}` : "",
          "",
          "Project details:",
          details
        ]
          .filter(Boolean)
          .join("\n")
      );

      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    });
  });
}

function setupReveal() {
  const items = queryAll("[data-reveal]");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));

  window.setTimeout(() => {
    items.forEach((item) => item.classList.add("is-visible"));
  }, 1400);
}

setYear();
setContactDetails();
setActiveNav();
setupHeader();
renderHeroPills();
renderFeatureList();
renderCategories();
renderServices("services-grid");
renderStandards();
renderGalleryPreview();
renderCollections();
renderGallery("all");
setupQuoteForms();
setupReveal();
