let currentPlayers = [];

document.addEventListener("DOMContentLoaded", function () {
    loadOptions();
});


async function loadOptions() {
    try {
        const response = await fetch("/options");
        const data = await response.json();

        fillSelect("nation", data.nations, "All Nations");
        fillSelect("league", data.leagues, "All Leagues");
        fillSelect("team", data.teams, "All Teams");

        searchPlayers();

    } catch (error) {
        console.error("Options error:", error);
        searchPlayers();
    }
}


function fillSelect(id, items, defaultText) {

    const select = document.getElementById(id);

    select.innerHTML = "";

    const firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = defaultText;

    select.appendChild(firstOption);

    items.forEach(item => {

        if (item && item !== "nan") {

            const option = document.createElement("option");

            option.value = item;
            option.textContent = item;

            select.appendChild(option);
        }
    });
}


async function searchPlayers() {

    const params = new URLSearchParams();

    const fields = [
        "position",
        "minAge",
        "maxAge",
        "minOVR",
        "minPAC",
        "minSHO",
        "minPAS",
        "minDRI",
        "minDEF",
        "minPHY",
        "minAcceleration",
        "minSprint",
        "minFinishing",
        "minShotPower",
        "minLongShots",
        "minVision",
        "minShortPassing",
        "minDribbling",
        "minBallControl",
        "minStamina",
        "minStrength",
        "nation",
        "league",
        "team",
        "preferredFoot"
    ];

    fields.forEach(id => {

        const element = document.getElementById(id);

        if (element && element.value !== "") {
            params.append(id, element.value);
        }

    });


    try {

        const response = await fetch(
            "/players?" + params.toString()
        );

        if (!response.ok) {
            throw new Error("Server error: " + response.status);
        }

        const players = await response.json();

        currentPlayers = players;

        displayPlayers(players);

    } catch (error) {

        console.error("Search error:", error);

        document.getElementById("playersContainer").innerHTML =
            "<p class='no-results'>Backend connection error.</p>";
    }
}


function displayPlayers(players) {

    const container =
        document.getElementById("playersContainer");

    container.innerHTML = "";

    document.getElementById("resultTitle").textContent =
        "Players Found: " + players.length;


    if (players.length === 0) {

        container.innerHTML =
            "<p class='no-results'>No players found.</p>";

        return;
    }


    players.forEach((player, index) => {

        const card = document.createElement("div");

        card.className = "player-card";


        card.innerHTML = `

            <img
                src="${player.card}"
                alt="${player.Name}"
                class="player-image"
                onerror="this.style.display='none'"
            >

            <h3>${player.Name}</h3>

            <p>
                <strong>Position:</strong>
                ${player.Position}
            </p>

            <p>
                <strong>OVR:</strong>
                ${player.OVR}
            </p>

            <p>
                <strong>PAC:</strong>
                ${player.PAC}
            </p>

            <p>
                <strong>SHO:</strong>
                ${player.SHO}
            </p>

            <p>
                <strong>PAS:</strong>
                ${player.PAS}
            </p>

            <p>
                <strong>Age:</strong>
                ${player.Age}
            </p>

            <button onclick="viewProfile(${index})">
                View Profile
            </button>

        `;

        container.appendChild(card);
    });
}


function viewProfile(index) {

    const player = currentPlayers[index];

    if (!player) {
        return;
    }

    const profile =
        document.getElementById("profileContent");


    let html = `

        <div class="profile-header">

            <img
                src="${player.card}"
                class="profile-image"
                onerror="this.style.display='none'"
            >

            <div>

                <h1>${player.Name}</h1>

                <h3>${player.Position}</h3>

                <p>
                    <strong>Overall:</strong>
                    ${player.OVR}
                </p>

            </div>

        </div>

        <h2>Player Information</h2>

        <div class="profile-grid">
    `;


    Object.keys(player).forEach(key => {

        if (key === "card" || key === "_index") {
            return;
        }

        let value = player[key];

        if (value === "" || value === "nan") {
            value = "N/A";
        }

        html += `

            <div class="profile-item">

                <span>${formatName(key)}</span>

                <strong>${value}</strong>

            </div>

        `;
    });


    html += `</div>`;

    profile.innerHTML = html;

    document.getElementById("profileModal").style.display = "flex";
}


function closeProfile() {

    document.getElementById("profileModal").style.display = "none";
}


window.onclick = function (event) {

    const modal =
        document.getElementById("profileModal");

    if (event.target === modal) {
        closeProfile();
    }
};


function resetFilters() {

    document
        .querySelectorAll("input")
        .forEach(input => {
            input.value = "";
        });

    document
        .querySelectorAll("select")
        .forEach(select => {
            select.selectedIndex = 0;
        });

    searchPlayers();
}


function formatName(name) {

    return name
        .replaceAll("_", " ")
        .replace(/\b\w/g, letter => letter.toUpperCase());
}