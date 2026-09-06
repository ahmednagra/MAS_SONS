# app/Services/Notifications/Email/TemplateRenderer.py
# Jinja2 template rendering (emailsubsystem.md §4).
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, StrictUndefined, select_autoescape

_TEMPLATES_DIR = Path(__file__).resolve().parents[3] / "Templates" / "emails"

_env = Environment(
    loader=FileSystemLoader(str(_TEMPLATES_DIR)),
    autoescape=select_autoescape(["html"]),
    undefined=StrictUndefined,
)


class TemplateRenderer:
    @staticmethod
    def render(template_name: str, context: dict) -> tuple[str, str]:
        html = _env.get_template(f"{template_name}.html").render(**context)
        text = _env.get_template(f"{template_name}.txt").render(**context)
        return html, text
