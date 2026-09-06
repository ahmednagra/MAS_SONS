# app/Core/Storage/storage_constants.py
# Storage-related constants — resource bounds enforced at the trust boundary (every purpose here is reachable from an unauthenticated public form).
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024

ALLOWED_CONTENT_TYPES: dict[str, set[str]] = {
    "identity_document": {"image/jpeg", "image/png", "application/pdf"},
    "review_photo": {"image/jpeg", "image/png", "image/webp"},
    "buyback_lead_photo": {"image/jpeg", "image/png", "image/webp"},
    # Staff-only (admin stock endpoints -> UploadService.attach_unit_*).
    "unit_photo": {"image/jpeg", "image/png", "image/webp"},
    "auction_sheet": {"application/pdf", "image/jpeg", "image/png"},
}
