import datetime
from sqlalchemy.types import TypeDecorator, DateTime

class UTCDateTime(TypeDecorator):
    """
    TypeDecorator that enforces timezone-aware UTC datetimes.
    Ensures naive datetimes are treated as UTC, and aware datetimes are converted to UTC,
    both on binding parameters (saving) and processing results (reading).
    """
    impl = DateTime(timezone=True)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is not None:
            if not isinstance(value, datetime.datetime):
                raise TypeError(f"Expected datetime.datetime, got {type(value)}")
            if value.tzinfo is None:
                value = value.replace(tzinfo=datetime.timezone.utc)
            else:
                value = value.astimezone(datetime.timezone.utc)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            if value.tzinfo is None:
                value = value.replace(tzinfo=datetime.timezone.utc)
            else:
                value = value.astimezone(datetime.timezone.utc)
        return value
