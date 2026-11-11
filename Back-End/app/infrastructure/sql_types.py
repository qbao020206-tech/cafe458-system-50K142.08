from enum import StrEnum

from sqlalchemy import Enum


def enum_column(enum_type: type[StrEnum], name: str, *, length: int) -> Enum:
    """Persist documented enum labels as strings, with a database check constraint."""
    return Enum(
        enum_type,
        name=name,
        native_enum=False,
        create_constraint=True,
        length=length,
        values_callable=lambda values: [item.value for item in values],
    )
