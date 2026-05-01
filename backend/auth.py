import hashlib
import json
import os
import re
import secrets
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Optional

from eth_account import Account
from eth_account.messages import encode_defunct
from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from pydantic import BaseModel, EmailStr, Field

BASE_DIR = Path(__file__).parent
STORE_PATH = BASE_DIR / "auth_store.json"
SESSION_COOKIE_NAME = "zipzy_session"
SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
CHALLENGE_TTL_SECONDS = 60 * 5

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

router = APIRouter()


class RegisterPayload(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)


class WalletChallengePayload(BaseModel):
    address: str


class WalletLoginPayload(BaseModel):
    address: str
    signature: str


def _ensure_store() -> Dict[str, Any]:
    if not STORE_PATH.exists():
        STORE_PATH.write_text(json.dumps({"users": {}, "sessions": {}, "challenges": {}}, indent=2))
    try:
        raw = json.loads(STORE_PATH.read_text())
    except json.JSONDecodeError:
        raw = {"users": {}, "sessions": {}, "challenges": {}}
    if "users" not in raw:
        raw["users"] = {}
    if "sessions" not in raw:
        raw["sessions"] = {}
    if "challenges" not in raw:
        raw["challenges"] = {}
    return raw


def _persist_store(store: Dict[str, Any]) -> None:
    STORE_PATH.write_text(json.dumps(store, indent=2))


def _hash_password(password: str, salt: Optional[str] = None) -> Dict[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        120000,
    )
    return {"salt": salt, "hash": digest.hex()}


def _verify_password(password: str, salt: str, stored_hash: str) -> bool:
    calculated = _hash_password(password, salt)["hash"]
    return secrets.compare_digest(calculated, stored_hash)


def _normalize_address(address: str) -> str:
    return address.strip().lower()


def _new_user_id() -> str:
    return secrets.token_urlsafe(12)


def _make_public_user(user: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": user["id"],
        "email": user.get("email"),
        "name": user.get("name"),
        "authType": "wallet" if user.get("wallet_address") and not user.get("password_hash") else "password",
        "walletAddress": user.get("wallet_address"),
        "createdAt": user.get("created_at"),
    }


def _create_session_token(user_id: str) -> str:
    return secrets.token_urlsafe(40)


def _clean_expired_sessions(store: Dict[str, Any]) -> None:
    now = int(time.time())
    expired = [token for token, session in store["sessions"].items() if session["expires_at"] <= now]
    for token in expired:
        store["sessions"].pop(token, None)


def _clean_expired_challenges(store: Dict[str, Any]) -> None:
    now = int(time.time())
    expired = [addr for addr, challenge in store["challenges"].items() if challenge["expires_at"] <= now]
    for addr in expired:
        store["challenges"].pop(addr, None)


def _find_user_by_email(store: Dict[str, Any], email: str) -> Optional[Dict[str, Any]]:
    normalized = email.strip().lower()
    for user in store["users"].values():
        if user.get("email") == normalized:
            return user
    return None


def _find_user_by_wallet(store: Dict[str, Any], address: str) -> Optional[Dict[str, Any]]:
    normalized = _normalize_address(address)
    for user in store["users"].values():
        if user.get("wallet_address") == normalized:
            return user
    return None


def _save_user(store: Dict[str, Any], user: Dict[str, Any]) -> None:
    store["users"][user["id"]] = user
    _persist_store(store)


