function appendMovie(movie, element) {
  function formatDate(isoDate) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return day + " " + month + " " + year;
  }

  function createCreditBlock(labelText, items) {
    const block = document.createElement("section");
    block.className = "credit-block";

    const label = document.createElement("h3");
    label.className = "info-label";
    label.textContent = labelText;

    const list = document.createElement("ul");

    items.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      list.append(li);
    });

    block.append(label, list);
    return block;
  }

  const article = document.createElement("article");
  article.id = movie.imdbID;

  const header = document.createElement("header");

  const overviewSection = document.createElement("div");
  overviewSection.className = "overview";

  const detailsSection = document.createElement("div");
  detailsSection.className = "details";

  const creditsSection = document.createElement("section");
  creditsSection.className = "credits";

  const ratingsSection = document.createElement("div");
  ratingsSection.className = "ratings-section";

  const title = document.createElement("h2");
  title.textContent = movie.Title;
  header.append(title);

  const posterWrapper = document.createElement("div");
  posterWrapper.className = "poster-wrapper";

  const poster = document.createElement("img");
  poster.src = movie.Poster;
  poster.alt = movie.Title + " poster";

  posterWrapper.append(poster);
  overviewSection.append(posterWrapper);

  const meta = document.createElement("dl");
  meta.className = "meta";

  const releaseLabel = document.createElement("dt");
  releaseLabel.textContent = "Release:";

  const releaseValue = document.createElement("dd");
  const time = document.createElement("time");
  time.dateTime = movie.Released;
  time.textContent = formatDate(movie.Released);
  releaseValue.append(time);

  const separator = document.createElement("span");
  separator.className = "separator";
  separator.textContent = "|";

  const runtimeLabel = document.createElement("dt");
  runtimeLabel.textContent = "Runtime:";

  const runtimeValue = document.createElement("dd");
  runtimeValue.textContent = movie.Runtime + " min";

  meta.append(releaseLabel, releaseValue, separator, runtimeLabel, runtimeValue);
  overviewSection.append(meta);

  const genres = document.createElement("ul");
  genres.className = "genre-list";

  movie.Genres.forEach(function (genre) {
    const genreItem = document.createElement("li");

    const genreSpan = document.createElement("span");
    genreSpan.className = "genre";
    genreSpan.textContent = genre;

    genreItem.append(genreSpan);
    genres.append(genreItem);
  });

  overviewSection.append(genres);

  const plotSection = document.createElement("section");

  const plotHeading = document.createElement("h3");
  plotHeading.className = "section-heading";
  plotHeading.textContent = "Plot:";

  const plot = document.createElement("p");
  plot.className = "plot";
  plot.textContent = movie.Plot;

  plotSection.append(plotHeading, plot);

  creditsSection.append(
    createCreditBlock("Actors:", movie.Actors),
    createCreditBlock("Directors:", movie.Directors),
    createCreditBlock("Writers:", movie.Writers)
  );

  const ratings = document.createElement("div");
  ratings.className = "ratings";

  const metascore = document.createElement("span");
  metascore.textContent = "Metascore: " + movie.Metascore;

  const imdbRating = document.createElement("span");
  imdbRating.textContent = "IMDb Rating: " + movie.imdbRating;

  ratings.append(metascore, imdbRating);
  ratingsSection.append(ratings);

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.onclick = function () {
    location.href = "edit.html?imdbID=" + movie.imdbID;
  };
  ratingsSection.append(editButton);

  detailsSection.append(plotSection, creditsSection);
  article.append(header, overviewSection, detailsSection, ratingsSection);
  element.append(article);
}

function loadMovies(genre) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const mainElement = document.querySelector("main");

    while (mainElement.childElementCount > 0) {
      mainElement.firstChild.remove()
    }

    if (xhr.status === 200) {
      const movies = JSON.parse(xhr.responseText)
      for (const movie of movies) {
        appendMovie(movie, mainElement)
      }
    } else {
      mainElement.append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  }

  const url = new URL("/movies", location.href)

  if (genre) {
    url.searchParams.set("genre", genre)
  }

  xhr.open("GET", url)
  xhr.send()
}

window.onload = function () {
  const sidebar = document.getElementById("sidebar");

  document.getElementById("menu-toggle").onclick = function () {
    sidebar.classList.add("open");
  };

  document.getElementById("close-nav").onclick = function () {
    sidebar.classList.remove("open");
  };

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const listElement = document.querySelector("nav ul");

    if (xhr.status === 200) {
      const genres = JSON.parse(xhr.responseText);

      const  allListItem = document.createElement("li");
      const allButton = document.createElement("button");
      allButton.textContent = "All";

      allButton.onclick = function () {
        loadMovies();
      };

      allListItem.append(allButton);
      listElement.append(allListItem);

      for (const genre of genres) {
        const listItem = document.createElement("li");
        const button = document.createElement("button");

        button.textContent = genre;

        button.onclick = function () {
          loadMovies(genre);
          sidebar.classList.remove("open");
        };

        listItem.append(button);
        listElement.append(listItem);
      }

      /* When a first button exists, we click it to load all movies. */
      const firstButton = document.querySelector("nav ul button");
      if (firstButton) {
        firstButton.click();
      }
    } else {
      document.querySelector("body").append(`Daten konnten nicht geladen werden, Status ${xhr.status} - ${xhr.statusText}`);
    }
  };
  
  xhr.open("GET", "/genres");
  xhr.send();

};
