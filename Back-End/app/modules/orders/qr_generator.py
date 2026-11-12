from __future__ import annotations

import base64
import io
import re
import unicodedata
import qrcode
from qrcode.constants import ERROR_CORRECT_M


def _tlv(tag: str, value: str) -> str:
    return f"{tag}{len(value):02d}{value}"


def _crc16_ccitt(data: bytes) -> str:
    crc = 0xFFFF
    for byte in data:
        crc ^= byte << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def normalize_transfer_content(so_ban: str) -> str:
    no_diacritics = "".join(
        ch for ch in unicodedata.normalize("NFKD", so_ban.replace("đ", "d").replace("Đ", "D"))
        if not unicodedata.combining(ch)
    )
    cleaned = re.sub(r"[^A-Za-z0-9 ]+", " ", no_diacritics).strip().upper()
    cleaned = re.sub(r"\s+", " ", cleaned)
    if cleaned.startswith("BAN "):
        return cleaned[:25]
    return f"BAN {cleaned}"[:25]


def build_vietqr_emvco_payload(
    bank_bin: str,
    account_no: str,
    amount: int,
    transfer_content: str,
) -> str:
    beneficiary = _tlv("00", bank_bin.strip()) + _tlv("01", account_no.strip())
    merchant_account = (
        _tlv("00", "A000000727")
        + _tlv("01", beneficiary)
        + _tlv("02", "QRIBFTTA")
    )
    additional_data = _tlv("08", transfer_content.strip())

    body = "".join(
        [
            _tlv("00", "01"),
            _tlv("01", "12"),
            _tlv("38", merchant_account),
            _tlv("53", "704"),
            _tlv("54", str(int(amount))),
            _tlv("58", "VN"),
            _tlv("62", additional_data),
            "6304",
        ]
    )
    checksum = _crc16_ccitt(body.encode("ascii"))
    return f"{body}{checksum}"


def generate_qr_png_data_url(payload: str) -> str:
    qr = qrcode.QRCode(
        version=None,
        error_correction=ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    b64_png = base64.b64encode(buffer.getvalue()).decode("ascii")
    return f"data:image/png;base64,{b64_png}"
