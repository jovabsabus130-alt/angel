    // --- 1. Particle System ---
    const pCanvas = document.getElementById('particle-canvas');
    const pCtx = pCanvas.getContext('2d');
    let particles = [];
    const res = () => { pCanvas.width = window.innerWidth; pCanvas.height = window.innerHeight; };
    window.addEventListener('resize', res); res();
    const noBtn = document.getElementById('no-btn');
    const music = document.getElementById('bg-music');
    music.play().catch(() => {
        // If autoplay is blocked, play on first user interaction
        const playMusic = () => { music.play(); document.removeEventListener('click', playMusic); };
        document.addEventListener('click', playMusic);
    });

    class P { 
        constructor() { this.reset(); } 
        reset() { 
            this.x = Math.random() * pCanvas.width; 
            this.y = pCanvas.height + 20; 
            this.s = Math.random() * 15 + 10; 
            this.v = Math.random() * 1.5 + 0.5;
            this.type = Math.random() > 0.4 ? '💌' : '💗'; 
            this.opacity = Math.random() * 0.5 + 0.5;
        } 
        update() { this.y -= this.v; if(this.y < -20) this.reset(); } 
        draw() { 
            pCtx.globalAlpha = this.opacity;
            pCtx.font = `${this.s}px serif`; 
            pCtx.fillText(this.type, this.x, this.y); 
        } 
    }
    for(let i=0; i<100; i++) particles.push(new P());
    function loop() { pCtx.clearRect(0,0,pCanvas.width,pCanvas.height); particles.forEach(p=>{p.update();p.draw();}); requestAnimationFrame(loop); }
    loop();

    // --- 2. Stage 1 Logic ---
    

    const handleNo = (e) => {
        e.preventDefault();
        noBtn.style.animation = 'none';
        noBtn.offsetHeight; 
        noBtn.style.animation = 'shake 0.5s ease-in-out';
        const maxX = window.innerWidth - noBtn.offsetWidth - 20;
        const maxY = window.innerHeight - noBtn.offsetHeight - 20;
        noBtn.style.position = 'fixed';
        noBtn.style.left = Math.max(10, Math.floor(Math.random() * maxX)) + 'px';
        noBtn.style.top = Math.max(10, Math.floor(Math.random() * maxY)) + 'px';
    };

    noBtn.addEventListener('touchstart', handleNo, {passive: false});
    noBtn.addEventListener('click', handleNo);

    document.getElementById('yes-btn').onclick = () => {
        nextStage(2);
    };

    function nextStage(n) {
        document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
        document.getElementById(`stage-${n}`).classList.add('active');
        if(n===2) formHeartShowcase();
    }

    // --- 3. Stage 2: Sequential Showcase & Centered Heart ---
    const imgSources = ["1.jpeg", "2.jpeg", "3.jpeg", "4.jpeg", "5.jpeg", "8.jpeg", "7.jpeg", "6.jpeg", "9.jpeg", "10.jpeg"];
    const captions = ["Your Presence 🤍", "Your Smile 😊", "Every Moment 🫶", "My Love 🫴", "Our World 🌎", "Our Adventures 💗", "Our Dream 🌝", "Our Inside Jokes 🙈", "Simply us 🦢", "Your Eyes 👀"];
    
    // ADJUSTED COORDINATES FOR PERFECT CENTERING
    const heartPattern = [
        {x: -55, y: -90}, {x: 55, y: -90},       // Top humps
        {x: -95, y: -35}, {x: -32, y: -35}, {x: 32, y: -35}, {x: 95, y: -35}, // Mid row
        {x: -65, y: 30}, {x: 0, y: 30}, {x: 65, y: 30},  // Lower mid
        {x: 0, y: 95}                            // Bottom tip
    ];

    async function formHeartShowcase() {
        const gallery = document.getElementById('heart-gallery');
        gallery.innerHTML = '';
        
        for (let i = 0; i < imgSources.length; i++) {
            const div = document.createElement('div');
            div.className = 'mini-polaroid';
            div.innerHTML = `<img src="${imgSources[i]}"><p>${captions[i]}</p>`;
            
            // Initial state: Center and invisible
            div.style.transform = "translate(0, 0) scale(0)";
            gallery.appendChild(div);

            // Transition 1: Appear in center (Showcase)
            await new Promise(r => setTimeout(r, 100));
            div.style.transform = `translate(0, 0) scale(2.8) rotate(${(Math.random()-0.5)*10}deg)`;
            div.style.zIndex = "1000";

            // Wait for user to see
            await new Promise(r => setTimeout(r, 1300));

            // Transition 2: Fly to heart position
            const pos = heartPattern[i];
            const randomRot = (Math.random() - 0.5) * 30;
            const finalTrans = `translate(${pos.x}px, ${pos.y}px) scale(1) rotate(${randomRot}deg)`;
            
            div.style.zIndex = "5";
            div.style.transform = finalTrans;
            div.dataset.origTrans = finalTrans;

            // Click to enlarge logic
            div.onclick = (e) => {
                e.stopPropagation();
                if(div.classList.contains('zoomed')) {
                    div.classList.remove('zoomed');
                    div.style.transform = div.dataset.origTrans;
                } else {
                    closeAllPhotos();
                    div.classList.add('zoomed');
                }
            };
        }

        // Reveal slider after last photo settles
        setTimeout(() => {
            document.getElementById('swipe-wrap').classList.add('show');
            initSlider();
        }, 600);
    }

    function closeAllPhotos() {
        document.querySelectorAll('.mini-polaroid.zoomed').forEach(p => {
            p.classList.remove('zoomed');
            p.style.transform = p.dataset.origTrans;
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mini-polaroid')) closeAllPhotos();
    });

    // --- 4. Slider Logic ---
    function initSlider() {
        const knob = document.getElementById('heart-knob'), fill = document.getElementById('fill'), track = document.getElementById('track');
        let dragging = false;
        const startDragging = (e) => { dragging = true; if(e.type === 'touchstart') e.preventDefault(); };
        const stopDragging = () => dragging = false;
        const onMove = (e) => {
            if(!dragging) return;
            const rect = track.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const x = clientX - rect.left - 27;
            let p = Math.max(0, Math.min(x / (rect.width - 55), 1));
            knob.style.left = (p * (rect.width - 55)) + 'px';
            fill.style.width = (p * 100) + '%';
            if(p > 0.98) { dragging = false; nextStage(3); }
        };
        knob.addEventListener('mousedown', startDragging);
        knob.addEventListener('touchstart', startDragging, {passive: false});
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove, {passive: false});
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('touchend', stopDragging);
    }

    // --- 5. Stage 3 Scratch Logic ---
    const envelope = document.getElementById('envelope');
    envelope.onclick = () => { envelope.classList.add('open'); setTimeout(initScratch, 500); };

    function initScratch() {
        const canvas = document.getElementById('scratch-canvas');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
        grad.addColorStop(0,'#e2e2e2'); grad.addColorStop(0.5,'#ffb3c1'); grad.addColorStop(1,'#d1d1d1');
        ctx.fillStyle = grad; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle='#ff4d6d'; ctx.font='bold 16px "Shantell Sans"'; ctx.textAlign='center';
        ctx.fillText('SCRATCH HERE', canvas.width/2, canvas.height/2+5);
        const scratch = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath(); ctx.arc(x, y, 25, 0, Math.PI*2); ctx.fill();
        };
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e.touches[0].clientX, e.touches[0].clientY); }, {passive: false});
        canvas.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(e.clientX, e.clientY); });
    }