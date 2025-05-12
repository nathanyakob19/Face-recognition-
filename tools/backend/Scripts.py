import face_recognition
import cv2
import numpy as np
import os
from flask import Flask, request, send_from_directory, jsonify
from flask_cors import CORS
import mysql.connector as conn
from datetime import datetime

app = Flask(__name__, static_folder="../frontend/build", static_url_path="/")
CORS(app)

db = []
known_path = os.path.join(os.getcwd(), "Images/Known_faces/")
unknown_path = os.path.join(os.getcwd(), "Images/Unknown_faces/")

def get_data():
    global db
    db.clear()
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()
    cursor.execute('SELECT id, name, encoding FROM register')
    result = cursor.fetchall()
    for row in result:
        id, name, encoding_str = row
        encoding_str = encoding_str[1:-2]
        nums = [float(x.strip()) for x in encoding_str.split(',')]
        db.append([id, name, nums])
    cursor.close()
    con.close()

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

@app.route('/register', methods=['GET'])
def register():
    name = request.args.get("name")
    if not name:
        return "Missing name", 400

    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()
    sql_insert = 'INSERT INTO register (name, encoding) VALUES (%s, %s)'

    video_capture = cv2.VideoCapture(0)
    frame = None

    while True:
        ret, frame = video_capture.read()
        if not ret or frame is None:
            continue

        cv2.imshow('Press Q to Capture and Register', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    video_capture.release()
    cv2.destroyAllWindows()

    if frame is None:
        return "Error: Could not capture image."

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    if not face_encodings:
        return "No face detected. Try again in better lighting."

    encoding = ",".join(str(list(i)) for i in face_encodings)
    cursor.execute(sql_insert, (name, encoding))
    con.commit()
    inserted_id = cursor.lastrowid

    cursor.close()
    con.close()
    return jsonify({"message": "Face registered", "id": inserted_id, "name": name})

@app.route('/register/details', methods=['POST'])
def register_details():
    data = request.get_json()
    id = data.get("id")
    department = data.get("department")
    region = data.get("region")

    if not all([id, department, region]):
        return "Missing data", 400

    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()
    cursor.execute('UPDATE register SET department = %s, region = %s WHERE id = %s', (department, region, id))
    con.commit()
    cursor.close()
    con.close()
    return "Details updated successfully"

from flask import request  # make sure this is at the top

@app.route("/login")
def login():
    get_data()
    if not db:
        return jsonify({"error": "You are unknown. First register yourself."}), 404

    known_face_encodings = [i[2] for i in db]
    known_face_ids = [i[0] for i in db]
    known_face_names = [i[1] for i in db]

    video_capture = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    frame = None

    while True:
        ret, frame = video_capture.read()
        if not ret or frame is None:
            continue

        cv2.imshow('Press Q to Capture and Login', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    if frame is None:
        return jsonify({"error": "Error: Failed to capture image."}), 500

    small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
    rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_small_frame)
    face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)

    msg = {"name": "Unknown", "redirect": "/unauthorized"}

    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)

        if matches[best_match_index]:
            user_id = known_face_ids[best_match_index]

            con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
            cursor = con.cursor(dictionary=True)

            ip_address = request.headers.get('X-Forwarded-For', request.remote_addr)
            if ',' in ip_address:
                ip_address = ip_address.split(',')[0].strip()

            cursor.execute(
                'INSERT INTO login_history (user_id, time, ip_address) VALUES (%s, %s, %s)',
                (user_id, datetime.now(), ip_address)
            )
            con.commit()

            cursor.execute('SELECT name, department, region FROM register WHERE id = %s', (user_id,))
            row = cursor.fetchone()

            if row and row['department']:
                department = row['department'].lower()
                msg = {
                    "id": user_id,
                    "name": row['name'],
                    "department": row['department'],
                    "region": row['region'],
                    "redirect": "/admin" if department == "admindashboard" else "/UserDashboard"
                }

            cursor.close()
            con.close()
            break

    os.makedirs(unknown_path, exist_ok=True)
    rand_no = np.random.random_sample()
    cv2.imwrite(os.path.join(unknown_path, f"{rand_no}.jpg"), frame)

    video_capture.release()
    cv2.destroyAllWindows()
    return jsonify(msg)


@app.route("/UserDashboard/<int:user_id>")
def user_dashboard(user_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)

    cursor.execute('SELECT name, department, region FROM register WHERE id = %s', (user_id,))
    user = cursor.fetchone()

    cursor.execute('SELECT time FROM login_history WHERE user_id = %s ORDER BY time DESC LIMIT 10', (user_id,))
    history = [row['time'].strftime('%Y-%m-%d %I:%M %p') for row in cursor.fetchall()]

    cursor.execute('SELECT present_days, total_days FROM attendance WHERE user_id = %s', (user_id,))
    row = cursor.fetchone()
    attendance = {
        "totalDays": row['total_days'] if row else 0,
        "present": row['present_days'] if row else 0,
        "absent": (row['total_days'] - row['present_days']) if row else 0
    }

    cursor.execute('SELECT id, task, status, task_image_url FROM tasks WHERE user_id = %s', (user_id,))
    tasks = []
    for task in cursor.fetchall():
        task['task_image_url'] = f"http://localhost:5000/static/images/{task['task_image_url']}" if task['task_image_url'] else None
        tasks.append(task)

    cursor.close()
    con.close()

    return jsonify({
        "user": user,
        "login_history": history,
        "attendance": attendance,
        "tasks": tasks
    })

