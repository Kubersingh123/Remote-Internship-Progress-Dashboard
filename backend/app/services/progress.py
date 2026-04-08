from bson import ObjectId


async def calculate_student_progress(db, student_id: str) -> int:
    total = await db.tasks.count_documents({"student_id": ObjectId(student_id)})
    done = await db.tasks.count_documents({"student_id": ObjectId(student_id), "status": "done"})
    progress = 0 if total == 0 else int((done / total) * 100)
    await db.users.update_one({"_id": ObjectId(student_id)}, {"$set": {"progress": progress}})
    return progress
