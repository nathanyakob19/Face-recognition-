Here's the **updated `README.md`** file including **user registration** functionality:

---

### ✅ `README.md`

````markdown
# 👁️ Face Recognition Login & Registration System with Admin/User Dashboard

A full-stack web application using **React.js** and **Flask** that enables users to **register and log in using facial recognition**. The app features two separate dashboards for **admins** and **users**, and includes attendance tracking, login history, and task assignment.

---

## 📌 Features

- 👤 **Face Recognition-based Registration**
- 🔐 **Login via Facial Recognition**
- 🧑‍💼 **Admin Dashboard**
  - View & manage users
  - Assign tasks
  - View login histories
- 🧑‍💻 **User Dashboard**
  - View assigned tasks
  - Track attendance
  - View login history
- 🌐 **IP-based User Identification**
- 📊 **Task & Attendance Monitoring**
- 💾 **MySQL Database Integration**

---

## 🛠️ Tech Stack

### 🔹 Frontend:
- React.js
- React Router
- Bootstrap 5

### 🔹 Backend:
- Python
- Flask
- OpenCV (Face Recognition)
- MySQL

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/face-recognition-login.git
cd face-recognition-login
````

---

### 2. Backend Setup (Flask + MySQL)

* Install dependencies:

```bash
pip install -r backend/requirements.txt
```

* Update `config.py` with your MySQL credentials.
* Ensure the database and required tables are set up.
* Start the Flask server:

```bash
cd backend
python app.py
```

---

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm start
```

---

## 🧪 How It Works

1. **Registration**:

   * User captures their face.
   * Their name, department, and region are stored in the database with facial data.

2. **Login**:

   * System captures the current face.
   * If it matches a stored face, user is authenticated.

3. **Post-Login Routing**:

   * `Admin ➡️ AdminDashboard`
   * `User ➡️ UserDashboard`

4. **Admin Capabilities**:

   * Assign tasks
   * Track all login histories

5. **User Capabilities**:

   * View own tasks, attendance, and login history

---

## 📂 Project Structure

```
📁 backend
   ├── app.py
   ├── routes/
   ├── models/
   ├── database/
   └── face_data/

📁 frontend
   ├── src/
   │   ├── components/
   │   ├── App.js
   │   ├── Login.jsx
   │   ├── Register.jsx
   │   └── ...
   └── public/

README.md
```

---

## 📸 Screenshots

> Add screenshots for:
>
> * Registration page
> * Login screen
> * Admin dashboard
> * User dashboard

---

## 🙋‍♂️ Author

* **Nathan Yakob**
* GitHub: @nathanyakob19

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```

---

Let me know if you also want to include example `config.py`, `requirements.txt`, or database schema setup.
```
