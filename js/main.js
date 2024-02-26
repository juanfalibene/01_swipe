const DECISION_THRESHOLD = 80;
let isAnimating = false;
let pullDeltaX = 0; // diferencia entre dos posiciones

import tracks from "./enchance_playlist_data.js";

function createCard(track) {
  const template = document.getElementById("track-template");
  const card = template.content.cloneNode(true);

  card.querySelector("img").src = track.imageUrl;
  card.querySelector("img").alt = `${track.title} ${track.artists}`;
  card.querySelector("h2 span").textContent = track.artist;
  card.querySelector("h2").insertAdjacentHTML("afterbegin", track.title);
  card.querySelector("audio").src = track.previewUrl;

  const optionsContainer = card.querySelector(".options");
  const trackButton = optionsContainer.querySelector(".is-track");
  trackButton.dataset.id = track.id;
  const albumButton = optionsContainer.querySelector(".is-album");
  albumButton.dataset.id = track.id_album;
  const artistButton = optionsContainer.querySelector(".is-artist");
  artistButton.dataset.id = track.id_artist;
  const playlistButton = optionsContainer.querySelector(".is-playlist");
  playlistButton.dataset.id = "4CtnJsz8C41gCLjfD1HNUw";

  trackButton.addEventListener("click", () => linkToSpotify(track.id, "track"));
  albumButton.addEventListener("click", () =>
    linkToSpotify(track.id_album, "album")
  );
  artistButton.addEventListener("click", () =>
    linkToSpotify(track.id_artist, "artist")
  );
  playlistButton.addEventListener("click", () =>
    linkToSpotify("4CtnJsz8C41gCLjfD1HNUw", "playlist")
  );

  return card;
}

function linkToSpotify(id, type) {
  const spotifyUrl = `https://open.spotify.com/${type}/${id}`;
  window.open(spotifyUrl, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app");
  tracks.forEach((track) => {
    const card = createCard(track);
    appContainer.appendChild(card);
  });
});

function startDrag(event) {
  if (isAnimating) return;

  // recuperar 1er article
  const actualCard = event.target.closest("article");
  if (!actualCard) return;

  // recuperar posicion inicial del mouse o finger
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
      actualCard.classList.add("reset");
      actualCard.classList.remove("go-right", "go-left");
      actualCard
        .querySelectorAll(".choice")
        .forEach((el) => (el.style.opacity = 0));
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
