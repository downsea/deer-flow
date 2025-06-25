"""Utility functions for working with chat messages."""
from __future__ import annotations

from typing import Any


def sanitize_messages(messages: list) -> list:
    """Replace ``None`` content with an empty string.

    Some language model providers (e.g. the OpenAI compatible Gemini API)
    reject messages whose ``content`` field is ``null``. Tool call messages
    created by upstream libraries may have ``content=None`` which leads to a
    ``400`` response (``Expected string or list of content parts, got: null``).
    This helper normalises such messages before they are sent to the model.
    """

    sanitized: list[Any] = []
    for msg in messages:
        if isinstance(msg, dict):
            if msg.get("content") is None:
                msg = {**msg, "content": ""}
            sanitized.append(msg)
            continue

        content = getattr(msg, "content", None)
        if content is None:
            try:
                msg.content = ""
            except Exception:
                try:
                    attrs = msg.__dict__.copy()
                    attrs["content"] = ""
                    msg = msg.__class__(**attrs)
                except Exception:
                    pass
        sanitized.append(msg)

    return sanitized
