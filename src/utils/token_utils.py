"""Token-related utility functions."""

from typing import Iterable, Any


def approximate_token_count(text: str) -> int:
    """Approximate the number of tokens in ``text`` using word count."""
    return len(text.split())


def trim_messages_to_tokens(
    messages: Iterable[Any],
    max_tokens: int,
    reserve_tokens: int = 1024,
) -> list[Any]:
    """Trim messages to fit within a maximum token limit.

    Older messages are discarded first. ``reserve_tokens`` allows space for the
    model response so the input does not exceed the context window.
    """
    allowed_tokens = max_tokens - reserve_tokens
    trimmed: list[Any] = []
    total_tokens = 0
    for msg in reversed(list(messages)):
        content = ""
        if isinstance(msg, dict):
            content = str(msg.get("content", ""))
        else:
            content = str(getattr(msg, "content", ""))
        token_count = approximate_token_count(content)
        if total_tokens + token_count > allowed_tokens:
            continue
        trimmed.append(msg)
        total_tokens += token_count
    return list(reversed(trimmed))