# ✅ ADMIN API: Get all users
@app.route("/all-users")
def all_users():
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)
    cursor.execute('SELECT id, name, department, region FROM register')
    users = cursor.fetchall()
    cursor.close()
    con.close()
    return jsonify(users)
from flask import session, jsonify

@app.route("/AdminDashboard/<int:admin_id>")
def admin_dashboard(admin_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)

    cursor.execute('SELECT name, department, region FROM register WHERE id = %s AND department = "admin"', (admin_id,))
    admin = cursor.fetchone()

    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    cursor.execute('SELECT time FROM login_history WHERE user_id = %s ORDER BY time DESC LIMIT 10', (admin_id,))
    history = [row['time'].strftime('%Y-%m-%d %I:%M %p') for row in cursor.fetchall()]

    cursor.execute('SELECT COUNT(*) AS user_count FROM register WHERE department != "admin"')
    total_users = cursor.fetchone()['user_count']

    cursor.execute('SELECT COUNT(*) AS task_count FROM tasks')
    total_tasks = cursor.fetchone()['task_count']

    cursor.close()
    con.close()

    return jsonify({
        "admin": admin,
        "login_history": history,
        "stats": {
            "total_users": total_users,
            "total_tasks": total_tasks
        }
    })

# ✅ ADMIN API: Edit a user
@app.route("/edit-user/<int:user_id>", methods=['POST'])
def edit_user(user_id):
    data = request.get_json()
    name = data.get("name")
    department = data.get("department")
    region = data.get("region")

    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()
    cursor.execute('UPDATE register SET name=%s, department=%s, region=%s WHERE id=%s', (name, department, region, user_id))
    con.commit()
    cursor.close()
    con.close()
    return jsonify({"message": "User updated successfully."})

# ✅ ADMIN API: Assign a task
@app.route("/assign-task", methods=['POST'])
def assign_task():
    data = request.get_json()
    user_id = data.get("user_id")
    task = data.get("task")
    status = data.get("status", "Pending")

    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()
    cursor.execute('INSERT INTO tasks (user_id, task, status) VALUES (%s, %s, %s)', (user_id, task, status))
    con.commit()
    cursor.close()
    con.close()
    return jsonify({"message": "Task assigned successfully."})

# ✅ New API: Get user tasks
@app.route("/get-tasks/<int:user_id>")
def get_tasks(user_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)
    cursor.execute('SELECT id, task, status FROM tasks WHERE user_id = %s', (user_id,))
    tasks = cursor.fetchall()
    cursor.close()
    con.close()
    return jsonify(tasks)

# ✅ New API: Get full attendance records
@app.route("/get-attendance/<int:user_id>")
def get_attendance(user_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)
    cursor.execute('SELECT  user_id, total_days, present_days FROM attendance WHERE user_id = %s', (user_id,))
    attendance = cursor.fetchall()
    cursor.close()
    con.close()
    return jsonify(attendance)

# ✅ New API: Get login history timestamps
@app.route("/get-login-history/<int:user_id>")
def get_login_history(user_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)

    cursor.execute('SELECT id, user_id, time, ip_address  FROM login_history WHERE user_id = %s ORDER BY time DESC', (user_id,))
    history = cursor.fetchall()

    cursor.close()
    con.close()

    return jsonify(history)
#✅ ADMIN API: Edit a task status
@app.route('/update-task-status', methods=['POST'])
def update_task_status():
    data = request.get_json()
    task_id = data.get('task_id')
    new_status = data.get('status')
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)

    cursor.execute('UPDATE tasks SET status = %s WHERE id = %s', (new_status, task_id))
    con.commit()

    cursor.close()
    con.close()

    return jsonify({'message': 'Task status updated successfully'}), 200
@app.route('/login-history', methods=['GET'])
def get_all_login_history():
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor(dictionary=True)

    cursor.execute('SELECT id, user_id, time, ip_address FROM login_history ORDER BY time DESC LIMIT 20')
    history = [{
    "id": row['id'],
    "user_id": row['user_id'],
    "login_time": row['time'].strftime('%Y-%m-%d %I:%M %p'),
    "ip_address": row['ip_address']  } for row in cursor.fetchall()]


    return jsonify(history)
@app.route('/delete-login-history/<int:login_id>', methods=['DELETE'])
def delete_login_history(login_id):
    con = conn.connect(host='localhost', database='face', user='root', password='Simba@123', charset='utf8', port=3306)
    cursor = con.cursor()

    cursor.execute("DELETE FROM login_history WHERE id = %s", (login_id,))
    con.commit()

    return jsonify({"message": "Login entry deleted successfully"})
@app.route('/delete-user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    con = conn.connect(
        host='localhost',
        database='face',
        user='root',
        password='Simba@123',
        charset='utf8',
        port=3306
    )
    cursor = con.cursor()

    # Delete tasks assigned to the user
    cursor.execute("DELETE FROM tasks WHERE user_id = %s", (user_id,))

    # Delete login history related to the user
    cursor.execute("DELETE FROM login_history WHERE user_id = %s", (user_id,))
    cursor.execute("DELETE FROM attendance WHERE user_id = %s", (user_id,))

    # Delete the user
    cursor.execute("DELETE FROM register WHERE id = %s", (user_id,))
    con.commit()
    cursor.close()
    con.close()

    return jsonify({'message': 'User and related data deleted successfully'}), 200






if __name__ == '__main__':
    app.run(debug=True)
