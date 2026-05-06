from dataclasses import dataclass


@dataclass(frozen=True)
class Username:
    value: str

    def __post_init__(self) -> None:
        if not self.value or not self.value.strip():
            raise ValueError("Invalid username")
