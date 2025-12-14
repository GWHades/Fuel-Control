from __future__ import annotations
from datetime import datetime, timezone
from calendar import monthrange

def quinzena_range(dt: datetime) -> tuple[datetime, datetime, str]:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    year, month, day = dt.year, dt.month, dt.day
    last_day = monthrange(year, month)[1]

    if day <= 15:
        start = datetime(year, month, 1, 0, 0, 0, tzinfo=dt.tzinfo)
        end = datetime(year, month, 15, 23, 59, 59, tzinfo=dt.tzinfo)
        label = f"{year}-{month:02d} (01-15)"
    else:
        start = datetime(year, month, 16, 0, 0, 0, tzinfo=dt.tzinfo)
        end = datetime(year, month, last_day, 23, 59, 59, tzinfo=dt.tzinfo)
        label = f"{year}-{month:02d} (16-{last_day:02d})"
    return start, end, label
