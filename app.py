from flask import Flask, jsonify, request, send_from_directory
import pandas as pd

app = Flask(__name__)

df = pd.read_csv("EAFC26-Men.csv")
df = df.fillna("")


def get_number(value):
    try:
        return float(value)
    except:
        return None


@app.route("/")
def home():
    return send_from_directory(".", "index.html")


@app.route("/style.css")
def style():
    return send_from_directory(".", "style.css")


@app.route("/script.js")
def script():
    return send_from_directory(".", "script.js")


# Get choices for Nation, League and Team
@app.route("/options")
def get_options():

    nations = sorted(
        df["Nation"].astype(str).unique().tolist()
    )

    leagues = sorted(
        df["League"].astype(str).unique().tolist()
    )

    teams = sorted(
        df["Team"].astype(str).unique().tolist()
    )

    return jsonify({
        "nations": nations,
        "leagues": leagues,
        "teams": teams
    })


@app.route("/players")
def get_players():

    data = df.copy()

    position = request.args.get("position", "")

    min_age = get_number(request.args.get("minAge", ""))
    max_age = get_number(request.args.get("maxAge", ""))

    filters = [
        ("OVR", "minOVR"),
        ("PAC", "minPAC"),
        ("SHO", "minSHO"),
        ("PAS", "minPAS"),
        ("DRI", "minDRI"),
        ("DEF", "minDEF"),
        ("PHY", "minPHY"),
        ("Acceleration", "minAcceleration"),
        ("Sprint Speed", "minSprint"),
        ("Finishing", "minFinishing"),
        ("Shot Power", "minShotPower"),
        ("Long Shots", "minLongShots"),
        ("Vision", "minVision"),
        ("Short Passing", "minShortPassing"),
        ("Dribbling", "minDribbling"),
        ("Ball Control", "minBallControl"),
        ("Stamina", "minStamina"),
        ("Strength", "minStrength")
    ]

    if position:
        data = data[
            data["Position"]
            .astype(str)
            .str.upper()
            .str.contains(position.upper(), na=False)
        ]

    age_values = pd.to_numeric(
        data["Age"],
        errors="coerce"
    )

    if min_age is not None:
        data = data[age_values >= min_age]

    if max_age is not None:
        age_values = pd.to_numeric(
            data["Age"],
            errors="coerce"
        )

        data = data[age_values <= max_age]

    for column, parameter in filters:

        value = get_number(
            request.args.get(parameter, "")
        )

        if value is not None:

            column_values = pd.to_numeric(
                data[column],
                errors="coerce"
            )

            data = data[column_values >= value]

    nation = request.args.get("nation", "")
    league = request.args.get("league", "")
    team = request.args.get("team", "")
    preferred_foot = request.args.get("preferredFoot", "")

    if nation:
        data = data[
            data["Nation"].astype(str) == nation
        ]

    if league:
        data = data[
            data["League"].astype(str) == league
        ]

    if team:
        data = data[
            data["Team"].astype(str) == team
        ]

    if preferred_foot:
        data = data[
            data["Preferred foot"]
            .astype(str)
            .str.lower()
            == preferred_foot.lower()
        ]

    data = data.head(100)

    players = []

    for index, row in data.iterrows():

        player = {}

        for column in df.columns:

            value = row[column]

            if pd.isna(value):
                value = ""

            player[column] = str(value)

        player["_index"] = int(index)

        players.append(player)

    return jsonify(players)


if __name__ == "__main__":
    app.run(debug=True)