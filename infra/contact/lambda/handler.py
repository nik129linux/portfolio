"""Contact form backend: validates one JSON message and emails it to the site owner via SES.

CORS is enforced by the Lambda function URL config (see main.tf), so this handler adds no CORS
headers of its own. A hidden "website" field is a honeypot: bots fill it, people never see it.
"""

import json
import os
import re

import boto3

ses = boto3.client("sesv2")
EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
LIMITS = {"name": 100, "email": 200, "message": 4000}


def respond(status: int, body: dict) -> dict:
    return {"statusCode": status, "headers": {"content-type": "application/json"}, "body": json.dumps(body)}


def clean(value: object, limit: int) -> str:
    return str(value or "").strip()[:limit]


def handler(event, _context):
    try:
        data = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return respond(400, {"error": "Invalid JSON."})
    if not isinstance(data, dict):
        return respond(400, {"error": "Invalid body."})

    if data.get("website"):  # honeypot: pretend it worked
        return respond(200, {"ok": True})

    name = clean(data.get("name"), LIMITS["name"])
    email = clean(data.get("email"), LIMITS["email"])
    message = clean(data.get("message"), LIMITS["message"])
    if not name or not message or not EMAIL.match(email):
        return respond(400, {"error": "Name, a valid email and a message are required."})

    owner = os.environ["OWNER_EMAIL"]
    subject = "Portfolio message from " + re.sub(r"[\r\n]+", " ", name)
    ses.send_email(
        FromEmailAddress=owner,
        Destination={"ToAddresses": [owner]},
        ReplyToAddresses=[email],
        Content={
            "Simple": {
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {"Text": {"Data": f"From: {name} <{email}>\n\n{message}", "Charset": "UTF-8"}},
            }
        },
    )
    return respond(200, {"ok": True})
