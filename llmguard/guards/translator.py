from __future__ import annotations

import asyncio
from functools import lru_cache

import argostranslate.package
import argostranslate.translate
from lingua import Language, LanguageDetectorBuilder

# Languages the Input Guard understands. Detection is restricted to this set so
# the detector stays fast and predictable; anything outside it is treated as
# undetectable and left untranslated.
SUPPORTED_LANGUAGES = [
    Language.ENGLISH,
    Language.FRENCH,
    Language.SPANISH,
    Language.ARABIC,
    Language.GERMAN,
    Language.PORTUGUESE,
    Language.ITALIAN,
    Language.DUTCH,
    Language.RUSSIAN,
    Language.CHINESE,
    Language.JAPANESE,
    Language.TURKISH,
]

# Module-level singleton. Low-accuracy mode keeps per-request detection cheap,
# which matters under the Input Guard's sub-second translation budget.
_detector = (
    LanguageDetectorBuilder.from_languages(*SUPPORTED_LANGUAGES)
    .with_low_accuracy_mode()
    .build()
)


@lru_cache(maxsize=1000)
def _cached_translate(text: str, from_code: str) -> str:
    """Translate ``text`` into English, returning it unchanged on any failure.

    Fail open: if the language model is missing or argostranslate raises, the
    caller runs its English patterns against the original text rather than
    blocking. Results (including fail-open passthroughs) are cached.
    """
    try:
        return argostranslate.translate.translate(text, from_code, "en")
    except Exception:
        return text


async def to_english(text: str) -> tuple[str, str | None]:
    """Return ``text`` as English plus the detected source language code.

    The second element is the ISO 639-1 code the text was translated from, or
    ``None`` when the input is already English, undetectable, or translation
    produced no usable change. The translation runs in a worker thread so the
    event loop stays responsive and an ``asyncio.wait_for`` timeout around this
    coroutine can actually fire.
    """
    detected = _detector.detect_language_of(text)
    if detected is None or detected == Language.ENGLISH:
        return (text, None)

    from_code = detected.iso_code_639_1.name.lower()

    translated = await asyncio.to_thread(_cached_translate, text, from_code)
    if not translated or translated == text:
        return (text, None)
    return (translated, from_code)


def ensure_language_models_installed(from_code: str) -> None:
    """Install the ``from_code`` -> ``en`` argostranslate model if missing.

    Safe to call repeatedly: once a pair is installed this returns early. The
    download happens once per language pair, then the model is cached on disk.
    """
    if from_code == "en":
        return

    installed = argostranslate.package.get_installed_packages()
    if any(p.from_code == from_code and p.to_code == "en" for p in installed):
        return

    argostranslate.package.update_package_index()
    available = argostranslate.package.get_available_packages()
    package = next(
        (p for p in available if p.from_code == from_code and p.to_code == "en"),
        None,
    )
    if package is None:
        return
    argostranslate.package.install_from_path(package.download())