def _create_user(store: Dict[str, Any], name: Optional[str], email: Optional[str], password: Optional[str], wallet_address: Optional[str]) -> Dict[str, Any]:
    if email:
        email = email.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise HTTPException(status_code=400, detail="Invalid email address")
        if _find_user_by_email(store, email):
            raise HTTPException(status_code=400, detail="Email already registered")

    if wallet_address:
        wallet_address = _normalize_address(wallet_address)

    user = {
        "id": _new_user_id(),
        "name": name or "",
        "email": email,
        "password_hash": None,
        "password_salt": None,
        "wallet_address": wallet_address,
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    if password:
        password_data = _hash_password(password)
        user["password_hash"] = password_data["hash"]
        user["password_salt"] = password_data["salt"]
    _save_user(store, user)
    return user


def _create_session(store: Dict[str, Any], user_id: str) -> str:
    token = _create_session_token(user_id)
    now = int(time.time())
    store["sessions"][token] = {
        "user_id": user_id,
        "created_at": now,
        "expires_at": now + SESSION_TTL_SECONDS,
    }
    _persist_store(store)
    _clean_expired_sessions(store)
    return token


def _get_user_from_session(store: Dict[str, Any], token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    _clean_expired_sessions(store)
    session = store["sessions"].get(token)
    if not session or session["expires_at"] <= int(time.time()):
        return None
    return store["users"].get(session["user_id"])


@router.post("/register")
def register(payload: RegisterPayload, response: Response) -> Dict[str, Any]:
    store = _ensure_store()
    if not payload.password or len(payload.password.strip()) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    user = _create_user(store, payload.name, payload.email, payload.password, None)
    token = _create_session(store, user["id"])
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )
    return {"user": _make_public_user(user)}


@router.post("/login")
def login(payload: LoginPayload, response: Response) -> Dict[str, Any]:
    store = _ensure_store()
    user = _find_user_by_email(store, payload.email)
    if not user or not user.get("password_hash"):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not _verify_password(payload.password, user["password_salt"], user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _create_session(store, user["id"])
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )
    return {"user": _make_public_user(user)}


@router.post("/logout")
def logout(response: Response, session_token: Optional[str] = Cookie(None)) -> Dict[str, Any]:
    store = _ensure_store()
    if session_token and session_token in store["sessions"]:
        store["sessions"].pop(session_token, None)
        _persist_store(store)
    response.delete_cookie(SESSION_COOKIE_NAME, path="/")
    return {"success": True}


@router.get("/session")
def session(session_token: Optional[str] = Cookie(None)) -> Dict[str, Any]:
    store = _ensure_store()
    user = _get_user_from_session(store, session_token)
    if not user:
        return {"user": None}
    return {"user": _make_public_user(user)}


def _create_challenge(store: Dict[str, Any], address: str) -> str:
    normalized = _normalize_address(address)
    message = f"Zipzy wallet login challenge for {normalized} at {datetime.utcnow().isoformat()}"
    store["challenges"][normalized] = {
        "message": message,
        "expires_at": int(time.time()) + CHALLENGE_TTL_SECONDS,
    }
    _persist_store(store)
    return message


def _verify_challenge(store: Dict[str, Any], address: str, signature: str) -> Dict[str, Any]:
    normalized = _normalize_address(address)
    challenge = store["challenges"].get(normalized)
    if not challenge or challenge["expires_at"] <= int(time.time()):
        raise HTTPException(status_code=400, detail="Challenge expired or missing")

    message = encode_defunct(text=challenge["message"])
    try:
        recovered = Account.recover_message(message, signature=signature)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid wallet signature")

    if _normalize_address(recovered) != normalized:
        raise HTTPException(status_code=400, detail="Signature does not match wallet address")

    store["challenges"].pop(normalized, None)
    _persist_store(store)
    return _find_user_by_wallet(store, normalized) or _create_user(store, None, None, None, normalized)


@router.post("/wallet/challenge")
def wallet_challenge(payload: WalletChallengePayload) -> Dict[str, Any]:
    store = _ensure_store()
    if not payload.address or len(payload.address.strip()) < 10:
        raise HTTPException(status_code=400, detail="Invalid wallet address")

    challenge = _create_challenge(store, payload.address)
    return {"challenge": challenge}


@router.post("/wallet/login")
def wallet_login(payload: WalletLoginPayload, response: Response) -> Dict[str, Any]:
    store = _ensure_store()
    user = _verify_challenge(store, payload.address, payload.signature)
    token = _create_session(store, user["id"])
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=SESSION_TTL_SECONDS,
        path="/",
    )
    return {"user": _make_public_user(user)}
