/* ============================================================
   PORTFOLIO V2 INTERACTIVE ENGINE
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  let lastActiveSection = 'hero';

  /* ----- 1. PRELOADER SEQUENCE ----- */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }, 1200);
  });

  // Fallback in case window load doesn't trigger
  setTimeout(() => {
    if (!preloader.classList.contains('loaded')) {
      preloader.classList.add('loaded');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 800);
    }
  }, 3500);


  /* ----- 2. DYNAMIC SCROLL PROGRESS BAR ----- */
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #F59E0B, #06B6D4, #7C3AED);
    z-index: 1000000;
    width: 0%;
    transition: width 0.1s ease-out;
  `;
  document.body.appendChild(progressBar);

  // Progress bar logic moved to the combined throttled scroll handler below.


  /* ----- 3. CURSOR SPOTLIGHT ----- */
  window.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 1024) return; // Disable on mobile for performance
    document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
  }, { passive: true });


  /* ----- 4. THREE.JS WebGL 3D SPACE SCENE ----- */
  const canvas = document.getElementById('three-planet-canvas');
  let scene, camera, renderer, starField, spineLine;
  let planets = [];
  let currentCameraY = 0;
  let targetCameraY = 0;
  const isMobile = window.innerWidth <= 1024;

  // 1. Programmatic radial glow texture generator (bypasses local CORS blocks entirely)
  const createGlowTexture = () => {
    const size = 64;
    const canvasTexture = document.createElement('canvas');
    canvasTexture.width = size;
    canvasTexture.height = size;
    const ctx = canvasTexture.getContext('2d');
    
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.15)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    
    return new THREE.CanvasTexture(canvasTexture);
  };

  const getClusterColor = (name) => {
    switch (name) {
      case 'hero': return 0xF59E0B;      // Gold
      case 'about': return 0x06B6D4;     // Cyan
      case 'work': return 0xef4444;      // Red/Coral
      case 'campaigns': return 0x7C3AED; // Purple
      case 'journey': return 0xF59E0B;   // Gold
      case 'credentials': return 0x06B6D4; // Cyan
      case 'contact': return 0x7C3AED;   // Purple
      default: return 0xffffff;
    }
  };

  const planetConfig = [
    { name: 'hero', y: 0, x: 0, size: 0.22, color: getClusterColor('hero') },
    { name: 'about', y: -12, x: -3.8, size: 0.20, color: getClusterColor('about') },
    { name: 'work', y: -24, x: 3.8, size: 0.18, color: getClusterColor('work') },
    { name: 'campaigns', y: -36, x: -3.8, size: 0.22, color: getClusterColor('campaigns') },
    { name: 'journey', y: -48, x: 3.8, size: 0.20, color: getClusterColor('journey') },
    { name: 'credentials', y: -60, x: 3.8, size: 0.18, color: getClusterColor('credentials') },
    { name: 'contact', y: -72, x: 0, size: 0.22, color: getClusterColor('contact') }
  ];

  const satelliteOffsets = [
    new THREE.Vector3(-1.6, 1.3, 0.6),
    new THREE.Vector3(1.7, 0.9, -0.7),
    new THREE.Vector3(-0.9, -1.5, -0.8),
    new THREE.Vector3(1.3, -1.3, 1.0),
    new THREE.Vector3(-1.8, -0.4, 0.4),
    new THREE.Vector3(0.6, 1.7, -1.0)
  ];

  const connectionPairs = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], // Core to satellites
    [1, 2], [3, 4], [5, 6],                         // Satellite pairs
    [2, 5], [4, 1]                                  // Cross links
  ];

  const getLocalNodePos = (idx) => {
    if (idx === 0) return new THREE.Vector3(0, 0, 0);
    return satelliteOffsets[idx - 1];
  };

  if (canvas) {
    scene = new THREE.Scene();
    
    // Set up camera aspect and field of view
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 9); // Z position for framing

    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: !isMobile,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 1. Lighting (Soft technical space ambiance)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(-6, 6, 8);
    scene.add(sunLight);

    // 2. Starfield (Drifting points)
    const starCount = isMobile ? 300 : 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 60;
      starPositions[i + 1] = (Math.random() - 0.5) * 120;
      starPositions[i + 2] = -Math.random() * 30 - 5;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.08,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    });
    starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 3. Network Constellation Builder
    const glowTexture = createGlowTexture();
    const isAr = document.documentElement.getAttribute('lang') === 'ar';

    planetConfig.forEach((cfg) => {
      const group = new THREE.Group();
      const initialX = isAr ? -cfg.x : cfg.x;
      group.position.set(initialX, cfg.y, 0);
      group.scale.set(0.9, 0.9, 0.9); // Inactive scale

      // Dedicated material instances per cluster to prevent focused opacity leakage
      const coreMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.95
      });
      coreMat.isCore = true;

      const glowMat = new THREE.SpriteMaterial({
        map: glowTexture,
        color: cfg.color,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      glowMat.isCoreGlow = true;

      const satMat = new THREE.MeshBasicMaterial({
        color: 0xffffff, // White satellite spheres for technical aesthetic contrast
        transparent: true,
        opacity: 0.85
      });
      satMat.isSatellite = true;

      const lineMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0.35
      });
      lineMat.isLine = true;

      // A. Create Core Node
      const coreGeo = new THREE.SphereGeometry(cfg.size, 16, 16);
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      group.add(coreMesh);

      // B. Create Glow Aura around Core
      const glowSprite = new THREE.Sprite(glowMat);
      glowSprite.scale.set(cfg.size * 5.0, cfg.size * 5.0, 1.0);
      group.add(glowSprite);

      // C. Create Satellite Nodes
      satelliteOffsets.forEach((offset) => {
        const satGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const satMesh = new THREE.Mesh(satGeo, satMat);
        satMesh.position.copy(offset);
        group.add(satMesh);
      });

      // D. Create Connection Lines inside Cluster
      const lineVertices = [];
      connectionPairs.forEach((pair) => {
        const p1 = getLocalNodePos(pair[0]);
        const p2 = getLocalNodePos(pair[1]);
        lineVertices.push(p1.x, p1.y, p1.z);
        lineVertices.push(p2.x, p2.y, p2.z);
      });

      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
      const lineMesh = new THREE.LineSegments(lineGeo, lineMat);
      group.add(lineMesh);

      // E. Create Local Data Flow Packets (Busy light streams)
      const clusterPackets = [];
      const numPackets = isMobile ? 2 : 4;
      for (let k = 0; k < numPackets; k++) {
        const connIndex = Math.floor(Math.random() * connectionPairs.length);
        const pair = connectionPairs[connIndex];
        
        const pktMat = new THREE.SpriteMaterial({
          map: glowTexture,
          color: cfg.color,
          transparent: true,
          opacity: 0.90,
          blending: THREE.AdditiveBlending
        });
        pktMat.isPacket = true;

        const packetSprite = new THREE.Sprite(pktMat);
        packetSprite.scale.set(0.24, 0.24, 1.0);
        group.add(packetSprite);

        clusterPackets.push({
          startNode: pair[0],
          endNode: pair[1],
          progress: Math.random(), // Randomize to offset start timings
          speed: 0.008 + Math.random() * 0.014,
          sprite: packetSprite
        });
      }

      scene.add(group);

      planets.push({
        name: cfg.name,
        mesh: coreMesh, // Compatible reference for rotation
        group: group,
        baseX: cfg.x,
        baseY: cfg.y,
        targetX: initialX,
        packets: clusterPackets
      });
    });

    // 4. Create Dynamic Central Spine Connector Line
    const spineVertices = new Float32Array(planets.length * 2 * 3);
    const spineGeo = new THREE.BufferGeometry();
    spineGeo.setAttribute('position', new THREE.BufferAttribute(spineVertices, 3));
    const spineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22
    });
    spineLine = new THREE.LineSegments(spineGeo, spineMat);
    scene.add(spineLine);

    // 5. Render loop with Lerp Easing
    function animate() {
      requestAnimationFrame(animate);

      // Smooth camera scroll transition
      currentCameraY += (targetCameraY - currentCameraY) * 0.045;
      camera.position.y = currentCameraY;

      // Update dynamic spine line vertices to match cluster translations
      if (spineLine) {
        const positions = spineLine.geometry.attributes.position;
        for (let k = 0; k < planets.length - 1; k++) {
          const posA = planets[k].group.position;
          const posB = planets[k+1].group.position;
          
          positions.setXYZ(k * 2, posA.x, posA.y, posA.z);
          positions.setXYZ(k * 2 + 1, posB.x, posB.y, posB.z);
        }
        positions.needsUpdate = true;
      }

      // Rotate constellation nodes & update data packets
      planets.forEach(p => {
        // Slow axial rotation of the satellite orbits
        p.group.rotation.y += 0.0035;
        p.group.rotation.x += 0.001;

        // Animate X target translations on language toggling
        p.group.position.x += (p.targetX - p.group.position.x) * 0.08;

        const isActive = p.name === lastActiveSection;
        const targetScale = isActive ? 1.06 : 0.88;

        // Active breathing scale interpolation
        p.group.scale.set(
          THREE.MathUtils.lerp(p.group.scale.x, targetScale, 0.05),
          THREE.MathUtils.lerp(p.group.scale.y, targetScale, 0.05),
          THREE.MathUtils.lerp(p.group.scale.z, targetScale, 0.05)
        );

        // Adjust opacities of child materials dynamically to create a focused depth effect
        const targetOpacity = isActive ? 1.0 : 0.22;
        p.group.children.forEach(child => {
          if (child.material) {
            let baseOpacity = 0.9;
            if (child.material.isCoreGlow) baseOpacity = 0.65;
            else if (child.material.isLine) baseOpacity = 0.35;
            else if (child.material.isSatellite) baseOpacity = 0.85;
            else if (child.material.isCore) baseOpacity = 0.95;
            else if (child.material.isPacket) baseOpacity = 0.90;
            
            child.material.opacity = THREE.MathUtils.lerp(child.material.opacity, targetOpacity * baseOpacity, 0.07);
          }
        });

        // Update local data flow packets along segments
        p.packets.forEach(pkt => {
          pkt.progress += pkt.speed;
          if (pkt.progress >= 1.0) {
            pkt.progress = 0.0;
            pkt.startNode = pkt.endNode;
            
            // Randomly branch onto a connected line path at the junction
            const possiblePairs = connectionPairs.filter(pair => pair.includes(pkt.startNode));
            const nextPair = possiblePairs[Math.floor(Math.random() * possiblePairs.length)];
            
            pkt.endNode = nextPair[0] === pkt.startNode ? nextPair[1] : nextPair[0];
            pkt.speed = 0.008 + Math.random() * 0.014;
          }

          const startPos = getLocalNodePos(pkt.startNode);
          const endPos = getLocalNodePos(pkt.endNode);
          pkt.sprite.position.lerpVectors(startPos, endPos, pkt.progress);
        });
      });

      if (starField) {
        starField.rotation.y += 0.00008;
      }

      renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }


  /* ----- 5. MAGNETIC HOVER EFFECT ----- */
  const magneticButtons = document.querySelectorAll('.magnetic-button');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable on mobile
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull button towards cursor by 35% of offset
      btn.style.transform = `translate(${x * 0.35}px, ${y * 0.35}px)`;
      if (btn.querySelector('span')) {
        btn.querySelector('span').style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      }
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px)';
      if (btn.querySelector('span')) {
        btn.querySelector('span').style.transform = 'translate(0px, 0px)';
      }
    });
  });


  /* ----- 6. INTERSECTION OBSERVER REVEALS ----- */
  // Paragraphs fade-in reveal
  const revealParagraphs = document.querySelectorAll('.reveal-paragraph');
  const paragraphObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        paragraphObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealParagraphs.forEach(p => {
    p.style.opacity = '0';
    p.style.transform = 'translateY(15px)';
    p.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    paragraphObserver.observe(p);
  });

  // Cards stagger reveal
  const revealCards = document.querySelectorAll('.reveal-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 60); // subtle cascade delay
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
    cardObserver.observe(card);
  });

  // Heading split mimic
  const revealHeadings = document.querySelectorAll('.split-reveal-heading');
  const headingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        headingObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  revealHeadings.forEach(heading => {
    heading.style.opacity = '0';
    heading.style.transform = 'translateY(25px)';
    heading.style.transition = 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
    headingObserver.observe(heading);
  });


  /* ----- 7. NUMBERS COUNT-UP ----- */
  const statNums = document.querySelectorAll('.stat-num');
  let statsTriggered = false;

  const statsObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !statsTriggered) {
      statsTriggered = true;
      statNums.forEach(num => {
        const limit = parseInt(num.getAttribute('data-val'));
        let current = 0;
        const duration = 1200; // ms
        const increment = limit / (duration / 16); // ~60fps
        
        const counter = setInterval(() => {
          current += increment;
          if (current >= limit) {
            num.textContent = limit;
            clearInterval(counter);
          } else {
            num.textContent = Math.floor(current);
          }
        }, 16);
      });
    }
  }, { threshold: 0.5 });

  const statsGrid = document.querySelector('.stats-grid');
  if (statsGrid) {
    statsObserver.observe(statsGrid);
  }


  /* ----- 8. ACTIVE NAV LINK TRACKING & BACKGROUND PLANETS ----- */
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-spine .spine-dot, .mobile-menu .mob-link');
  // lastActiveSection declared at DOMContentLoaded top

  const updateActivePlanet = (activeSec) => {
    if (activeSec === lastActiveSection) return;
    lastActiveSection = activeSec;

    // Update WebGL Camera target Y coordinate
    if (typeof planetConfig !== 'undefined') {
      const activeCfg = planetConfig.find(p => p.name === activeSec);
      if (activeCfg) {
        targetCameraY = activeCfg.y;
      }
    }
  };

  let tickingScroll = false;
  window.addEventListener('scroll', () => {
    if (!tickingScroll) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        
        // 1. Progress Bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = scrollPercent + '%';

        // 2. Active Nav Link Tracking & Background Planets
        let currentActive = '';
        const scrollPos = scrollTop + window.innerHeight / 3;

        sections.forEach(sec => {
          const secTop = sec.offsetTop;
          const secHeight = sec.offsetHeight;
          if (scrollPos >= secTop && scrollPos < secTop + secHeight) {
            currentActive = sec.getAttribute('id');
          }
        });

        // Default to Hero section when near the top of the scroll
        if (scrollTop < 180) {
          currentActive = 'hero';
        }

        if (currentActive) {
          navItems.forEach(item => {
            item.classList.remove('active');
            // When hero is active, highlight the home/hero link as active
            if (item.getAttribute('href') === `#${currentActive}`) {
              item.classList.add('active');
            }
          });
          updateActivePlanet(currentActive);
        }

        // 3. Spine timeline progress drawing
        const timeline = document.querySelector('.timeline-container');
        if (timeline) {
          const spineProgress = document.querySelector('.spine-progress');
          const startTrigger = window.innerHeight / 2;
          
          // Use offsetTop instead of getBoundingClientRect for layout performance
          let timelineTop = timeline.offsetTop;
          let parent = timeline.offsetParent;
          while(parent) {
             timelineTop += parent.offsetTop;
             parent = parent.offsetParent;
          }
          const timelineHeight = timeline.offsetHeight;
          
          const scrolled = (scrollTop + startTrigger) - timelineTop;
          const percent = Math.min(Math.max((scrolled / timelineHeight) * 100, 0), 100);
          spineProgress.style.height = percent + '%';
        }

        // 4. Scroll to Top Button Visibility
        const scrollTopBtn = document.getElementById('scroll-to-top');
        if (scrollTopBtn) {
          if (scrollTop > 600) {
            scrollTopBtn.classList.add('visible');
          } else {
            scrollTopBtn.classList.remove('visible');
          }
        }

        tickingScroll = false;
      });
      tickingScroll = true;
    }
  }, { passive: true });


  /* ----- 9. PROJECT DRAWERS ----- */
  const projectCards = document.querySelectorAll('.project-glass-card');
  const drawers = document.querySelectorAll('.project-drawer');

  projectCards.forEach(card => {
    card.addEventListener('click', () => {
      const drawerId = card.getAttribute('data-drawer');
      const targetDrawer = document.getElementById(drawerId);
      if (targetDrawer) {
        targetDrawer.classList.add('active');
        targetDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // prevent scroll behind
      }
    });
  });

  drawers.forEach(drawer => {
    const closeBtn = drawer.querySelector('.drawer-close');
    const overlay = drawer.querySelector('.drawer-overlay');

    const closeDrawer = () => {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);
  });


  /* ----- 10. CERTIFICATE LIGHTBOX ----- */
  const certCards = document.querySelectorAll('.certificate-glass-card');
  const lightbox = document.getElementById('cert-lightbox');
  const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;

  if (lightbox && lightboxImg) {
    certCards.forEach(card => {
      card.addEventListener('click', () => {
        const imgSrc = card.getAttribute('data-img');
        lightboxImg.src = imgSrc;
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 500);
    };

    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (overlay) overlay.addEventListener('click', closeLightbox);

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }


  /* ----- 11. MOBILE HAMBURGER MENU ----- */
  const burger = document.getElementById('burger');
  const mobileNav = document.getElementById('mobile-nav-overlay');
  const mobileClose = document.getElementById('mobile-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu .mob-link');

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      mobileNav.classList.add('active');
      mobileNav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Stagger link entrance animations
      mobileLinks.forEach((link, idx) => {
        link.style.opacity = '0';
        link.style.transform = 'translateY(30px)';
        link.style.transition = 'none'; // reset

        setTimeout(() => {
          link.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          link.style.opacity = '1';
          link.style.transform = 'translateY(0)';
        }, 120 + idx * 60);
      });
    });

    const closeMobileNav = () => {
      mobileNav.classList.remove('active');
      mobileNav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    mobileLinks.forEach(link => link.addEventListener('click', closeMobileNav));
  }


  /* ----- 12. GLASS CARDS mouse tracking (3D TILT EFFECT) ----- */
  const glassCards = document.querySelectorAll('.project-glass-card, .certificate-glass-card');
  
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 1024) return; // Disable tilt on mobile/tablets for smooth scrolling

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);

      // 3D Parallax Tilt Calculation
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = (centerY - y) / centerY * 6; // max 6 degrees tilt
      const tiltY = (x - centerX) / centerX * 6;

      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });

    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease, background 0.3s ease';

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
  });


  /* ----- 13. SCROLL TO TOP CLICK FUNCTIONALITY ----- */
  const scrollTopBtn = document.getElementById('scroll-to-top');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }


  /* ----- 14. AJAX CONTACT FORM HANDLING ----- */
  const contactForm = document.getElementById('contact-form');
  const formContentArea = document.querySelector('.form-content-area');
  const formSuccessState = document.querySelector('.form-success-state');
  const successUsername = document.getElementById('success-username');
  const resetFormBtn = document.querySelector('.btn-reset-form');
  const submitBtn = contactForm ? contactForm.querySelector('.btn-submit-form') : null;
  const submitBtnSpan = submitBtn ? submitBtn.querySelector('span') : null;

  if (contactForm && formContentArea && formSuccessState) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameVal = document.getElementById('name').value;
      
      // Set submit button loading state
      if (submitBtn) {
        submitBtn.classList.add('loading');
        if (submitBtnSpan) submitBtnSpan.textContent = 'Transmitting...';
      }

      const formData = new FormData(contactForm);

      fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (response.ok) {
          // Animate out the form area
          formContentArea.classList.add('fade-out');
          setTimeout(() => {
            formContentArea.style.display = 'none';
            
            // Customize success message with sender's name
            if (successUsername) {
              successUsername.textContent = nameVal ? nameVal.trim() : 'Friend';
            }
            const successUsernameAr = document.getElementById('success-username-ar');
            if (successUsernameAr) {
              successUsernameAr.textContent = nameVal ? nameVal.trim() : 'صديقي';
            }
            
            // Show success state
            formSuccessState.style.display = 'flex';
          }, 500);
        } else {
          throw new Error('Server returned an error');
        }
      })
      .catch(err => {
        console.error('Submission error:', err);
        alert('Transmission failed. Please check your connection or contact abdelrahman.abdelhafez10@gmail.com directly.');
      })
      .finally(() => {
        // Reset submit button state
        if (submitBtn) {
          submitBtn.classList.remove('loading');
          if (submitBtnSpan) submitBtnSpan.textContent = 'Send Message';
        }
      });
    });
  }

  if (resetFormBtn && contactForm) {
    resetFormBtn.addEventListener('click', () => {
      // Clear fields
      contactForm.reset();
      
      // Hide success state
      formSuccessState.style.display = 'none';
      
      // Show form area
      formContentArea.style.display = 'block';
      setTimeout(() => {
        formContentArea.classList.remove('fade-out');
      }, 50);
    });
  }

  /* ----- 15. LANGUAGE SWITCHER LOGIC ----- */
  const initLanguage = () => {
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    setLanguage(savedLang);

    // Bind clicks to all language toggle buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        setLanguage(lang);
      });
    });
  };

  const setLanguage = (lang) => {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('selectedLanguage', lang);

    // Update active visual state for language buttons
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Three.js targetX offsets for language toggling
    if (typeof planets !== 'undefined' && planets && planets.length > 0) {
      planets.forEach(p => {
        p.targetX = lang === 'ar' ? -p.baseX : p.baseX;
      });
    }

    // Update document title based on language
    if (lang === 'ar') {
      document.title = 'عبد الرحمن عبد الحافظ — مخطط واستراتيجي تسويق رقمي';
    } else {
      document.title = 'Abdelrahman Abdelhafez — Digital Marketing Strategist';
    }
  };

  initLanguage();

});
