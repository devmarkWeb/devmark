(function () {
    // HEADER SHRINK
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    });

    // HAMBURGER MENU
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileNav.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileNav.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // ACTIVE NAV LINK BASED ON CURRENT PAGE
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(a => {
        const href = a.getAttribute('href');
        if (href === currentPage) a.classList.add('active');
    });

    // FADE IN OBSERVER
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    // LANGUAGE SWITCH (EL / EN)
    let currentLang = localStorage.getItem('devmark-lang') || 'el';

    function applyLanguage(lang) {
        currentLang = lang;
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-el]').forEach(el => {
            const text = lang === 'en' ? (el.dataset.en || el.dataset.el) : el.dataset.el;
            el.textContent = text;
        });
        document.querySelectorAll('.lang-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.lang === lang);
        });
        localStorage.setItem('devmark-lang', lang);
    }

    document.querySelectorAll('.lang-btn').forEach(b => {
        b.addEventListener('click', () => applyLanguage(b.dataset.lang));
    });

    applyLanguage(currentLang);

    // TYPEWRITER (home page only)
    const tw = document.getElementById('typewriter');
    if (tw) {
        const phrasesByLang = {
            el: ['ΣΧΕΔΙΑΣΜΟΣ WEB', 'ΕΦΑΡΜΟΓΕΣ AI', 'BRANDING & LOGO', 'ΥΠΟΣΤΗΡΙΞΗ 360°'],
            en: ['WEB DESIGN', 'AI APPLICATIONS', 'BRANDING & LOGO', '360° SUPPORT']
        };
        let pIdx = 0, cIdx = 0, deleting = false;
        function type() {
            const phrases = phrasesByLang[currentLang] || phrasesByLang.el;
            const phrase = phrases[pIdx % phrases.length];
            if (!deleting) {
                tw.textContent = phrase.slice(0, ++cIdx);
                if (cIdx === phrase.length) {
                    deleting = true;
                    setTimeout(type, 1800);
                    return;
                }
            } else {
                tw.textContent = phrase.slice(0, --cIdx);
                if (cIdx === 0) {
                    deleting = false;
                    pIdx = (pIdx + 1) % phrases.length;
                }
            }
            setTimeout(type, deleting ? 45 : 85);
        }
        setTimeout(type, 800);
    }

    // TECH NETWORK BACKGROUND ANIMATION
    const canvas = document.getElementById('bg-canvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let W, H, nodes, pulses;

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        function Node() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.25;
            this.vy = (Math.random() - 0.5) * 0.25;
            this.r = Math.random() * 1.6 + 1;
        }

        function Pulse(a, b) {
            this.a = a;
            this.b = b;
            this.t = 0;
            this.speed = 0.006 + Math.random() * 0.01;
        }

        function init() {
            resize();
            const count = window.innerWidth < 768 ? 45 : 90;
            nodes = [];
            for (let i = 0; i < count; i++) nodes.push(new Node());
            pulses = [];
        }
        init();
        window.addEventListener('resize', init);

        const LINK_DIST = 140;

        function maybeSpawnPulse() {
            if (pulses.length > 14 || Math.random() > 0.04) return;
            const a = nodes[Math.floor(Math.random() * nodes.length)];
            let closest = null, closestDist = Infinity;
            nodes.forEach(n => {
                if (n === a) return;
                const d = Math.hypot(n.x - a.x, n.y - a.y);
                if (d < LINK_DIST && d < closestDist) { closest = n; closestDist = d; }
            });
            if (closest) pulses.push(new Pulse(a, closest));
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0) n.x = W;
                if (n.x > W) n.x = 0;
                if (n.y < 0) n.y = H;
                if (n.y > H) n.y = 0;
            });

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < LINK_DIST) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.strokeStyle = `rgba(30,163,163,${0.14 * (1 - dist / LINK_DIST)})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(30,163,163,0.55)';
                ctx.fill();
            });

            maybeSpawnPulse();
            pulses = pulses.filter(p => p.t < 1);
            pulses.forEach(p => {
                p.t += p.speed;
                const x = p.a.x + (p.b.x - p.a.x) * p.t;
                const y = p.a.y + (p.b.y - p.a.y) * p.t;
                ctx.beginPath();
                ctx.arc(x, y, 2.2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(217,168,130,0.9)';
                ctx.shadowColor = 'rgba(217,168,130,0.8)';
                ctx.shadowBlur = 6;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            requestAnimationFrame(draw);
        }
        draw();
    }
})();
