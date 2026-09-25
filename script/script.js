/* ============================================================
   BREW & BEAN — SCRIPT
   Progressive enhancement. Site works fully without this file.
   ============================================================ */
(function () {
    "use strict";

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    function init() {
        safe(initMobileDrawer);
        safe(initSwiper);
        safe(initHeaderScroll);
        safe(initActiveNav);
        safe(initBackToTop);
        safe(initContactForm);
    }

    function safe(fn) {
        try { fn(); } catch (err) {
            console.warn("[Brew&Bean]", err);
        }
    }

    /* ============================================================
       MOBILE DRAWER
       ============================================================ */
    function initMobileDrawer() {
        const body = document.body;
        const drawer = document.getElementById("mobileDrawer");
        const overlay = document.getElementById("drawerOverlay");
        const openBtn = document.getElementById("menuOpen");
        const closeBtn = document.getElementById("menuClose");
        const links = drawer ? drawer.querySelectorAll(".drawer-link") : [];

        if (!drawer || !openBtn) return;

        const open = () => {
            drawer.classList.add("open");
            overlay.classList.add("show");
            body.style.overflow = "hidden";
        };

        const close = () => {
            drawer.classList.remove("open");
            overlay.classList.remove("show");
            body.style.overflow = "";
        };

        openBtn.addEventListener("click", open);
        closeBtn?.addEventListener("click", close);
        overlay?.addEventListener("click", close);
        links.forEach((l) => l.addEventListener("click", close));

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") close();
        });

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (window.innerWidth > 960) close();
            }, 150);
        });
    }

    /* ============================================================
       SWIPER — TESTIMONIALS
       ============================================================ */
    function initSwiper() {
        const swiperEl = document.getElementById("reviewsSwiper");
        if (!swiperEl) return;

        // Fallback if CDN failed
        if (typeof Swiper === "undefined") {
            console.warn("[Brew&Bean] Swiper CDN unavailable — using fallback scroll.");
            const wrapper = swiperEl.querySelector(".swiper-wrapper");
            if (!wrapper) return;

            wrapper.style.display = "flex";
            wrapper.style.overflowX = "auto";
            wrapper.style.gap = "20px";
            wrapper.style.paddingBottom = "20px";
            wrapper.style.scrollSnapType = "x mandatory";

            wrapper.querySelectorAll(".swiper-slide").forEach((s) => {
                s.style.minWidth = "min(320px, 85vw)";
                s.style.flex = "0 0 auto";
                s.style.scrollSnapAlign = "start";
            });
            return;
        }

        new Swiper(swiperEl, {
            loop: true,
            grabCursor: true,
            spaceBetween: 24,
            speed: 700,
            watchOverflow: true,

            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },

            pagination: {
                el: swiperEl.querySelector(".reviews-dots"),
                clickable: true,
            },

            navigation: {
                nextEl: swiperEl.querySelector(".swiper-button-next"),
                prevEl: swiperEl.querySelector(".swiper-button-prev"),
            },

            breakpoints: {
                0:    { slidesPerView: 1, spaceBetween: 16 },
                640:  { slidesPerView: 1, spaceBetween: 20 },
                768:  { slidesPerView: 2, spaceBetween: 22 },
                1024: { slidesPerView: 3, spaceBetween: 26 },
            },
        });
    }

    /* ============================================================
       HEADER SCROLL STATE
       ============================================================ */
    function initHeaderScroll() {
        const header = document.getElementById("header");
        if (!header) return;

        const onScroll = () => {
            header.classList.toggle("scrolled", window.scrollY > 30);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ============================================================
       ACTIVE NAV LINK
       ============================================================ */
    function initActiveNav() {
        const sections = document.querySelectorAll("section[id]");
        const links = document.querySelectorAll(".nav-link");
        if (!sections.length || !links.length) return;

        const onScroll = () => {
            const pos = window.scrollY + 140;
            let current = "home";

            sections.forEach((s) => {
                if (pos >= s.offsetTop) current = s.id;
            });

            links.forEach((link) => {
                const href = link.getAttribute("href");
                if (!href || !href.startsWith("#")) return;
                link.classList.toggle("active", href.slice(1) === current);
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ============================================================
       BACK TO TOP
       ============================================================ */
    function initBackToTop() {
        const btn = document.getElementById("backToTop");
        if (!btn) return;

        btn.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        const onScroll = () => {
            btn.classList.toggle("show", window.scrollY > 500);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
    }

    /* ============================================================
       CONTACT FORM VALIDATION
       ============================================================ */
    function initContactForm() {
        const form = document.getElementById("contactForm");
        if (!form) return;

        const statusEl = document.getElementById("formStatus");
        const submitBtn = form.querySelector(".btn-submit");
        const btnLabel = form.querySelector(".btn-label");

        const rules = {
            name: (v) => v.trim().length >= 2 || "Name is too short",
            email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || "Invalid email",
            message: (v) => v.trim().length >= 10 || "Message too short",
        };

        const setError = (field, msg) => {
            const wrap = field.closest(".field");
            if (!wrap) return;
            wrap.classList.add("error");
            const err = wrap.querySelector(".field-error");
            if (err) err.textContent = msg;
        };

        const clearError = (field) => {
            const wrap = field.closest(".field");
            if (!wrap) return;
            wrap.classList.remove("error");
            const err = wrap.querySelector(".field-error");
            if (err) err.textContent = "";
        };

        // Live clear errors while typing
        form.querySelectorAll("input, textarea").forEach((input) => {
            input.addEventListener("input", () => {
                const wrap = input.closest(".field");
                if (wrap && wrap.classList.contains("error")) clearError(input);
            });
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (statusEl) {
                statusEl.textContent = "";
                statusEl.className = "form-status";
            }

            let valid = true;
            let firstInvalid = null;

            Object.keys(rules).forEach((name) => {
                const field = form.elements[name];
                if (!field) return;

                const result = rules[name](field.value);
                if (result !== true) {
                    setError(field, result);
                    valid = false;
                    if (!firstInvalid) firstInvalid = field;
                } else {
                    clearError(field);
                }
            });

            if (!valid) {
                if (statusEl) {
                    statusEl.textContent = "Please fix the errors above.";
                    statusEl.className = "form-status error";
                }
                firstInvalid?.focus();
                return;
            }

            submitBtn.disabled = true;
            if (btnLabel) btnLabel.textContent = "Sending...";

            setTimeout(() => {
                if (btnLabel) btnLabel.textContent = "Message Sent ✓";
                if (statusEl) {
                    statusEl.textContent = "Thanks! We'll get back to you soon.";
                    statusEl.className = "form-status success";
                }
                form.reset();

                setTimeout(() => {
                    if (btnLabel) btnLabel.textContent = "Send Message";
                    submitBtn.disabled = false;
                    if (statusEl) {
                        statusEl.textContent = "";
                        statusEl.className = "form-status";
                    }
                }, 2200);
            }, 1000);
        });
    }
})();