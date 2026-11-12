import base64
import pytest
from app.modules.orders.qr_generator import (
    _crc16_ccitt,
    _tlv,
    build_vietqr_emvco_payload,
    generate_qr_png_data_url,
    normalize_transfer_content,
)


def test_tlv():
    assert _tlv("00", "01") == "000201"
    assert _tlv("53", "704") == "5303704"


def test_crc16_ccitt():
    # Standard check: "123456789" CRC-CCITT (0xFFFF init) is 29B1
    data = b"123456789"
    assert _crc16_ccitt(data) == "29B1"


def test_normalize_transfer_content():
    assert normalize_transfer_content("03") == "BAN 03"
    assert normalize_transfer_content("Bàn 03") == "BAN 03"
    assert normalize_transfer_content("bàn số 12") == "BAN SO 12"
    assert normalize_transfer_content("đặc biệt") == "BAN DAC BIET"
    # Max length <= 25
    long_content = "Một cái bàn rất là dài và nhiều chữ"
    res = normalize_transfer_content(long_content)
    assert len(res) <= 25
    assert res.startswith("BAN ")


def test_build_vietqr_emvco_payload():
    payload = build_vietqr_emvco_payload(
        bank_bin="970432",
        account_no="616108751",
        amount=50000,
        transfer_content="BAN 03",
    )
    assert payload.startswith("00020101021238")
    assert "A000000727" in payload  # NAPAS GUID
    assert "970432" in payload
    assert "616108751" in payload
    assert "5303704" in payload  # VND currency
    assert "540550000" in payload  # 50,000 amount
    assert "5802VN" in payload  # Country VN
    assert "BAN 03" in payload
    assert "6304" in payload
    # Checksum is 4 hex chars at the end
    checksum = payload[-4:]
    assert len(checksum) == 4
    # Verify checksum matches
    body_to_check = payload[:-4].encode("ascii")
    assert _crc16_ccitt(body_to_check) == checksum


def test_generate_qr_png_data_url():
    payload = "00020101021238530010A0000007270123000697043201096161087510208QRIBFTTA53037045405500005802VN62100806BAN 03630477CF"
    data_url = generate_qr_png_data_url(payload)
    assert data_url.startswith("data:image/png;base64,")

    # Decode and check PNG header
    raw_b64 = data_url.replace("data:image/png;base64,", "")
    png_bytes = base64.b64decode(raw_b64)
    png_magic = b"\x89PNG\r\n\x1a\n"
    assert png_bytes[:8] == png_magic
