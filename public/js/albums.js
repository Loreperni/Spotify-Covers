document.addEventListener("DOMContentLoaded", () => {
  const sortDirectionButton = document.getElementById("sortDirection");
  const sortBySelect = document.getElementById("sortBy");
  const albumGrid = document.getElementById("albumGrid");
  const createCollageBtn = document.getElementById("createCollageBtn");
  let sortOrder = "asc";

  const originalAlbums = Array.from(albumGrid.children);

  const sortAlbums = () => {
    let albums;
    if (sortBySelect.value === "default") {
      albums = originalAlbums.slice();
    } else {
      albums = Array.from(albumGrid.children);
    }

    const sortBy = sortBySelect.value;

    albums.sort((a, b) => {
      let compareA, compareB;
      if (sortBy === "name") {
        compareA = a.dataset.name.toLowerCase();
        compareB = b.dataset.name.toLowerCase();
      } else if (sortBy === "artist") {
        compareA = a.dataset.artist.toLowerCase();
        compareB = b.dataset.artist.toLowerCase();
      } else {
        return 0;
      }

      return sortOrder === "asc"
        ? compareA.localeCompare(compareB)
        : compareB.localeCompare(compareA);
    });

    albumGrid.innerHTML = "";
    albums.forEach((album) => albumGrid.appendChild(album));
  };

  sortBySelect.addEventListener("change", sortAlbums);

  sortDirectionButton.addEventListener("click", () => {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
    sortDirectionButton.textContent = sortOrder === "asc" ? "↑" : "↓";

    if (sortBySelect.value === "default") {
      const currentDisplayOrder = Array.from(albumGrid.children);
      albumGrid.innerHTML = "";
      currentDisplayOrder
        .reverse()
        .forEach((album) => albumGrid.appendChild(album));
    } else {
      sortAlbums();
    }
  });

  createCollageBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const currentSortBy = sortBySelect.value;
    const currentSortOrder = sortOrder;
    const sortParams = new URLSearchParams({
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
    });
    window.location.href = "/create-collage?" + sortParams.toString();
  });
});
