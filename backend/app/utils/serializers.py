from datetime import datetime

from bson import ObjectId


def serialize_document(value):
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_document(item) for item in value]
    if isinstance(value, dict):
        serialized = {}
        for key, item in value.items():
            if key == "_id":
                serialized["id"] = str(item)
            else:
                serialized[key] = serialize_document(item)
        return serialized
    return value
