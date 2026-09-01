import os
import json
from flask import Flask, redirect, request, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google_auth_oauthlib.flow import Flow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import google.oauth2.credentials

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ["FLASK_SECRET_KEY"]
CORS(app, supports_credentials=True)

# Necesario para desarrollo local: permite que oauthlib no exija HTTPS
os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

SCOPES = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.student-submissions.me.readonly",
]

DIRECTORIO_BASE = os.path.dirname(os.path.abspath(__file__))
CLIENT_SECRETS_FILE = os.path.join(DIRECTORIO_BASE, "client_secret.json")
REDIRECT_URI = "http://localhost:5050/oauth2callback"
TOKEN_FILE = os.path.join(DIRECTORIO_BASE, "token.json")


def cargar_credenciales():
    if not os.path.exists(TOKEN_FILE):
        return None
    with open(TOKEN_FILE) as archivo:
        datos = json.load(archivo)
    credenciales = google.oauth2.credentials.Credentials(**datos)
    if credenciales.expired and credenciales.refresh_token:
        credenciales.refresh(Request())
        guardar_credenciales(credenciales)
    return credenciales


def guardar_credenciales(credenciales):
    with open(TOKEN_FILE, "w") as archivo:
        json.dump(
            {
                "token": credenciales.token,
                "refresh_token": credenciales.refresh_token,
                "token_uri": credenciales.token_uri,
                "client_id": credenciales.client_id,
                "client_secret": credenciales.client_secret,
                "scopes": credenciales.scopes,
            },
            archivo,
        )


@app.route("/login")
def login():
    flujo = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE, scopes=SCOPES, redirect_uri=REDIRECT_URI
    )
    url_autorizacion, estado = flujo.authorization_url(
        access_type="offline", prompt="consent"
    )
    session["estado"] = estado
    session["code_verifier"] = flujo.code_verifier
    return redirect(url_autorizacion)


@app.route("/oauth2callback")
def oauth2callback():
    flujo = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI,
        state=session["estado"],
    )
    flujo.code_verifier = session["code_verifier"]
    flujo.fetch_token(authorization_response=request.url)
    guardar_credenciales(flujo.credentials)
    return redirect("http://localhost:3000")


@app.route("/api/tareas")
def tareas():
    credenciales = cargar_credenciales()
    if credenciales is None:
        return jsonify({"error": "no_autenticado"}), 401

    servicio = build("classroom", "v1", credentials=credenciales)
    cursos = servicio.courses().list(courseStates=["ACTIVE"]).execute().get("courses", [])

    tareas_totales = []
    for curso in cursos:
        trabajos = (
            servicio.courses()
            .courseWork()
            .list(courseId=curso["id"])
            .execute()
            .get("courseWork", [])
        )
        for trabajo in trabajos:
            entregas = (
                servicio.courses()
                .courseWork()
                .studentSubmissions()
                .list(courseId=curso["id"], courseWorkId=trabajo["id"], userId="me")
                .execute()
                .get("studentSubmissions", [])
            )
            estado = entregas[0]["state"] if entregas else "CREATED"
            tareas_totales.append(
                {
                    "curso": curso["name"],
                    "titulo": trabajo["title"],
                    "descripcion": trabajo.get("description", ""),
                    "puntos": trabajo.get("maxPoints"),
                    "vencimiento": trabajo.get("dueDate"),
                    "estado": estado,
                    "link": trabajo.get("alternateLink"),
                }
            )

    return jsonify(tareas_totales)


if __name__ == "__main__":
    app.run(port=5050, debug=True)