const progressBar = document.getElementById("scrollProgress");
const themeToggle = document.getElementById("themeToggle");
const themeSwitch = document.querySelector(".theme-switch");
const themeSwitchAnchor = document.getElementById("themeSwitchAnchor");
const podcastPlayer = document.querySelector(".podcast-player");
const themeStorageKey = "pitchTheme";
const mobileThemeQuery = window.matchMedia("(max-width: 760px)");

function relocateThemeSwitch() {
  if (!themeSwitch || !themeSwitchAnchor || !podcastPlayer) {
    return;
  }

  if (mobileThemeQuery.matches) {
    if (podcastPlayer.firstElementChild !== themeSwitch) {
      podcastPlayer.insertBefore(themeSwitch, podcastPlayer.firstChild);
    }

    return;
  }

  if (themeSwitch.previousElementSibling !== themeSwitchAnchor) {
    themeSwitchAnchor.insertAdjacentElement("afterend", themeSwitch);
  }
}

relocateThemeSwitch();

if (typeof mobileThemeQuery.addEventListener === "function") {
  mobileThemeQuery.addEventListener("change", relocateThemeSwitch);
} else if (typeof mobileThemeQuery.addListener === "function") {
  mobileThemeQuery.addListener(relocateThemeSwitch);
}

if (themeToggle) {
  const savedTheme = localStorage.getItem(themeStorageKey);
  const darkEnabled = savedTheme ? savedTheme === "dark" : false;

  document.body.classList.toggle("theme-dark", darkEnabled);
  themeToggle.checked = darkEnabled;

  themeToggle.addEventListener("change", () => {
    const dark = themeToggle.checked;
    document.body.classList.toggle("theme-dark", dark);
    localStorage.setItem(themeStorageKey, dark ? "dark" : "light");
  });
}

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
}

window.addEventListener("scroll", updateProgressBar, { passive: true });
window.addEventListener("resize", updateProgressBar);
updateProgressBar();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  {
    threshold: 0.08,
    rootMargin: "0px 0px -6% 0px",
  }
);

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

const navLinks = document.querySelectorAll(".story-nav a");
const sectionMap = new Map();

navLinks.forEach((link) => {
  const id = link.getAttribute("href")?.slice(1);
  if (id) {
    sectionMap.set(id, link);
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const id = entry.target.getAttribute("id");
      if (!id) {
        return;
      }

      navLinks.forEach((link) => link.classList.remove("active"));
      sectionMap.get(id)?.classList.add("active");
    });
  },
  {
    threshold: 0.28,
    rootMargin: "-18% 0px -52% 0px",
  }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

const podcastAudio = document.getElementById("podcastAudio");
const podcastSpeed = document.getElementById("podcastSpeed");
const speedStorageKey = "pitchPodcastRate";

if (podcastAudio && podcastSpeed) {
  const savedRate = Number(localStorage.getItem(speedStorageKey) || "1");
  const allowedRates = ["1", "1.25", "1.5", "2"];
  const selectedRate = allowedRates.includes(String(savedRate)) ? String(savedRate) : "1";

  podcastAudio.playbackRate = Number(selectedRate);
  podcastSpeed.value = selectedRate;

  podcastSpeed.addEventListener("change", () => {
    const nextRate = Number(podcastSpeed.value || "1");
    podcastAudio.playbackRate = nextRate;
    localStorage.setItem(speedStorageKey, String(nextRate));
  });
}
