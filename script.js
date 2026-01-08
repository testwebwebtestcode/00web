// Typing effect
  const typingEl = document.getElementById("typing-text");
  const phrases = [
    "Training & Health Education",
    "التدريب والتثقيف الصحي",
    "For Business Services"
  ];
  let p = 0, i = 0, deleting = false;

  function typeLoop(){
    const current = phrases[p];
    typingEl.textContent = deleting ? current.slice(0, i--) : current.slice(0, i++);
    if(!deleting && i > current.length + 12){ deleting = true; }
    if(deleting && i < 0){ deleting = false; p = (p + 1) % phrases.length; i = 0; }
    setTimeout(typeLoop, deleting ? 45 : 65);
  }
  typeLoop();

  // Tracks expand/collapse
  document.querySelectorAll('.track').forEach(card=>{
    card.addEventListener('click', ()=>{
      document.querySelectorAll('.track').forEach(c=>{ if(c!==card) c.classList.remove('active'); });
      card.classList.toggle('active');
    });
  });

  // Newsletter (prevent reload)
  const newsletterForm = document.getElementById('newsletter-form');
  newsletterForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const success = document.getElementById('success');
    if(success){
      success.style.display = 'block';
      setTimeout(()=>{ success.style.display='none'; }, 2500);
    }
    newsletterForm.reset();
  });