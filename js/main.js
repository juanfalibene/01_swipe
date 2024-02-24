const DECISION_THRESHOLD = 80;
let isAnimating = false;
let pullDeltaX = 0; // diferencia entre dos posiciones

function startDrag(event) {
  if (isAnimating) return;

  // recuperar 1er article
  const actualCard = event.target.closest("article");
  if (!actualCard) return;

  // recuperar posicion inicial del mouse o finger
  console.log(event);
  const startX = event.pageX ?? event.touches[0].pageX;

  // listen el mouse y touch movements
  document.addEventListener("mousemove", onMove);
  document.addEventListener("mouseup", onEnd);

  document.addEventListener("touchmove", onMove, { passive: true });
  document.addEventListener("touchend", onEnd, { passive: true });

  function onMove(event) {
    // recuperar pocision actual
    const currentX = event.pageX ?? event.touches[0].pageX;
    // distancia entre pocision inicial y pos actual
    pullDeltaX = currentX - startX;

    if (pullDeltaX === 0) return;
    // cambiar la flag para indicar que estamos animando
    isAnimating = true;
    // calcular la rotacion de la card usando la distancia
    const deg = pullDeltaX / 15;
    // aplicar la transform de la card
    actualCard.style.transform = `translateX(${pullDeltaX}px)rotate(${deg}deg)`;
    actualCard.style.cursor = "grabbing";

    // cambiar opacity de choice info
    const opacity = Math.abs(pullDeltaX) / 100;
    const isRight = pullDeltaX > 0;

    const choiceEl = isRight
      ? actualCard.querySelector(".choice.like")
      : actualCard.querySelector(".choice.nope");

    choiceEl.style.opacity = opacity;

    console.log(pullDeltaX);
  }

  function onEnd(event) {
    // remover event listeners
    document.removeEventListener("mousemove", onMove);
    document.removeEventListener("mouseup", onEnd);

    document.removeEventListener("touchmove", onMove);
    document.removeEventListener("touchend", onEnd);

    // saber si el usuario ha tomado una decision
    const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD;

    if (decisionMade) {
      console.log("HECHA");
      const goRight = pullDeltaX > 0;
      const goLeft = !goRight;

      // añadir la clase segun decision
      actualCard.classList.add(goRight ? "go-right" : "go-left");
      actualCard.addEventListener(
        "transitionend",
        () => {
          actualCard.remove();
        },
        { once: true }
      );
    } else {
      console.log("...");
      actualCard.classList.add("reset");
      actualCard.classList.remove("go-right", "go-left");
    }

    // reset de variables
    actualCard.addEventListener("transitionend", () => {
      actualCard.removeAttribute("style");
      actualCard.classList.remove("reset");

      pullDeltaX = 0;
      isAnimating = false;
    });
  }
}

document.addEventListener("mousedown", startDrag);
document.addEventListener("touchstart", startDrag, { passive: true }); // para mejorar la performance x evento costoso
