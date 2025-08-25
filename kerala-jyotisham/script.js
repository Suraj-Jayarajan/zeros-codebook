document.addEventListener('DOMContentLoaded', function() {
    // Temple Canvas Animation
    const canvas = document.getElementById('templeCanvas');
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        let w, h;
        
        function resize() {
            w = canvas.width = canvas.offsetWidth;
            h = canvas.height = canvas.offsetHeight;
        }

        // Particle system for divine light effects
        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.size = Math.random() * 2 + 1;
                this.speed = Math.random() * 0.5 + 0.2;
                this.opacity = Math.random() * 0.5 + 0.2;
                this.angle = Math.random() * Math.PI * 2;
            }

            update() {
                this.y -= this.speed;
                this.x += Math.sin(this.angle) * 0.3;
                this.opacity -= 0.002;

                if (this.y < 0 || this.opacity <= 0) {
                    this.reset();
                }
            }

            draw() {
                ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Temple silhouette points for Kerala architecture
        const templeShape = [
            // Base
            [0.1, 1], [0.1, 0.7],
            // Left side detailed architecture
            [0.2, 0.65], [0.25, 0.55],
            [0.3, 0.5], [0.35, 0.45],
            // Central spire (characteristic Kerala style)
            [0.4, 0.4], [0.45, 0.35], [0.5, 0.25],
            [0.55, 0.35], [0.6, 0.4],
            // Right side detailed architecture
            [0.65, 0.45], [0.7, 0.5],
            [0.75, 0.55], [0.8, 0.65],
            // Base completion
            [0.9, 0.7], [0.9, 1]
        ];

        // Create particles
        const particles = Array(50).fill().map(() => new Particle());

        function drawTempleDetails() {
            // Draw ornate Kerala-style details
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
            ctx.lineWidth = 1;

            // Draw characteristic Kerala temple roof layers
            for (let y = 0.4; y <= 0.7; y += 0.1) {
                ctx.beginPath();
                ctx.moveTo(w * 0.2, h * y);
                ctx.lineTo(w * 0.8, h * y);
                ctx.stroke();

                // Add vertical supports
                for (let x = 0.2; x <= 0.8; x += 0.1) {
                    ctx.beginPath();
                    ctx.moveTo(w * x, h * y);
                    ctx.lineTo(w * x, h * (y + 0.05));
                    ctx.stroke();
                }
            }

            // Draw decorative arches
            for (let x = 0.25; x <= 0.75; x += 0.25) {
                ctx.beginPath();
                ctx.arc(w * x, h * 0.6, 20, Math.PI, 0, false);
                ctx.stroke();
            }
        }

        function drawTemple() {
            // Main temple silhouette
            ctx.fillStyle = 'rgba(26, 15, 15, 0.8)';
            ctx.beginPath();
            ctx.moveTo(w * templeShape[0][0], h * templeShape[0][1]);
            
            templeShape.forEach(point => {
                ctx.lineTo(w * point[0], h * point[1]);
            });
            
            ctx.fill();

            // Add detailed architectural elements
            drawTempleDetails();
        }

        function animate() {
            ctx.clearRect(0, 0, w, h);
            
            // Draw particles (divine light effect)
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw temple silhouette with details
            drawTemple();
            
            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Form handling with sacred transition
    const form = document.querySelector('.sacred-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = form.querySelector('button[type="submit"]');
            button.textContent = 'ॐ Sent ॐ';
            button.style.background = 'var(--gold)';
            button.style.color = 'var(--sacred-black)';
            button.disabled = true;
            
            setTimeout(() => {
                button.textContent = 'Request Consultation';
                button.style.background = 'var(--deep-red)';
                button.style.color = 'var(--sacred-white)';
                button.disabled = false;
                form.reset();
            }, 3000);
        });
    }

    // Smooth scroll with blessing effect
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Add subtle blessing highlight effect
                target.style.transition = 'box-shadow 0.5s ease';
                target.style.boxShadow = '0 0 20px rgba(212, 175, 55, 0.3)';
                setTimeout(() => {
                    target.style.boxShadow = 'none';
                }, 1000);
            }
        });
    });
});
